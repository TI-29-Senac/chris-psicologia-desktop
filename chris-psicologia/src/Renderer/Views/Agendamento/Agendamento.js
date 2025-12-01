// src/Renderer/Views/agendamento/agendamento.js

// --- SEM IMPORT DE CSS AQUI ---

const html = `
  <div class="container" style="padding: 20px;">
    <h1>Gestão de Agendamentos</h1>
    <div class="form-box" style="margin-bottom: 20px; border: 1px solid #ccc; padding: 15px;">
      <h3>Novo Agendamento</h3>
      <label>Paciente:</label> <select id="select-paciente"></select>
      <label>Profissional:</label> <select id="select-profissional"></select>
      <label>Data:</label> <input type="datetime-local" id="input-data">
      <button id="btn-salvar">Agendar</button>
    </div>
    <table>
      <thead><tr><th>Data</th><th>Paciente</th><th>Profissional</th><th>Status</th></tr></thead>
      <tbody id="lista-agendamentos"></tbody>
    </table>
  </div>
`;

function init() {
    const listaEl = document.getElementById('lista-agendamentos');
    const selectPaciente = document.getElementById('select-paciente');
    const selectProfissional = document.getElementById('select-profissional');
    const inputData = document.getElementById('input-data');
    const btnSalvar = document.getElementById('btn-salvar');

    async function carregarTabela() {
        // Verifica se a API foi carregada antes de chamar
        if (!window.api) return console.error("API não carregada!");
        
        const agendamentos = await window.api.listarAgendamentos();
        listaEl.innerHTML = agendamentos.map(a => `
            <tr>
                <td>${new Date(a.data_agendamento).toLocaleString()}</td>
                <td>${a.nome_paciente}</td>
                <td>${a.nome_profissional}</td>
                <td>${a.status_consulta}</td>
            </tr>
        `).join('');
    }

    async function carregarFormulario() {
        if(window.api && window.api.getDadosFormulario) {
            const dados = await window.api.getDadosFormulario();
            selectPaciente.innerHTML = dados.pacientes.map(p => `<option value="${p.id_usuario}">${p.nome_usuario}</option>`).join('');
            selectProfissional.innerHTML = dados.profissionais.map(p => `<option value="${p.id_profissional}">${p.nome_usuario}</option>`).join('');
        }
    }

    btnSalvar.addEventListener('click', async () => {
        const novo = {
            id_usuario: selectPaciente.value,
            id_profissional: selectProfissional.value,
            data_agendamento: inputData.value
        };
        const res = await window.api.cadastrarAgendamento(novo);
        if (res.success) {
            alert('Sucesso!');
            carregarTabela();
        } else {
            alert('Erro: ' + (res.erro || 'Desconhecido'));
        }
    });

    carregarFormulario();
    carregarTabela();
}

export default { html, init };