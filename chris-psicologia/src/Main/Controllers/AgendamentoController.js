import Agendamentos from '../Models/Agendamento.js';
import db from '../Database/db.js'; // <--- ADICIONE ESSE IMPORT

class AgendamentoController {
    constructor() {
        this.agendamentoModel = new Agendamentos();
    }

    // ... (mantenha seus métodos listar, cadastrar, atualizar, remover...)

    // --- ADICIONE ESTE NOVO MÉTODO ---
    async getDadosAuxiliares() {
        try {
            // Busca apenas usuários do tipo 'cliente' para o select de Pacientes
            const pacientes = db.prepare("SELECT id_usuario, nome_usuario FROM usuario WHERE tipo_usuario = 'cliente'").all();
            
            // Busca profissionais juntando com a tabela de usuários para pegar o nome
            const profissionais = db.prepare(`
                SELECT p.id_profissional, u.nome_usuario 
                FROM profissional p
                JOIN usuario u ON p.id_usuario = u.id_usuario
            `).all();

            return { pacientes, profissionais };
        } catch (erro) {
            console.error("Erro ao buscar dados auxiliares:", erro);
            return { pacientes: [], profissionais: [] };
        }
    }
}

export default AgendamentoController;