// src/Renderer/Views/Usuario/usuarios.js
 
// 1. Elementos Globais
const listaEl = document.getElementById('lista-usuarios');
const headerEl = document.getElementById('table-header');
const tituloEl = document.getElementById('titulo-lista');
const modal = document.getElementById('modal-cadastro');
 
// Elementos de Ação e Filtro
const btnNovo = document.getElementById('btn-novo-usuario');
const btnClose = document.getElementById('btn-close-modal');
const btnSalvar = document.getElementById('btn-salvar-usuario');
 
const btnFilterCliente = document.getElementById('filter-cliente');
const btnFilterProfissional = document.getElementById('filter-profissional');
 
// Elementos de Busca Avançada (Novos)
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
let tipoCadastroAtual = 'cliente'; // Para o Modal (Novo Cadastro)
let tabAtiva = 'cliente';          // Aba selecionada (Paciente vs Profissional)
 
async function init() {
    if (!window.electronAPI) {
        console.error("ERRO: window.electronAPI não encontrada.");
        return;
    }
 
    // Eventos de Busca em tempo real
    inputBusca.addEventListener('keyup', aplicarFiltros);
    selectFiltroTipo.addEventListener('change', aplicarFiltros);
    
    // Eventos de troca de Aba (Filtro Categoria)
    btnFilterCliente.addEventListener('click', () => trocarAba('cliente'));
    btnFilterProfissional.addEventListener('click', () => trocarAba('profissional'));
 
    configurarEventosModal();
    
    // Carrega dados iniciais
    await buscarDados();
}
 
// --- 1. BUSCA DE DADOS ---
async function buscarDados() {
    try {
        listaEl.innerHTML = "<tr><td colspan='7' class='text-center'>Carregando...</td></tr>";
        todosUsuarios = await window.electronAPI.listarUsuarios();
        aplicarFiltros(); // Renderiza com os dados carregados
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        listaEl.innerHTML = "<tr><td colspan='7' class='text-center' style='color:red'>Erro ao conectar com servidor.</td></tr>";
    }
}
 
// --- 2. LÓGICA DE FILTRAGEM E TABELAS ---
function trocarAba(tipo) {
    tabAtiva = tipo;
    
    // Atualiza botões
    if(tipo === 'cliente') {
        btnFilterCliente.classList.add('active');
        btnFilterProfissional.classList.remove('active');
        tituloEl.innerText = "Lista de Pacientes";
    } else {
        btnFilterProfissional.classList.add('active');
        btnFilterCliente.classList.remove('active');
        tituloEl.innerText = "Lista de Profissionais";
    }
 
    // Limpa busca ao trocar de aba (opcional)
    inputBusca.value = ''; 
    aplicarFiltros();
}
 
function aplicarFiltros() {
    const termo = inputBusca.value.toLowerCase();
    const colunaFiltro = selectFiltroTipo.value; // 'nome', 'cpf' ou 'email'
 
    // Passo 1: Filtrar pela Aba (Cliente ou Profissional)
    let filtrados = todosUsuarios.filter(u => u.tipo_usuario === tabAtiva);
 
    // Passo 2: Filtrar pelo Termo de Busca (se houver)
    if (termo) {
        filtrados = filtrados.filter(u => {
            let valorParaChecar = '';
            
            // Mapeia a seleção do dropdown para a propriedade do objeto
            switch(colunaFiltro) {
                case 'nome':  valorParaChecar = u.nome_usuario; break;
                case 'cpf':   valorParaChecar = u.cpf; break;
                case 'email': valorParaChecar = u.email_usuario; break;
                default:      valorParaChecar = u.nome_usuario;
            }
 
            return valorParaChecar && valorParaChecar.toLowerCase().includes(termo);
        });
    }
 
    renderizarTabela(filtrados);
}
 
