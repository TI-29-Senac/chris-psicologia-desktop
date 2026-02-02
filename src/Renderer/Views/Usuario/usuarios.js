// src/Renderer/Views/Usuario/usuarios.js

// 1. Elementos Globais
const listaEl = document.getElementById('lista-usuarios');
const headerEl = document.getElementById('table-header');
const tituloTextoEl = document.getElementById('titulo-texto'); // Alterado para o SPAN
const modal = document.getElementById('modal-cadastro');

// Elementos de Ação e Filtro
const btnNovo = document.getElementById('btn-novo-usuario');
const btnClose = document.getElementById('btn-close-modal');
const btnSalvar = document.getElementById('btn-salvar-usuario');

const btnFilterCliente = document.getElementById('filter-cliente');
const btnFilterProfissional = document.getElementById('filter-profissional');
const btnFilterRecepcionista = document.getElementById('filter-recepcionista');
const btnFilterAdmin = document.getElementById('filter-admin');

// Elementos de Busca Avançada
const inputBusca = document.getElementById('input-busca');
const selectFiltroTipo = document.getElementById('select-filtro-tipo');

// Elementos do Modal
const btnTabCliente = document.getElementById('btn-tab-cliente');
const btnTabProfissional = document.getElementById('btn-tab-profissional');
const areaProfissional = document.getElementById('area-profissional');
const inputValor = document.getElementById('cad-valor');
const inputSinal = document.getElementById('cad-sinal');
const inputCpf = document.getElementById('cad-cpf');

// Estado da Aplicação
let todosUsuarios = [];
let tipoCadastroAtual = 'cliente';
let tabAtiva = 'cliente';

async function init() {
    if (!window.electronAPI) {
        console.error("ERRO: window.electronAPI não encontrada.");
        return;
    }

    inputBusca.addEventListener('keyup', aplicarFiltros);
    selectFiltroTipo.addEventListener('change', aplicarFiltros);

    btnFilterCliente.addEventListener('click', () => trocarAba('cliente'));
    btnFilterProfissional.addEventListener('click', () => trocarAba('profissional'));
    btnFilterRecepcionista.addEventListener('click', () => trocarAba('recepcionista'));
    btnFilterAdmin.addEventListener('click', () => trocarAba('admin'));

    configurarEventosModal();
    document.getElementById('btn-tab-recepcionista').addEventListener('click', () => mudarAbaCadastro('recepcionista'));
    document.getElementById('btn-tab-admin').addEventListener('click', () => mudarAbaCadastro('admin'));

    await buscarDados();

    if (navigator.onLine) {
        window.electronAPI.sincronizarBidirecional().then(() => buscarDados());
    } else {
        await buscarDados();
    }
}

// --- 1. BUSCA DE DADOS ---
async function buscarDados() {
    try {
        listaEl.innerHTML = "<tr><td colspan='7' class='text-center'>Carregando...</td></tr>";
        todosUsuarios = await window.electronAPI.listarUsuarios();
        aplicarFiltros();
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        listaEl.innerHTML = "<tr><td colspan='7' class='text-center' style='color:red'>Erro ao conectar com servidor.</td></tr>";
    }
}

// --- 2. LÓGICA DE FILTRAGEM E TABELAS ---
function trocarAba(tipo) {
    tabAtiva = tipo;

    // Remove 'active' de todos
    btnFilterCliente.classList.remove('active');
    btnFilterProfissional.classList.remove('active');
    btnFilterRecepcionista.classList.remove('active');
    btnFilterAdmin.classList.remove('active');

    // Adiciona 'active' e define título
    if (tipo === 'cliente') {
        btnFilterCliente.classList.add('active');
        tituloTextoEl.innerText = "Lista de Pacientes";
    } else if (tipo === 'profissional') {
        btnFilterProfissional.classList.add('active');
        tituloTextoEl.innerText = "Lista de Profissionais";
    } else if (tipo === 'recepcionista') {
        btnFilterRecepcionista.classList.add('active');
        tituloTextoEl.innerText = "Lista de Recepcionistas";
    } else if (tipo === 'admin') {
        btnFilterAdmin.classList.add('active');
        tituloTextoEl.innerText = "Lista de Administradores";
    }

    inputBusca.value = '';
    aplicarFiltros();
}

