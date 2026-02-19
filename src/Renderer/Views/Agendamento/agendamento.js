const sessao = localStorage.getItem('usuario_logado');
if (!sessao) {
    window.location.href = '../../../../index.html';
}

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
    if (!window.electronAPI) return console.error("API Electron não encontrada");

    await carregarSelects();
    await carregarTabela();

    // Listener para Sessão Expirada
    if (window.electronAPI && window.electronAPI.onSessionExpired) {
        window.electronAPI.onSessionExpired(() => {
            alert("Sua sessão expirou. Você será redirecionado para o login.");
            localStorage.removeItem('usuario_logado');
            localStorage.removeItem('auth_token');
            window.location.href = '../../../../index.html';
        });
    }

    // Botão Sincronizar
    // Botão Sincronizar (Agora Global)
    const btnSync = document.getElementById('btn-sync');
    if (btnSync) {
        btnSync.addEventListener('click', async () => {
            const originalText = btnSync.innerHTML;
            btnSync.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sincronizando Tudo...';
            btnSync.disabled = true;
            try {
                // ALTERAÇÃO: Usa a sincronização global que inclui Pagamentos e Usuários
                const res = await window.electronAPI.sincronizarBidirecional();
                await carregarTabela();

                if (res.success) {
                    alert(res.message || "Sincronização concluída com sucesso!");
                } else {
                    alert("Erro na sincronização: " + (res.erro || "Erro desconhecido"));
                }
            } catch (e) {
                console.error(e);
                alert("Erro ao sincronizar.");
            } finally {
                btnSync.innerHTML = originalText;
                btnSync.disabled = false;
            }
        });
    }

    // Auto-Sync ao abrir (Global)
    setTimeout(() => {
        if (window.electronAPI.sincronizarBidirecional) {
            console.log("Auto-sync iniciado...");
            window.electronAPI.sincronizarBidirecional()
                .then((res) => {
                    console.log("Auto-sync resultado:", res);
                    carregarTabela();
                })
                .catch(console.error);
        }
    }, 1000);
}

// --- FUNÇÕES DE CARREGAMENTO ---
async function carregarSelects() {
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

// --- FILTRAGEM ---
const selectFiltroTipo = document.getElementById('select-filtro-tipo');
const inputBusca = document.getElementById('input-busca');
const inputBuscaData = document.getElementById('input-busca-data');
const containerBuscaTexto = document.getElementById('container-busca-texto');
const containerBuscaData = document.getElementById('container-busca-data');

// Alterna entre busca de texto e data
selectFiltroTipo.addEventListener('change', () => {
    inputBusca.value = '';
    inputBuscaData.value = '';
    filtrarAgendamentos();

    if (selectFiltroTipo.value === 'data') {
        containerBuscaTexto.style.display = 'none';
        containerBuscaData.style.display = 'flex';
    } else {
        containerBuscaTexto.style.display = 'flex';
        containerBuscaData.style.display = 'none';
    }
});

// Eventos de Input
inputBusca.addEventListener('input', filtrarAgendamentos);
inputBuscaData.addEventListener('change', filtrarAgendamentos);

let todosAgendamentos = []; // Armazena a lista completa

async function carregarTabela() {
    try {
        todosAgendamentos = await window.electronAPI.listarAgendamentos();
        if (!Array.isArray(todosAgendamentos)) {
            todosAgendamentos = [];
        }
        filtrarAgendamentos(); // Renderiza já aplicando (ou não) filtros
    } catch (erro) { console.error(erro); }
}

function filtrarAgendamentos() {
    const tipo = selectFiltroTipo.value;
    const termo = inputBusca.value.toLowerCase().trim();
    const dataFiltro = inputBuscaData.value;

    const filtrados = todosAgendamentos.filter(a => {
        if (tipo === 'data') {
            if (!dataFiltro) return true;
            // a.data_agendamento vem como 'YYYY-MM-DD HH:mm:ss' ou similar
            return a.data_agendamento && a.data_agendamento.startsWith(dataFiltro);
        } else if (tipo === 'paciente') {
            return (a.nome_paciente || '').toLowerCase().includes(termo);
        } else if (tipo === 'profissional') {
            return (a.nome_profissional || '').toLowerCase().includes(termo);
        }
        return true;
    });

    renderizarTabela(filtrados);
}

function renderizarTabela(lista) {
    if (lista.length === 0) {
        listaEl.innerHTML = "<tr><td colspan='5' class='text-center' style='padding:30px'>Nenhum agendamento encontrado.</td></tr>";
        return;
    }

    const statusOpcoes = [
        { value: 'pendente', label: 'Pendente' },
        { value: 'confirmada', label: 'Confirmado' },
        { value: 'cancelada', label: 'Cancelado' },
        { value: 'realizada', label: 'Realizado' },
    ];

    function classePorStatus(s) {
        if (!s) return 'st-pendente';
        const m = { pendente: 'st-pendente', confirmada: 'st-confirmada', cancelada: 'st-cancelada', realizada: 'st-realizada' };
        return m[s.toLowerCase()] || 'st-pendente';
    }

    listaEl.innerHTML = lista.map(a => {
        const statusAtual = (a.status_consulta || 'pendente').toLowerCase();
        const cssClasse = classePorStatus(statusAtual);

        const opcoesHtml = statusOpcoes.map(op =>
            `<option value="${op.value}" ${statusAtual === op.value ? 'selected' : ''}>${op.label}</option>`
        ).join('');

        const dataObj = new Date(a.data_agendamento);
        const dataStr = dataObj.toLocaleDateString('pt-BR');
        const horaStr = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        return `
        <tr>
            <td><strong>${dataStr}</strong><br><span class="small-text">${horaStr}</span></td>
            <td>${a.nome_paciente || '---'}</td>
            <td>${a.nome_profissional || '---'}</td>
            <td class="text-center">
                <select class="select-status-inline ${cssClasse}" data-id="${a.id_agendamento}">
                    ${opcoesHtml}
                </select>
            </td>
            <td class="text-center" style="white-space: nowrap;">
                <button class="action-btn btn-edit" data-id="${a.id_agendamento}" title="Editar">✏️</button>
                <button class="action-btn btn-delete" data-id="${a.id_agendamento}" title="Excluir">🗑️</button>
            </td>
        </tr>
    `}).join('');

    adicionarEventosLista();
}

// --- EVENTOS DA LISTA ---
function adicionarEventosLista() {
    // Editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => preencherEdicao(e.target.closest('button').dataset.id));
    });
    // Excluir
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.closest('button').dataset.id;
            if (confirm('Tem certeza que deseja apagar?')) {
                await window.electronAPI.removerAgendamento(id);
                carregarTabela();
            }
        });
    });
    // Alterar Status (Select Inline)
    document.querySelectorAll('.select-status-inline').forEach(sel => {
        sel.addEventListener('change', async (e) => {
            const select = e.target;
            const id = select.dataset.id;
            const novoStatus = select.value;

            select.disabled = true;
            const res = await window.electronAPI.alterarStatusAgendamento(id, novoStatus);
            select.disabled = false;

            if (res.success) {
                // Atualiza a classe de cor sem recarregar a tabela inteira
                select.className = `select-status-inline st-${novoStatus}`;
            } else {
                alert('Erro ao alterar status: ' + res.erro);
                // Reverte visualmente
                carregarTabela();
            }
        });
    });
}