function renderizarTabela(dados) {
    // Define o Cabeçalho (com a coluna TIPO inclusa)
    let htmlHeader = `
        <th width="50">ID</th>
        <th>Nome</th>
        <th>CPF</th>
        <th>Email</th>
        <th>Tipo</th>
    `;
 
    // Se for profissional, adiciona Especialidade
    if (tabAtiva === 'profissional') {
        htmlHeader += `<th>Especialidade</th>`;
    }
    
    htmlHeader += `<th class="text-center">Ações</th>`;
    headerEl.innerHTML = htmlHeader;
 
    // Define o Corpo
    if (dados.length === 0) {
        // Ajusta colspan baseado no número de colunas
        const colSpan = tabAtiva === 'profissional' ? 7 : 6;
        listaEl.innerHTML = `<tr><td colspan='${colSpan}' class='text-center' style="padding:20px;">Nenhum registro encontrado.</td></tr>`;
        return;
    }
 
    listaEl.innerHTML = dados.map(u => {
        // Estiliza o badge de tipo
        const tipoClass = `badge-${u.tipo_usuario ? u.tipo_usuario.toLowerCase() : 'cliente'}`;
        const tipoLabel = u.tipo_usuario ? u.tipo_usuario.charAt(0).toUpperCase() + u.tipo_usuario.slice(1) : 'Cliente';
 
        return `
        <tr>
            <td class="col-id">#${u.id_usuario}</td>
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
 
// --- 3. MODAL E CADASTRO (Lógica Mantida) ---
function configurarEventosModal() {
    // Abrir/Fechar Modal
    btnNovo.addEventListener('click', () => { limparFormulario(); modal.classList.add('active'); });
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.remove('active'); });
 
    // Abas Internas do Modal
    btnTabCliente.addEventListener('click', () => mudarAbaCadastro('cliente'));
    btnTabProfissional.addEventListener('click', () => mudarAbaCadastro('profissional'));
 
    // Máscara CPF
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
 
    // Cálculo do Sinal
    if(inputValor) {
        inputValor.addEventListener('input', () => {
            const v = parseFloat(inputValor.value) || 0;
            inputSinal.value = (v * 0.20).toFixed(2);
        });
    }
 
    btnSalvar.addEventListener('click', salvarUsuario);
}
 
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
 
function limparFormulario() {
    document.getElementById('cad-nome').value = '';
    document.getElementById('cad-email').value = '';
    document.getElementById('cad-cpf').value = '';
    document.getElementById('cad-senha').value = '';
    if(document.getElementById('cad-especialidade')) document.getElementById('cad-especialidade').value = '';
    if(inputValor) inputValor.value = '';
    if(inputSinal) inputSinal.value = '';
    mudarAbaCadastro('cliente');
}
 
async function salvarUsuario() {
    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    const cpf = document.getElementById('cad-cpf').value;
    const senha = document.getElementById('cad-senha').value;
 
    if (!nome || !email || !senha) return alert("Preencha os campos obrigatórios.");
 
    const dados = { nome, email, cpf, senha, tipo: tipoCadastroAtual };
    
    if (tipoCadastroAtual === 'profissional') {
        const especialidade = document.getElementById('cad-especialidade').value;
        const valor = inputValor.value;
        if (!especialidade || !valor) return alert("Profissionais precisam de Especialidade e Valor.");
        dados.especialidade = especialidade;
        dados.valor = valor;
    }
 
    const txtOriginal = btnSalvar.innerText;
    btnSalvar.innerText = "Salvando...";
    btnSalvar.disabled = true;
 
    try {
        const res = await window.electronAPI.cadastrarUsuario(dados);
        if (res.success) {
            alert("Cadastro realizado!");
            modal.classList.remove('active');
            buscarDados();
        } else {
            alert("Erro: " + (res.erro || "Falha desconhecida"));
        }
    } catch (e) { console.error(e); alert("Erro interno."); } 
    finally { btnSalvar.innerText = txtOriginal; btnSalvar.disabled = false; }
}
 
function adicionarEventosTabela() {
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm("Tem certeza que deseja excluir?")) {
                const id = e.target.closest('button').dataset.id;
                const res = await window.electronAPI.excluirUsuario(id);
                if(res.success) buscarDados();
                else alert("Erro ao excluir: " + res.erro);
            }
        });
    });
    // Edição pode ser adicionada aqui posteriormente
}
 
// Inicia
init();