function aplicarFiltros() {
    const termo = inputBusca.value.toLowerCase();
    const colunaFiltro = selectFiltroTipo.value;

    let filtrados = todosUsuarios.filter(u => u.tipo_usuario === tabAtiva);

    if (termo) {
        filtrados = filtrados.filter(u => {
            let valorParaChecar = '';
            switch (colunaFiltro) {
                case 'nome': valorParaChecar = u.nome_usuario; break;
                case 'cpf': valorParaChecar = u.cpf; break;
                case 'email': valorParaChecar = u.email_usuario; break;
                default: valorParaChecar = u.nome_usuario;
            }
            return valorParaChecar && valorParaChecar.toLowerCase().includes(termo);
        });
    }

    renderizarTabela(filtrados);
}

function renderizarTabela(dados) {
    let htmlHeader = `
        <th width="80">ID</th>
        <th>Nome</th>
        <th>CPF</th>
        <th>Email</th>
        <th>Tipo</th>
    `;

    if (tabAtiva === 'profissional') {
        htmlHeader += `<th>Especialidade</th>`;
    }

    htmlHeader += `<th class="text-center">Ações</th>`;
    headerEl.innerHTML = htmlHeader;

    if (dados.length === 0) {
        const colSpan = tabAtiva === 'profissional' ? 7 : 6;
        listaEl.innerHTML = `<tr><td colspan='${colSpan}' class='text-center' style="padding:20px;">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    listaEl.innerHTML = dados.map(u => {
        const tipoClass = `badge-${u.tipo_usuario ? u.tipo_usuario.toLowerCase() : 'cliente'}`;
        const tipoLabel = u.tipo_usuario ? u.tipo_usuario.charAt(0).toUpperCase() + u.tipo_usuario.slice(1) : 'Cliente';

        // ÍCONE DE SINCRONIZAÇÃO
        const isPendente = u.sincronizado === 0;
        const statusIcon = isPendente
            ? '<i class="fa-solid fa-cloud-arrow-up" title="Pendente de Sincronização" style="color: #f39c12; margin-right: 5px;"></i>'
            : '<i class="fa-solid fa-cloud" title="Sincronizado" style="color: #27ae60; margin-right: 5px;"></i>';

        // EXIBIÇÃO DO ID (Encurta se for UUID)
        const displayId = u.id_usuario.toString().length > 10
            ? u.id_usuario.substring(0, 8) + '...'
            : u.id_usuario;

        return `
        <tr>
            <td class="col-id">${statusIcon}#${displayId}</td>
            <td class="col-nome"><strong>${u.nome_usuario}</strong></td>
            <td>${u.cpf || '---'}</td>
            <td>${u.email_usuario}</td>
            <td><span class="badge-tipo ${tipoClass}">${tipoLabel}</span></td>
            ${tabAtiva === 'profissional' ? `<td>${u.especialidade || '-'}</td>` : ''}
            <td class="col-actions text-center">
                <button class="action-btn btn-edit" data-id="${u.id_usuario}" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn btn-delete" data-id="${u.id_usuario}" title="Excluir">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `}).join('');

    adicionarEventosTabela();
}

// --- 3. MODAL E CADASTRO ---
function configurarEventosModal() {
    btnNovo.addEventListener('click', () => {
        limparFormulario();
        delete btnSalvar.dataset.id; // Garante que é um novo cadastro
        modal.classList.add('active');
    });

    btnClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    btnTabCliente.addEventListener('click', () => mudarAbaCadastro('cliente'));
    btnTabProfissional.addEventListener('click', () => mudarAbaCadastro('profissional'));

    if (inputCpf) {
        inputCpf.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
        });
    }

    if (inputValor) {
        inputValor.addEventListener('input', () => {
            const v = parseFloat(inputValor.value) || 0;
            inputSinal.value = (v * 0.20).toFixed(2);
        });
    }

    btnSalvar.addEventListener('click', salvarUsuario);
}

function mudarAbaCadastro(tipo) {
    tipoCadastroAtual = tipo; // Atualiza o estado global com o tipo escolhido

    // Remove a classe 'active' de todos os botões de tipo
    document.querySelectorAll('.tipo-btn').forEach(btn => btn.classList.remove('active'));

    // Adiciona 'active' ao botão clicado
    const btnAtivo = document.querySelector(`.tipo-btn[data-tipo="${tipo}"]`);
    if (btnAtivo) btnAtivo.classList.add('active');

    // Mostra a área de profissional apenas se o tipo for profissional
    areaProfissional.style.display = (tipo === 'profissional') ? 'block' : 'none';
}

function limparFormulario() {
    document.getElementById('cad-nome').value = '';
    document.getElementById('cad-email').value = '';
    document.getElementById('cad-cpf').value = '';
    document.getElementById('cad-senha').value = '';
    if (document.getElementById('cad-especialidade')) document.getElementById('cad-especialidade').value = '';
    if (inputValor) inputValor.value = '';
    if (inputSinal) inputSinal.value = '';
    mudarAbaCadastro('cliente');
}