// --- LÓGICA DO FORMULÁRIO (SALVAR) ---
btnSalvar.addEventListener('click', async () => {
    // Nota: Mesmo disabled, o .value pega o valor selecionado via JS
    if (!inputDia.value || !selectHora.value || !selectProfissional.value) {
        return alert("Preencha todos os campos!");
    }

    // Valida Fim de Semana
    const dataCheck = new Date(inputDia.value + "T12:00:00");
    if (dataCheck.getDay() === 0 || dataCheck.getDay() === 6) return alert("Fechado aos finais de semana!");

    const dados = {
        id_usuario: selectPaciente.value,
        id_profissional: selectProfissional.value,
        data_agendamento: `${inputDia.value}T${selectHora.value}`
    };

    const id = inputId.value;
    let res;

    if (id) {
        dados.id_agendamento = id;
        res = await window.electronAPI.editarAgendamento(dados);
    } else {
        if (!dados.id_usuario) return alert("Selecione o Paciente!");
        res = await window.electronAPI.cadastrarAgendamento(dados);
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
    const agendamento = await window.electronAPI.buscarAgendamentoPorId(id);
    if (!agendamento) return;

    inputId.value = agendamento.id_agendamento;
    selectPaciente.value = agendamento.id_usuario;
    selectProfissional.value = agendamento.id_profissional;

    if (agendamento.data_agendamento) {
        const dataObj = new Date(agendamento.data_agendamento);
        const offset = dataObj.getTimezoneOffset() * 60000;
        const localDate = new Date(dataObj.getTime() - offset);
        inputDia.value = localDate.toISOString().split('T')[0];
        selectHora.value = String(localDate.getHours()).padStart(2, '0') + ":00";
    }

    // --- BLOQUEIOS VISUAIS (ATUALIZADO) ---
    selectPaciente.disabled = true;
    selectProfissional.disabled = true; // Bloqueia a troca de médico na edição

    avisoPaciente.style.display = "block";
    avisoPaciente.innerText = "Modo Edição: Não é permitido alterar Paciente ou Profissional."; // Mensagem mais clara

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

    // --- LIBERA OS CAMPOS (ATUALIZADO) ---
    selectPaciente.disabled = false;
    selectProfissional.disabled = false; // Libera o médico para novos cadastros

    avisoPaciente.style.display = "none";
    avisoPaciente.innerText = ""; // Limpa o texto do aviso

    tituloForm.innerText = "Novo Agendamento";
    btnSalvar.innerText = "Agendar";
    btnCancelar.style.display = "none";
}

btnCancelar.addEventListener('click', limparFormulario);

// Inicia
init();