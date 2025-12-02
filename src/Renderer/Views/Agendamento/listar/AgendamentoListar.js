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

    // Verifica API
    if (!window.api) return console.error("API não encontrada!");

    async function carregarTabela() {
        try {
            const agendamentos = await window.api.listarAgendamentos();
            
            listaEl.innerHTML = agendamentos.map(a => `
                <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${new Date(a.data_agendamento).toLocaleString()}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${a.nome_paciente}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${a.nome_profissional}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${a.status_consulta}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">
                        <button onclick="console.log('Editar ${a.id_agendamento}')">✏️</button>
                        <button class="btn-excluir" data-id="${a.id_agendamento}">🗑️</button>
                    </td>
                </tr>
            `).join('');

            // Adiciona eventos aos botões de excluir
            document.querySelectorAll('.btn-excluir').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    if(confirm('Tem certeza?')) {
                        await window.api.removerAgendamento(id);
                        carregarTabela(); // Recarrega a lista
                    }
                });
            });

        } catch (erro) {
            console.error("Erro ao listar:", erro);
            listaEl.innerHTML = "<tr><td colspan='5'>Erro ao carregar dados.</td></tr>";
        }
    }

    // Carrega a tabela ao iniciar
    carregarTabela();
    
    // Expõe a função para ser chamada pelo formulário depois de salvar
    window.atualizarListaAgendamentos = carregarTabela;
}

export default { html, init };