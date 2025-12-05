// src/Renderer/Views/Agendamento/agendamento.js

// Elementos do DOM
const selectPaciente = document.getElementById('select-paciente');
const selectProfissional = document.getElementById('select-profissional');
const inputDia = document.getElementById('input-dia');
const selectHora = document.getElementById('select-hora');
const inputId = document.getElementById('input-id');
const btnSalvar = document.getElementById('btn-salvar');
const btnCancelar = document.getElementById('btn-cancelar');
const tituloForm = document.getElementById('titulo-form');
const avisoPaciente = document.getElementById('aviso-paciente');
const listaEl = document.getElementById('lista-agendamentos');

// --- INICIALIZAÇÃO ---
async function init() {
    if (!window.api) return console.error("API Electron não encontrada");

    await carregarSelects();
    await carregarTabela();
}

// --- FUNÇÕES DE CARREGAMENTO ---
async function carregarSelects() {
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

async function carregarTabela() {
    try {
        const agendamentos = await window.api.listarAgendamentos();
        
        if(agendamentos.length === 0) {
            listaEl.innerHTML = "<tr><td colspan='5' class='text-center' style='padding:30px'>Nenhum agendamento encontrado.</td></tr>";
            return;
        }

        listaEl.innerHTML = agendamentos.map(a => {
            const isCancelado = a.status_consulta === 'Cancelado';
            const badgeClass = isCancelado ? 'status-cancelado' : 'status-agendado';
            
            const dataObj = new Date(a.data_agendamento);
            const dataStr = dataObj.toLocaleDateString('pt-BR');
            const horaStr = dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

            return `
            <tr>
                <td><strong>${dataStr}</strong><br><span class="small-text">${horaStr}</span></td>
                <td>${a.nome_paciente || '---'}</td>
                <td>${a.nome_profissional || '---'}</td>
                <td class="text-center"><span class="status-badge ${badgeClass}">${a.status_consulta}</span></td>
                <td class="text-center" style="white-space: nowrap;">
                    ${!isCancelado ? `
                        <button class="action-btn btn-edit" data-id="${a.id_agendamento}" title="Editar">✏️</button>
                        <button class="action-btn btn-cancel" data-id="${a.id_agendamento}" title="Desmarcar">🚫</button>
                    ` : ''}
                    <button class="action-btn btn-delete" data-id="${a.id_agendamento}" title="Excluir">🗑️</button>
                </td>
            </tr>
        `}).join('');

        adicionarEventosLista();
    } catch (erro) { console.error(erro); }
}

// --- EVENTOS DA LISTA ---
function adicionarEventosLista() {
    // Editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => preencherEdicao(e.target.closest('button').dataset.id));
    });
    // Cancelar
    document.querySelectorAll('.btn-cancel').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.closest('button').dataset.id;
            if(confirm('Deseja desmarcar esta consulta?')) {
                await window.api.cancelarAgendamento(id);
                carregarTabela();
            }
        });
    });
    // Excluir
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.closest('button').dataset.id;
            if(confirm('Tem certeza que deseja apagar?')) {
                await window.api.removerAgendamento(id);
                carregarTabela();
            }
        });
    });
}

// --- LÓGICA DO FORMULÁRIO (SALVAR) ---
btnSalvar.addEventListener('click', async () => {
    if(!inputDia.value || !selectHora.value || !selectProfissional.value) {
        return alert("Preencha todos os campos!");
    }

    // Valida Fim de Semana
    const dataCheck = new Date(inputDia.value + "T12:00:00");
    if(dataCheck.getDay() === 0 || dataCheck.getDay() === 6) return alert("Fechado aos finais de semana!");

    const dados = {
        id_usuario: selectPaciente.value,
        id_profissional: selectProfissional.value,
        data_agendamento: `${inputDia.value}T${selectHora.value}`
    };

    const id = inputId.value;
    let res;

    if (id) {
        dados.id_agendamento = id;
        res = await window.api.editarAgendamento(dados);
    } else {
        if(!dados.id_usuario) return alert("Selecione o Paciente!");
        res = await window.api.cadastrarAgendamento(dados);
    }
    
    if (res.success) {
        alert(id ? 'Atualizado!' : 'Agendado!');
        limparFormulario();
        carregarTabela();
    } else {
        alert('Erro: ' + res.erro);
    }
});

// --- FUNÇÕES AUXILIARES ---
async function preencherEdicao(id) {
    const agendamento = await window.api.buscarAgendamentoPorId(id);
    if(!agendamento) return;

    inputId.value = agendamento.id_agendamento;
    selectPaciente.value = agendamento.id_usuario;
    selectProfissional.value = agendamento.id_profissional;

    if(agendamento.data_agendamento) {
        const dataObj = new Date(agendamento.data_agendamento);
        const offset = dataObj.getTimezoneOffset() * 60000;
        const localDate = new Date(dataObj.getTime() - offset);
        inputDia.value = localDate.toISOString().split('T')[0];
        selectHora.value = String(localDate.getHours()).padStart(2, '0') + ":00";
    }

    // Bloqueios visuais
    selectPaciente.disabled = true;
    avisoPaciente.style.display = "block";
    tituloForm.innerText = "Editar Agendamento";
    btnSalvar.innerText = "Salvar Alterações";
    btnCancelar.style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function limparFormulario() {
    inputId.value = '';
    selectPaciente.value = '';
    selectProfissional.value = '';
    inputDia.value = '';
    selectHora.value = '';
    selectPaciente.disabled = false;
    avisoPaciente.style.display = "none";
    tituloForm.innerText = "Novo Agendamento";
    btnSalvar.innerText = "Agendar";
    btnCancelar.style.display = "none";
}

btnCancelar.addEventListener('click', limparFormulario);

// Inicia
init();