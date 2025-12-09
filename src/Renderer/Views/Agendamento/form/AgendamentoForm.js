// src/Renderer/Views/Agendamento/form/AgendamentoForm.js

const html = `
    <div class="card">
        <h3 id="titulo-form">Novo Agendamento</h3>
        
        <input type="hidden" id="input-id">

        <div class="form-group">
            <label for="select-paciente">Paciente</label>
            <select id="select-paciente" class="form-control"></select>
            <small id="aviso-paciente" class="small-text" style="display: none;">
                O paciente não pode ser alterado na edição.
            </small>
        </div>

        <div class="form-group">
            <label for="select-profissional">Profissional</label>
            <select id="select-profissional" class="form-control"></select>
        </div>

        <div class="form-group">
            <label>Data e Horário</label>
            <div style="display: flex; gap: 15px;">
                <input type="date" id="input-dia" class="form-control" style="flex: 1;">
                
                <select id="select-hora" class="form-control" style="width: 180px;">
                    <option value="">Horário...</option>
                    <optgroup label="Manhã">
                        <option value="08:00">08:00 - 09:00</option>
                        <option value="09:00">09:00 - 10:00</option>
                        <option value="10:00">10:00 - 11:00</option>
                        <option value="11:00">11:00 - 12:00</option>
                    </optgroup>
                    <optgroup label="Tarde">
                        <option value="13:00">13:00 - 14:00</option>
                        <option value="14:00">14:00 - 15:00</option>
                        <option value="15:00">15:00 - 16:00</option>
                        <option value="16:00">16:00 - 17:00</option>
                        <option value="17:00">17:00 - 18:00</option>
                    </optgroup>
                </select>
            </div>
        </div>

        <div class="form-actions">
            <button id="btn-salvar" class="btn btn-primary">
                Agendar
            </button>
            <button id="btn-cancelar" class="btn btn-secondary" style="display: none;">
                Cancelar
            </button>
        </div>
    </div>
`;

async function init() {
    // 1. CAPTURA OS ELEMENTOS CERTOS (DIA e HORA separados)
    const selectPaciente = document.getElementById('select-paciente');
    const selectProfissional = document.getElementById('select-profissional');
    
    // ATENÇÃO AQUI: Capturando os IDs novos que definimos no HTML acima
    const inputDia = document.getElementById('input-dia');
    const selectHora = document.getElementById('select-hora');
    
    const inputId = document.getElementById('input-id');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tituloForm = document.getElementById('titulo-form');
    const avisoPaciente = document.getElementById('aviso-paciente');

    // Carrega Selects
    if(window.electronAPI && window.electronAPI.getDadosFormulario) {
        try {
            const dados = await window.electronAPI.getDadosFormulario();
            if (dados.pacientes) {
                selectPaciente.innerHTML = '<option value="">Selecione...</option>' + 
                    dados.pacientes.map(p => `<option value="${p.id_usuario}">${p.nome_usuario}</option>`).join('');
            }
            if (dados.profissionais) {
                selectProfissional.innerHTML = '<option value="">Selecione...</option>' + 
                    dados.profissionais.map(p => `<option value="${p.id_profissional}">${p.nome_usuario}</option>`).join('');
            }
        } catch (e) { console.error(e); }
    }

    // --- MODO EDIÇÃO ---
    window.preencherFormularioParaEdicao = async (id) => {
        try {
            const agendamento = await window.electronAPI.buscarAgendamentoPorId(id);
            if(agendamento) {
                inputId.value = agendamento.id_agendamento;
                
                // Preenche valores
                selectPaciente.value = agendamento.id_usuario;
                selectProfissional.value = agendamento.id_profissional;
                
                // LÓGICA DE DATA E HORA SEPARADAS
                if(agendamento.data_agendamento) {
                    const dataObj = new Date(agendamento.data_agendamento);
                    
                    // Ajuste de fuso para pegar o dia correto localmente
                    const offset = dataObj.getTimezoneOffset() * 60000;
                    const localDate = new Date(dataObj.getTime() - offset);
                    
                    // Preenche o input type="date" (YYYY-MM-DD)
                    inputDia.value = localDate.toISOString().split('T')[0];

                    // Preenche o select type="time" (HH:00)
                    const hora = String(localDate.getHours()).padStart(2, '0');
                    selectHora.value = `${hora}:00`; 
                }

                // UI Edição
                selectPaciente.disabled = true;
                avisoPaciente.style.display = "block";
                tituloForm.innerText = "Editar Agendamento";
                btnSalvar.innerText = "Salvar Alterações";
                btnCancelar.style.display = "block";
                
                // Rola para cima suavemente
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error("Erro na edição", error);
        }
    };

    // --- LIMPAR / CANCELAR ---
    function limparFormulario() {
        inputId.value = '';
        selectPaciente.value = '';
        selectProfissional.value = '';
        inputDia.value = '';   // Limpa dia
        selectHora.value = ''; // Limpa hora
        
        selectPaciente.disabled = false; 
        avisoPaciente.style.display = "none";

        tituloForm.innerText = "Novo Agendamento";
        btnSalvar.innerText = "Agendar";
        btnCancelar.style.display = "none";
    }

    btnCancelar.addEventListener('click', limparFormulario);

    // --- SALVAR ---
    btnSalvar.addEventListener('click', async () => {
        // Validação: Verifica se DIA e HORA estão preenchidos
        if(!inputDia.value || !selectHora.value || !selectProfissional.value) {
            return alert("Preencha Profissional, Data e Horário!");
        }

        // Validação de Fim de Semana
        // Adiciona um horário fixo apenas para checar o dia da semana corretamente
        const dataCheck = new Date(inputDia.value + "T12:00:00");
        const diaSemana = dataCheck.getDay();
        if(diaSemana === 0 || diaSemana === 6) {
            return alert("A clínica não funciona aos finais de semana!");
        }

        // MONTA A DATA FINAL PARA O BANCO (YYYY-MM-DD + T + HH:MM)
        const dataFinal = `${inputDia.value}T${selectHora.value}`;

        const id = inputId.value;
        const dados = {
            id_usuario: selectPaciente.value,
            id_profissional: selectProfissional.value,
            data_agendamento: dataFinal
        };

        let res;
        if (id) {
            dados.id_agendamento = id;
            res = await window.electronAPI.editarAgendamento(dados);
        } else {
            if(!dados.id_usuario) return alert("Selecione o Paciente!");
            res = await window.electronAPI.cadastrarAgendamento(dados);
        }
        
        if (res.success) {
            alert(id ? 'Agendamento atualizado!' : 'Agendamento criado!');
            limparFormulario();
            if (window.atualizarListaAgendamentos) window.atualizarListaAgendamentos();
        } else {
            alert('Erro: ' + res.erro);
        }
    });
}

export default { html, init };