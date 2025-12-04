// src/Renderer/Views/Agendamento/listar/AgendamentoListar.js

const html = `
    <div style="margin-top: 20px;">
        <h3>Lista de Agendamentos</h3>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f0f0f0;">
                    <th style="padding: 8px; border: 1px solid #ddd;">Data/Hora</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Paciente</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Profissional</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Status</th>
                    <th style="padding: 8px; border: 1px solid #ddd;">Ações</th>
                </tr>
            </thead>
            <tbody id="lista-agendamentos"></tbody>
        </table>
    </div>
`;

async function init() {
    const listaEl = document.getElementById('lista-agendamentos');

    if (!window.api) return console.error("API não encontrada!");

    async function carregarTabela() {
        try {
            const agendamentos = await window.api.listarAgendamentos();
            
            // Se vier vazio
            if(agendamentos.length === 0) {
                listaEl.innerHTML = "<tr><td colspan='5' style='padding:10px; text-align:center'>Nenhum agendamento encontrado.</td></tr>";
                return;
            }

            listaEl.innerHTML = agendamentos.map(a => `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${new Date(a.data_agendamento).toLocaleString()}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${a.nome_paciente || '---'}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${a.nome_profissional || '---'}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${a.status_consulta}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
                        <button class="btn-editar" data-id="${a.id_agendamento}" style="cursor:pointer; margin-right: 5px;">✏️</button>
                        
                        <button class="btn-excluir" data-id="${a.id_agendamento}" style="cursor:pointer;">🗑️</button>
                    </td>
                </tr>
            `).join('');

            // --- EVENTOS DO BOTÃO EXCLUIR ---
            document.querySelectorAll('.btn-excluir').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if(confirm('Tem certeza que deseja excluir?')) {
                        await window.api.removerAgendamento(id);
                        carregarTabela(); 
                    }
                });
            });

            // --- EVENTOS DO BOTÃO EDITAR (NOVO!) ---
            document.querySelectorAll('.btn-editar').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.target.getAttribute('data-id');
                    
                    // Chama a função global que criamos no AgendamentoForm.js
                    if(window.preencherFormularioParaEdicao) {
                        window.preencherFormularioParaEdicao(id);
                        
                        // Opcional: Rolar a página para cima para ver o formulário
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        console.error("Função de edição não encontrada.");
                    }
                });
            });

        } catch (erro) {
            console.error("Erro ao listar:", erro);
            listaEl.innerHTML = "<tr><td colspan='5'>Erro ao carregar dados.</td></tr>";
        }
    }

    carregarTabela();
    window.atualizarListaAgendamentos = carregarTabela;
}

export default { html, init };