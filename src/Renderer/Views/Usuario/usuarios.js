// src/Renderer/Views/Usuarios/usuarios.js

// --- 1. ELEMENTOS GLOBAIS (Seleção do DOM) ---
// CORREÇÃO: O ID no HTML é 'lista-usuarios', não 'lista-usuarios-body'
const listaBody = document.getElementById('lista-usuarios'); 
const headerEl = document.getElementById('table-header');
const tituloEl = document.getElementById('titulo-lista');
const modal = document.getElementById('modal-cadastro');
const modalTitulo = document.getElementById('modal-titulo');
const btnNovo = document.getElementById('btn-novo-usuario');
const btnClose = document.getElementById('btn-close-modal');
const btnSalvar = document.getElementById('btn-salvar-usuario');

// Filtros e Busca
const btnFilterCliente = document.getElementById('filter-cliente');
const btnFilterProfissional = document.getElementById('filter-profissional');
const inputBusca = document.getElementById('input-busca');

// Formulário do Modal
const inputId = document.getElementById('cad-id'); // Campo Oculto para ID
const inputNome = document.getElementById('cad-nome');
const inputEmail = document.getElementById('cad-email');
const inputCpf = document.getElementById('cad-cpf');
const inputSenha = document.getElementById('cad-senha');
const inputEspecialidade = document.getElementById('cad-especialidade');
const inputValor = document.getElementById('cad-valor');
const inputSinal = document.getElementById('cad-sinal');

const btnTabCliente = document.getElementById('btn-tab-cliente');
const btnTabProfissional = document.getElementById('btn-tab-profissional');
const areaProfissional = document.getElementById('area-profissional');

// --- ESTADO DA APLICAÇÃO ---
let todosUsuarios = [];       // Todos os dados do banco
let tipoCadastroAtual = 'cliente'; // Para o formulário (Novo/Edit)
let filtroTabelaAtual = 'cliente'; // Para a visualização da tabela

// --- INICIALIZAÇÃO ---
async function init() {
    // Verificação de Segurança
    if (!listaBody) {
        console.error("ERRO CRÍTICO: Tabela 'lista-usuarios' não encontrada no HTML.");
        return;
    }

    if (!window.api) {
        console.error("ERRO: window.api não encontrada.");
        alert("Erro crítico: API do sistema não carregada.");
        return;
    }

    await buscarDados();     // Carrega dados do banco
    configurarEventos();     // Configura cliques e inputs
    
    // Máscara de CPF (Formatação automática)
    if(inputCpf) {
        inputCpf.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, "");
            if (v.length > 11) v = v.slice(0, 11);
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
        });
    }
}

// --- 1. BUSCAR DADOS ---
async function buscarDados() {
    try {
        todosUsuarios = await window.api.listarUsuarios();
        filtrarLista(filtroTabelaAtual); // Atualiza a tela mantendo o filtro atual
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        if(listaBody) listaBody.innerHTML = "<tr><td colspan='6' class='text-center' style='color:red'>Erro ao conectar com servidor.</td></tr>";
    }
}

// --- LISTENER DE BUSCA ---
if(inputBusca){
    inputBusca.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        filtrarLista(filtroTabelaAtual, termo);
    });
}

