// src/Renderer/Views/Agendamento/form/AgendamentoForm.js

const html = `
    <div class="form-box" style="border: 1px solid #ccc; padding: 15px; background: #fff;">
        <h3>Novo Agendamento</h3>
        
        <div style="margin-bottom: 10px;">
            <label>Paciente:</label>
            <select id="select-paciente" style="width: 100%; padding: 5px;"></select>
        </div>

        <div style="margin-bottom: 10px;">
            <label>Profissional:</label>
            <select id="select-profissional" style="width: 100%; padding: 5px;"></select>
        </div>

        <div style="margin-bottom: 10px;">
            <label>Data:</label>
            <input type="datetime-local" id="input-data" style="width: 100%; padding: 5px;">
        </div>

        <button id="btn-salvar" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer;">
            Agendar
        </button>
    </div>
`;

async function init() {
    const selectPaciente = document.getElementById('select-paciente');
    const selectProfissional = document.getElementById('select-profissional');
    const inputData = document.getElementById('input-data');
    const btnSalvar = document.getElementById('btn-salvar');

    // Carrega os selects
    if(window.api && window.api.getDadosFormulario) {
        try {
            const dados = await window.api.getDadosFormulario();
            if (dados.pacientes) {
                selectPaciente.innerHTML = dados.pacientes
                    .map(p => `<option value="${p.id_usuario}">${p.nome_usuario}</option>`).join('');
            }
            if (dados.profissionais) {
                selectProfissional.innerHTML = dados.profissionais
                    .map(p => `<option value="${p.id_profissional}">${p.nome_usuario}</option>`).join('');
            }
        } catch (e) { console.error(e); 
            
        }
    }

    // Salvar
    btnSalvar.addEventListener('click', async () => {
        const novo = {
            id_usuario: selectPaciente.value,
            id_profissional: selectProfissional.value,
            data_agendamento: inputData.value
        };

        if(!novo.data_agendamento) return alert("Selecione a data!");

        const res = await window.api.cadastrarAgendamento(novo);
        
        if (res.success) {
            alert('Agendamento criado!');
            // Limpa o form
            inputData.value = '';
            
            // Chama a atualização da lista (que está no outro arquivo)
            if (window.atualizarListaAgendamentos) {
                window.atualizarListaAgendamentos();
            }
        } else {
            alert('Erro: ' + (res.erro || 'Desconhecido'));
        }
    });
}

export default { html, init };