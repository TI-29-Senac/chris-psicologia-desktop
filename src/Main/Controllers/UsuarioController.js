import { ipcMain } from 'electron';
import UsuarioModel from '../Models/Usuario.js';
import AgendamentoModel from '../Models/Agendamento.js';
import PagamentoModel from '../Models/Pagamento.js';

class UsuarioController {

    constructor() {
        this.usuarioModel = new UsuarioModel();
    }

    /**
     * Inicializa os ouvintes do IPC.
     * Mapeia as chamadas do frontend (preload) para os métodos do backend (controller).
     */
    init() {
        // Remove handlers existentes para evitar erros de duplicidade ao reiniciar
        ipcMain.removeHandler('usuarios:cadastrar');
        ipcMain.removeHandler('usuarios:listar');
        ipcMain.removeHandler('usuarios:buscarPorId');
        ipcMain.removeHandler('usuarios:editar');
        ipcMain.removeHandler('usuarios:excluir');
        ipcMain.removeHandler('usuarios:sincronizarBidirecional');

        // Registra os handlers conforme as definições do seu preload.js
        ipcMain.handle('usuarios:cadastrar', async (event, dados) => await this.cadastrar(dados));
        ipcMain.handle('usuarios:listar', async () => await this.listar());
        ipcMain.handle('usuarios:buscarPorId', async (event, id) => await this.buscarPorId(id));
        ipcMain.handle('usuarios:editar', async (event, dados) => await this.editar(dados));
        ipcMain.handle('usuarios:excluir', async (event, id) => await this.excluir(id));
        ipcMain.handle('usuarios:sincronizarBidirecional', async () => await this.sincronizarTudo());
    }

    async sincronizarTudo() {
        try {
            console.log("=== INICIANDO SINCRONIZAÇÃO GLOBAL ===");

            // 1. Agendamentos (Este método já chama Usuários internamente)
            const agendamentoModel = new AgendamentoModel();
            const resAgendamento = await agendamentoModel.sincronizacaoBidirecional();

            if (!resAgendamento.success) {
                console.warn("Sync Agendamentos falhou:", resAgendamento.erro);
                // Continua para tentar pagamentos ou para? Melhor parar ou avisar.
                return resAgendamento;
            }

            // 2. Pagamentos
            const pagamentoModel = new PagamentoModel();
            const resPagamento = await pagamentoModel.sincronizacaoBidirecional();

            if (!resPagamento.success) {
                return resPagamento;
            }

            return { success: true, message: "Todos os dados (Usuários, Agendamentos e Pagamentos) foram sincronizados." };

        } catch (error) {
            console.error("Erro na Sincronização Global:", error);
            return { success: false, erro: error.message };
        }
    }

    async listar() {
        try {
            return await this.usuarioModel.listar();
        } catch (error) {
            console.error("Erro no Controller (listar):", error);
            return [];
        }
    }

    async buscarPorId(id) {
        try {
            return await this.usuarioModel.buscarPorId(id);
        } catch (error) {
            console.error("Erro no Controller (buscarPorId):", error);
            return null;
        }
    }

    async cadastrar(dados) {
        console.log(dados)
        try {
            // Validação usando os novos nomes padronizados
            if (!dados.nome_usuario || !dados.email_usuario || !dados.senha_usuario) {
                return { success: false, erro: "Campos obrigatórios faltando (nome_usuario, email_usuario ou senha_usuario)." };
            }

            // Repassa para o Model que utiliza o FetchAPI
            return await this.usuarioModel.cadastrar(dados);
        } catch (erro) {
            console.error("Erro no Controller Desktop:", erro);
            return { success: false, erro: erro.message };
        }
    }

    async editar(dados) {
        if (!dados.id_usuario) return { success: false, erro: "ID ausente." };
        return await this.usuarioModel.editar(dados);
    }

    async excluir(id) {
        if (!id) return { success: false, erro: "ID ausente." };
        return await this.usuarioModel.excluir(id);
    }
}

export default UsuarioController;