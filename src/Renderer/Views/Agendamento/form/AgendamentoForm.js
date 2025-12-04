const html = `
    <div class="form-box" style="border: 1px solid #ccc; padding: 15px; background: #fff;">
        <h3 id="titulo-form">Novo Agendamento</h3>
        
        <input type="hidden" id="input-id">

        <div style="margin-bottom: 10px;">
            <label>Paciente:</label>
            <select id="select-paciente" style="width: 100%; padding: 5px;"></select>
            <small id="aviso-paciente" style="color: #666; display: none; font-size: 0.8em; margin-top: 2px;">
                O paciente não pode ser alterado na edição.
            </small>
        </div>

        <div style="margin-bottom: 10px;">
            <label>Profissional:</label>
            <select id="select-profissional" style="width: 100%; padding: 5px;"></select>
        </div>

        <div style="margin-bottom: 15px;">
            <label>Data e Horário:</label>
            <div style="display: flex; gap: 10px;">
                <input type="date" id="input-dia" style="flex: 1; padding: 5px;">
                
                <select id="select-hora" style="width: 140px; padding: 5px;">
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

        <div style="display: flex; gap: 10px;">
            <button id="btn-salvar" style="flex: 1; padding: 10px; background: #4CAF50; color: white; border: none; cursor: pointer;">
                Agendar
            </button>
            <button id="btn-cancelar" style="display: none; padding: 10px; background: #f44336; color: white; border: none; cursor: pointer;">
                Cancelar
            </button>
        </div>
    </div>
`;

async function init() {
    // Captura elementos
    const selectPaciente = document.getElementById('select-paciente');
    const selectProfissional = document.getElementById('select-profissional');
    const inputDia = document.getElementById('input-dia');
    const selectHora = document.getElementById('select-hora');
    const inputId = document.getElementById('input-id');
    const btnSalvar = document.getElementById('btn-salvar');
    const btnCancelar = document.getElementById('btn-cancelar');
    const tituloForm = document.getElementById('titulo-form');
    const avisoPaciente = document.getElementById('aviso-paciente');

    // Carrega Selects Iniciais
    if(window.api && window.api.getDadosFormulario) {
        try {
            const dados = await window.api.getDadosFormulario();
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
            const agendamento = await window.api.buscarAgendamentoPorId(id);
            if(agendamento && agendamento.data_agendamento) {
                inputId.value = agendamento.id_agendamento;
                selectPaciente.value = agendamento.id_usuario;
                selectProfissional.value = agendamento.id_profissional;
                
                // Quebra a data (ISO String: "2023-10-25T14:00:00.000Z") em Dia e Hora
                const dataObj = new Date(agendamento.data_agendamento);
                
                // Extrai o Dia (YYYY-MM-DD)
                // Usamos toLocaleDateString com cuidado ou split se o banco salvou em ISO puro
                // Ajuste simples para fuso horário local:
                const offset = dataObj.getTimezoneOffset() * 60000;
                const localDate = new Date(dataObj.getTime() - offset);
                inputDia.value = localDate.toISOString().split('T')[0];

                // Extrai a Hora (HH:00)
                const hora = String(localDate.getHours()).padStart(2, '0');
                selectHora.value = `${hora}:00`; 

                // Bloqueia Paciente
                selectPaciente.disabled = true;
                selectPaciente.style.backgroundColor = "#e9ecef";
                avisoPaciente.style.display = "block";

                // UI Edição
                tituloForm.innerText = "Remarcar / Trocar Profissional";
                btnSalvar.innerText = "Salvar Alterações";
                btnSalvar.style.background = "#2196F3";
                btnCancelar.style.display = "block";
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
        inputDia.value = '';
        selectHora.value = '';
        
        selectPaciente.disabled = false;
        selectPaciente.style.backgroundColor = "white";
        avisoPaciente.style.display = "none";

        tituloForm.innerText = "Novo Agendamento";
        btnSalvar.innerText = "Agendar";
        btnSalvar.style.background = "#4CAF50";
        btnCancelar.style.display = "none";
    }

    btnCancelar.addEventListener('click', limparFormulario);

    // --- SALVAR ---
    btnSalvar.addEventListener('click', async () => {
        // Validação Simples
        if(!inputDia.value || !selectHora.value || !selectProfissional.value) {
            return alert("Preencha Profissional, Data e Horário!");
        }

        // Validação de Fim de Semana (Ainda necessária pois o input type="date" permite sábado)
        // Dica: new Date("2023-10-25T00:00") pega o dia correto independente de fuso para checar dia da semana
        const dataCheck = new Date(inputDia.value + "T00:00:00");
        const diaSemana = dataCheck.getDay();
        if(diaSemana === 0 || diaSemana === 6) {
            return alert("A clínica não funciona aos finais de semana!");
        }

        // MONTAGEM DA DATA FINAL PARA O BANCO (YYYY-MM-DD + T + HH:MM)
        const dataFinal = `${inputDia.value}T${selectHora.value}`;

        const id = inputId.value;
        const dados = {
            id_usuario: selectPaciente.value,
            id_profissional: selectProfissional.value,
            data_agendamento: dataFinal // Envia no formato que o banco já espera
        };

        let res;
        if (id) {
            dados.id_agendamento = id;
            res = await window.api.editarAgendamento(dados);
        } else {
            if(!dados.id_usuario) return alert("Selecione o Paciente!");
            res = await window.api.cadastrarAgendamento(dados);
        }
        
        if (res.success) {
            alert(id ? 'Agendamento remarcado!' : 'Agendamento criado!');
            limparFormulario();
            if (window.atualizarListaAgendamentos) window.atualizarListaAgendamentos();
        } else {
            alert('Erro: ' + res.erro);
        }
    });
}

export default { html, init };