// --- 2. FILTRAR E RENDERIZAR TABELA ---
window.filtrarLista = function(tipo, termo = '') {
    filtroTabelaAtual = tipo;
    
    // Se não foi passado termo (clique no botão), pega do input
    if (termo === '' && inputBusca) termo = inputBusca.value.toLowerCase();

    // A. Atualiza Visual (Abas e Títulos)
    if (tipo === 'cliente') {
        btnFilterCliente.classList.add('active');
        btnFilterProfissional.classList.remove('active');
        tituloEl.innerText = "Lista de Pacientes Cadastrados";
        
        // Cabeçalho para Paciente (Sem Especialidade)
        headerEl.innerHTML = `
            <th width="50">ID</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Email</th>
            <th class="text-center">Ações</th>
        `;
    } else {
        btnFilterProfissional.classList.add('active');
        btnFilterCliente.classList.remove('active');
        tituloEl.innerText = "Lista de Profissionais Cadastrados";

        // Cabeçalho para Profissional (Com Especialidade)
        headerEl.innerHTML = `
            <th width="50">ID</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Email</th>
            <th>Especialidade</th>
            <th class="text-center">Ações</th>
        `;
    }

    // B. Filtra Dados (Por Tipo E Por Busca)
    const filtrados = todosUsuarios.filter(u => {
        const matchTipo = u.tipo_usuario === tipo;
        const matchBusca = u.nome_usuario.toLowerCase().includes(termo) || 
                           u.email.toLowerCase().includes(termo) ||
                           (u.cpf && u.cpf.includes(termo));
        return matchTipo && matchBusca;
    });

    // C. Renderiza
    if (!filtrados || filtrados.length === 0) {
        const colSpan = tipo === 'cliente' ? 5 : 6;
        listaBody.innerHTML = `<tr><td colspan='${colSpan}' class='text-center' style="padding:20px;">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    listaBody.innerHTML = filtrados.map(u => `
        <tr>
            <td class="col-id">#${u.id_usuario}</td>
            <td class="col-nome">${u.nome_usuario}</td>
            <td>${u.cpf || '---'}</td>
            <td>${u.email}</td>
            
            ${tipo === 'profissional' ? 
                `<td><span style="background:#e0f2f1; color:#00695c; padding:4px 8px; border-radius:12px; font-size:0.9em; font-weight:bold;">
                    ${u.especialidade || '-'}
                 </span></td>` 
                : '' 
            }
            
            <td class="col-actions text-center" style="white-space: nowrap;">
                <button class="action-btn btn-edit" data-id="${u.id_usuario}" title="Editar">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="action-btn btn-delete" data-id="${u.id_usuario}" title="Excluir">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    adicionarEventosTabela();
}

// --- 3. CONFIGURAÇÃO DE EVENTOS DO MODAL ---
function configurarEventos() {
    // Abrir Modal (Novo Cadastro)
    btnNovo.addEventListener('click', () => {
        limparFormulario();
        if(modalTitulo) modalTitulo.innerText = "Novo Cadastro";
        if(inputCpf) inputCpf.disabled = false; // CPF liberado no cadastro
        modal.classList.add('active');
    });

    // Fechar Modal
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    // Abas do Modal
    btnTabCliente.addEventListener('click', () => mudarAbaCadastro('cliente'));
    btnTabProfissional.addEventListener('click', () => mudarAbaCadastro('profissional'));

    // Cálculo do Sinal
    if(inputValor) {
        inputValor.addEventListener('input', () => {
            const v = parseFloat(inputValor.value) || 0;
            if(inputSinal) inputSinal.value = (v * 0.20).toFixed(2);
        });
    }

    // Botão Salvar
    btnSalvar.addEventListener('click', salvarUsuario);
}

// Lógica visual das abas do Modal
function mudarAbaCadastro(tipo) {
    tipoCadastroAtual = tipo;
    if (tipo === 'cliente') {
        btnTabCliente.classList.add('active');
        btnTabProfissional.classList.remove('active');
        areaProfissional.style.display = 'none';
    } else {
        btnTabProfissional.classList.add('active');
        btnTabCliente.classList.remove('active');
        areaProfissional.style.display = 'block';
    }
}

// Limpa o formulário para estado inicial
function limparFormulario() {
    if(inputId) inputId.value = '';
    if(inputNome) inputNome.value = '';
    if(inputEmail) inputEmail.value = '';
    if(inputCpf) inputCpf.value = '';
    if(inputSenha) inputSenha.value = '';
    if(inputEspecialidade) inputEspecialidade.value = '';
    if(inputValor) inputValor.value = '';
    if(inputSinal) inputSinal.value = '';
    
    // Reseta visual
    btnSalvar.innerText = "Salvar Cadastro";
    mudarAbaCadastro('cliente');
}

// --- 4. FUNÇÃO SALVAR (CADASTRAR OU EDITAR) ---
async function salvarUsuario() {
    const id = inputId.value; // Se tem ID, é edição
    const nome = inputNome.value;
    const email = inputEmail.value;
    const cpf = inputCpf.value;
    const senha = inputSenha.value;

    // Validações
    if (!id && !senha) return alert("A senha é obrigatória para novos cadastros.");
    if (!nome || !email || !cpf) return alert("Preencha Nome, Email e CPF.");

    const dados = { id, nome, email, cpf, senha, tipo: tipoCadastroAtual };

    // Validação específica para profissional
    if (tipoCadastroAtual === 'profissional') {
        const especialidade = inputEspecialidade.value;
        const valor = inputValor.value;
        if (!especialidade || !valor) return alert("Preencha Especialidade e Valor.");
        dados.especialidade = especialidade;
        dados.valor = valor;
    }

    const textoOriginal = btnSalvar.innerText;
    btnSalvar.innerText = "Processando...";
    btnSalvar.disabled = true;

    try {
        let res;
        if (id) {
            // EDITAR
            res = await window.api.editarUsuario(dados);
        } else {
            // CADASTRAR
            res = await window.api.cadastrarUsuario(dados);
        }

        if (res.success) {
            alert(id ? "Usuário atualizado!" : "Cadastro realizado!");
            modal.classList.remove('active');
            buscarDados(); // Recarrega a tabela
        } else {
            alert("Erro: " + (res.erro || "Falha desconhecida"));
        }
    } catch (error) {
        console.error(error);
        alert("Erro interno ao salvar.");
    } finally {
        btnSalvar.innerText = textoOriginal;
        btnSalvar.disabled = false;
    }
}

// --- 5. FUNÇÃO PARA PREENCHER O MODAL (EDIÇÃO) ---
async function preencherEdicao(id) {
    try {
        // Busca dados completos do usuário
        const usuario = await window.api.buscarUsuarioPorId(id);
        if (!usuario) return alert("Erro ao buscar dados do usuário.");

        limparFormulario();
        
        // Preenche campos comuns
        if(inputId) inputId.value = usuario.id_usuario;
        if(inputNome) inputNome.value = usuario.nome_usuario;
        if(inputEmail) inputEmail.value = usuario.email;
        if(inputCpf) {
            inputCpf.value = usuario.cpf;
            inputCpf.disabled = true; // Bloqueia CPF na edição (segurança)
        }

        // Configura tipo e aba
        mudarAbaCadastro(usuario.tipo_usuario);

        // Se for profissional, preenche campos extras
        if (usuario.tipo_usuario === 'profissional') {
            if(inputEspecialidade) inputEspecialidade.value = usuario.especialidade || '';
            
            if(inputValor) {
                const val = usuario.valor_consulta || 0;
                inputValor.value = val;
                if(inputSinal) inputSinal.value = (val * 0.20).toFixed(2);
            }
        }

        // Ajusta UI do Modal para "Modo Edição"
        if(modalTitulo) modalTitulo.innerText = "Editar Usuário";
        btnSalvar.innerText = "Salvar Alterações";
        modal.classList.add('active');

    } catch (error) {
        console.error("Erro no preenchimento:", error);
        alert("Erro ao carregar edição.");
    }
}

// --- 6. EVENTOS DA TABELA (Excluir/Editar) ---
function adicionarEventosTabela() {
    // Botão Excluir
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            const id = target.dataset.id;
            
            if(confirm("Tem certeza que deseja excluir?")) {
                const res = await window.api.excluirUsuario(id);
                if(res.success) buscarDados(); // Recarrega
                else alert("Erro: " + res.erro);
            }
        });
    });

    // Botão Editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            const id = target.dataset.id;
            preencherEdicao(id);
        });
    });
}

// Inicia
init();