async function salvarUsuario() {
    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    const cpf = document.getElementById('cad-cpf').value;
    const senha = document.getElementById('cad-senha').value;
    const idEdicao = btnSalvar.dataset.id;

    if (!nome || !email || (!idEdicao && !senha)) return alert("Preencha os campos obrigatórios.");

    // O 'tipo_usuario' será definido pela aba ativa no modal (tipoCadastroAtual)
    const dados = {
        id_usuario: idEdicao,
        nome_usuario: document.getElementById('cad-nome').value,
        email_usuario: document.getElementById('cad-email').value,
        cpf: document.getElementById('cad-cpf').value,
        tipo_usuario: tipoCadastroAtual, // <--- ESTA É A CHAVE
        senha_usuario: document.getElementById('cad-senha').value
    };
    if (idEdicao) {
        const res = await window.electronAPI.editarUsuario(dados);
        if (res.success) {
            alert("Tipo de utilizador atualizado!");
            modal.classList.remove('active');
            buscarDados();
        }
    }

    if (tipoCadastroAtual === 'profissional') {
        dados.especialidade = document.getElementById('cad-especialidade').value;
        dados.valor_consulta = inputValor.value;
        dados.sinal_consulta = inputSinal.value;
    }

    const txtOriginal = btnSalvar.innerText;
    btnSalvar.innerText = "Processando...";
    btnSalvar.disabled = true;

    try {
        let res;
        if (idEdicao) {
            res = await window.electronAPI.editarUsuario(dados); // Envia o novo tipo para o SQLite/API
        } else {
            res = await window.electronAPI.cadastrarUsuario(dados);
        }

        if (res.success) {
            alert(idEdicao ? "Usuário atualizado com sucesso!" : "Cadastro realizado!");
            modal.classList.remove('active');
            delete btnSalvar.dataset.id;
            buscarDados();
        } else {
            alert("Erro: " + (res.erro || "Falha desconhecida"));
        }
    } catch (e) {
        console.error(e);
        alert("Erro interno.");
    } finally {
        btnSalvar.innerText = txtOriginal;
        btnSalvar.disabled = false;
    }
}

function adicionarEventosTabela() {
    // BOTÃO EXCLUIR
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.closest('button').dataset.id;
            if (confirm("Tem certeza que deseja excluir o usuário #" + id + "?")) {
                const res = await window.electronAPI.excluirUsuario(id);
                if (res.success) buscarDados();
                else alert("Erro ao excluir: " + res.erro);
            }
        });
    });

    // BOTÃO EDITAR
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.closest('button').dataset.id;
            const usuario = todosUsuarios.find(u => u.id_usuario == id);

            if (usuario) {
                limparFormulario();
                document.getElementById('cad-nome').value = usuario.nome_usuario;
                document.getElementById('cad-email').value = usuario.email_usuario;
                document.getElementById('cad-cpf').value = usuario.cpf || '';

                // Define a aba do modal com base no tipo atual do banco
                mudarAbaCadastro(usuario.tipo_usuario || 'cliente');

                if (usuario.tipo_usuario === 'profissional') {
                    document.getElementById('cad-especialidade').value = usuario.especialidade || '';
                    inputValor.value = usuario.valor_consulta || '';
                    inputSinal.value = usuario.sinal_consulta || '';
                }

                btnSalvar.dataset.id = id;
                modal.classList.add('active');
            }
        });
    });
}

const btnSincronizar = document.getElementById('btnSincronizar');

if (btnSincronizar) {
    btnSincronizar.addEventListener('click', async () => {
        try {
            btnSincronizar.disabled = true;
            const originalText = btnSincronizar.innerHTML;
            btnSincronizar.innerText = "Sincronizando via Nuvem...";

            // Chamada para a nova função bidirecional
            const resultado = await window.electronAPI.sincronizarBidirecional();

            if (resultado.success) {
                alert(resultado.message || "Sincronização bidirecional concluída!");
                await buscarDados(); // Recarrega a lista com os dados novos do site
            } else {
                alert("Erro na sincronização: " + (resultado.erro || "Falha na conexão"));
            }

            btnSincronizar.disabled = false;
            btnSincronizar.innerHTML = originalText;
        } catch (error) {
            console.error("Erro ao disparar sincronização:", error);
            btnSincronizar.disabled = false;
        }
    });
}

init();