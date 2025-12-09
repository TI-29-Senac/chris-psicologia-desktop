// src/Renderer/Views/Agendamento/listar/AgendamentoListar.js

const html = `
    <div class="card">
        <h3>Agendamentos Recentes</h3>
        
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>Data/Hora</th>
                        <th>Paciente</th>
                        <th>Profissional</th>
                        <th class="text-center">Status</th>
                        <th class="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody id="lista-agendamentos"></tbody>
            </table>
        </div>
    </div>
`;

async function init() {
    const listaEl = document.getElementById('lista-agendamentos');

    // Verificação de segurança
    if (!window.electronAPI) return console.error("API não encontrada!");

    async function carregarTabela() {
        try {
            const agendamentos = await window.electronAPI.listarAgendamentos();
            
            // Se vier vazio
            if(agendamentos.length === 0) {
                listaEl.innerHTML = "<tr><td colspan='5' class='text-center' style='padding:30px'>Nenhum agendamento encontrado.</td></tr>";
                return;
            }

            // Gera as linhas da tabela
            listaEl.innerHTML = agendamentos.map(a => {
                const isCancelado = a.status_consulta === 'Cancelado';
                
                // Define classes de estilo baseadas no status (CSS)
                const badgeClass = isCancelado ? 'status-cancelado' : 'status-agendado';
                
                // Formatação de Data e Hora separadas
                const dataObj = new Date(a.data_agendamento);
                const dataStr = dataObj.toLocaleDateString('pt-BR');
                const horaStr = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

                return `
                <tr>
                    <td>
                        <strong>${dataStr}</strong><br>
                        <span class="small-text">${horaStr}</span>
                    </td>
                    <td>${a.nome_paciente || '---'}</td>
                    <td>${a.nome_profissional || '---'}</td>
                    <td class="text-center">
                        <span class="status-badge ${badgeClass}">
                            ${a.status_consulta}
                        </span>
                    </td>
                    <td class="text-center" style="white-space: nowrap;">
                        ${!isCancelado ? `
                            <button class="action-btn btn-edit" data-id="${a.id_agendamento}" title="Editar">✏️</button>
                            
                            <button class="action-btn btn-cancel" data-id="${a.id_agendamento}" title="Desmarcar consulta">🚫</button>
                        ` : ''}
                        
                        <button class="action-btn btn-delete" data-id="${a.id_agendamento}" title="Excluir registro">🗑️</button>
                    </td>
                </tr>
            `}).join('');

            // --- ADICIONA OS EVENTOS AOS BOTÕES ---
            adicionarEventos();

        } catch (erro) {
            console.error("Erro ao listar:", erro);
            listaEl.innerHTML = "<tr><td colspan='5' class='text-center'>Erro ao carregar dados.</td></tr>";
        }
    }

    function adicionarEventos() {
        // 1. Botão EXCLUIR
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                // Pega o ID do botão ou do ícone dentro dele
                const target = e.target.closest('button'); 
                const id = target.getAttribute('data-id');
                
                if(confirm('Tem certeza que deseja apagar este registro do histórico?')) {
                    await window.electronAPI.removerAgendamento(id);
                    carregarTabela(); 
                }
            });
        });

        // 2. Botão EDITAR
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                const id = target.getAttribute('data-id');
                
                if(window.preencherFormularioParaEdicao) {
                    window.preencherFormularioParaEdicao(id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });

        // 3. Botão CANCELAR / DESMARCAR (Novo)
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const target = e.target.closest('button');
                const id = target.getAttribute('data-id');

                if(confirm('Deseja desmarcar esta consulta? O horário ficará livre.')) {
                    // Chama a função que criamos no preload/controller
                    if(window.electronAPI.cancelarAgendamento) {
                        await window.electronAPI.cancelarAgendamento(id);
                        carregarTabela();
                    } else {
                        alert("Função de cancelar não configurada no sistema.");
                    }
                }
            });
        });
    }

    // Carrega a tabela ao iniciar
    carregarTabela();
    
    // Expõe globalmente para o formulário chamar após salvar
    window.atualizarListaAgendamentos = carregarTabela;
}

export default { html, init };