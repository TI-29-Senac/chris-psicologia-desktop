// src/Renderer/Views/Usuarios/usuarios.js
 
// 1. Elementos Globais
const listaEl = document.getElementById('lista-usuarios');
const headerEl = document.getElementById('table-header');
const tituloEl = document.getElementById('titulo-lista');
const modal = document.getElementById('modal-cadastro');
const btnNovo = document.getElementById('btn-novo-usuario');
const btnClose = document.getElementById('btn-close-modal');
const btnSalvar = document.getElementById('btn-salvar-usuario');
 
// Filtros da Tabela
const btnFilterCliente = document.getElementById('filter-cliente');
const btnFilterProfissional = document.getElementById('filter-profissional');
 
// Formulário do Modal
const btnTabCliente = document.getElementById('btn-tab-cliente');
const btnTabProfissional = document.getElementById('btn-tab-profissional');
const areaProfissional = document.getElementById('area-profissional');
const inputValor = document.getElementById('cad-valor');
const inputSinal = document.getElementById('cad-sinal');
const inputCpf = document.getElementById('cad-cpf');
 
// Estado
let todosUsuarios = [];
let tipoCadastroAtual = 'cliente'; // Para o Modal (Novo Cadastro)
let filtroTabelaAtual = 'cliente'; // Para a Lista (Visualização)
 
async function init() {
    // CORREÇÃO: Usando 'electronAPI'
    if (!window.electronAPI) {
        console.error("ERRO: window.electronAPI não encontrada.");
        alert("Erro crítico: API do sistema não carregada.");
        return;
    }
 
    // Carrega dados iniciais
    await buscarDados();
    configurarEventos();
   
    // Configura máscara de CPF no Modal
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
 
// --- BUSCAR DADOS (USANDO electronAPI) ---
async function buscarDados() {
    try {
        // CORREÇÃO: electronAPI
        todosUsuarios = await window.electronAPI.listarUsuarios();
        filtrarLista(filtroTabelaAtual); // Renderiza a tabela correta
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        listaEl.innerHTML = "<tr><td colspan='6' class='text-center' style='color:red'>Erro ao conectar com servidor.</td></tr>";
    }
}
 
// --- FILTRAGEM E RENDERIZAÇÃO DA LISTA ---
// Chamado pelos botões de filtro no HTML: onclick="window.filtrarLista('...')"
window.filtrarLista = function(tipo) {
    filtroTabelaAtual = tipo;
 
    // 1. Atualiza Visual dos Botões e Título
    if (tipo === 'cliente') {
        btnFilterCliente.classList.add('active');
        btnFilterProfissional.classList.remove('active');
        tituloEl.innerText = "Lista de Pacientes Cadastrados";
       
        // Remove coluna Especialidade
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
 
        // Adiciona coluna Especialidade
        headerEl.innerHTML = `
            <th width="50">ID</th>
            <th>Nome</th>
            <th>CPF</th>
            <th>Email</th>
            <th>Especialidade</th>
            <th class="text-center">Ações</th>
        `;
    }
 
    // 2. Filtra Dados
    const filtrados = todosUsuarios.filter(u => u.tipo_usuario === tipo);
 
    // 3. Renderiza Tabela
    if (filtrados.length === 0) {
        const colSpan = tipo === 'cliente' ? 5 : 6;
        listaEl.innerHTML = `<tr><td colspan='${colSpan}' class='text-center' style="padding:20px;">Nenhum registro encontrado.</td></tr>`;
        return;
    }
 
    listaEl.innerHTML = filtrados.map(u => `
        <tr>
            <td class="col-id">#${u.id_usuario}</td>
            <td class="col-nome">${u.nome_usuario}</td>
            <td>${u.cpf || '---'}</td>
            <td>${u.email_usuario}</td>
            ${tipo === 'profissional' ? `<td>${u.especialidade || '-'}</td>` : ''}
            <td class="col-actions text-center">
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
 
// --- CONFIGURAÇÃO DE EVENTOS DO MODAL ---
function configurarEventos() {
    // Abrir Modal
    btnNovo.addEventListener('click', () => {
        limparFormulario();
        modal.classList.add('active');
    });
 
    // Fechar Modal
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
 
    // Abas do Modal (Novo Cadastro)
    btnTabCliente.addEventListener('click', () => mudarAbaCadastro('cliente'));
    btnTabProfissional.addEventListener('click', () => mudarAbaCadastro('profissional'));
 
    // Cálculo do Sinal
    if(inputValor) {
        inputValor.addEventListener('input', () => {
            const v = parseFloat(inputValor.value) || 0;
            inputSinal.value = (v * 0.20).toFixed(2);
        });
    }
 
    // Salvar
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
 
function limparFormulario() {
    document.getElementById('cad-nome').value = '';
    document.getElementById('cad-email').value = '';
    document.getElementById('cad-cpf').value = '';
    document.getElementById('cad-senha').value = '';
   
    // Limpa campos de profissional se existirem
    const espEl = document.getElementById('cad-especialidade');
    if(espEl) espEl.value = '';
    if(inputValor) inputValor.value = '';
    if(inputSinal) inputSinal.value = '';
   
    mudarAbaCadastro('cliente');
}
 
// --- SALVAR USUÁRIO (USANDO electronAPI) ---
async function salvarUsuario() {
    const nome = document.getElementById('cad-nome').value;
    const email = document.getElementById('cad-email').value;
    const cpf = document.getElementById('cad-cpf').value;
    const senha = document.getElementById('cad-senha').value;
 
    if (!nome || !email || !senha || !cpf) {
        return alert("Preencha os campos obrigatórios (Nome, Email, CPF, Senha).");
    }
 
    const dados = { nome, email, cpf, senha, tipo: tipoCadastroAtual };
 
    if (tipoCadastroAtual === 'profissional') {
        const especialidade = document.getElementById('cad-especialidade').value;
        const valor = inputValor.value;
 
        if (!especialidade || !valor) {
            return alert("Profissionais precisam de Especialidade e Valor.");
        }
        dados.especialidade = especialidade;
        dados.valor = valor;
    }
 
    const textoOriginal = btnSalvar.innerText;
    btnSalvar.innerText = "Salvando...";
    btnSalvar.disabled = true;
 
    try {
        // CORREÇÃO: electronAPI
        const res = await window.electronAPI.cadastrarUsuario(dados);
 
        if (res.success) {
            alert("Cadastro realizado com sucesso!");
            modal.classList.remove('active');
            buscarDados(); // Atualiza a lista na tela
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
 
// --- EVENTOS DA TABELA (Excluir/Editar) ---
function adicionarEventosTabela() {
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            const id = target.dataset.id;
           
            if(confirm("Tem certeza que deseja excluir este usuário?")) {
                try {
                    // CORREÇÃO: electronAPI
                    const res = await window.electronAPI.excluirUsuario(id);
                    if(res.success) {
                        buscarDados(); // Recarrega
                    } else {
                        alert("Erro ao excluir: " + res.erro);
                    }
                } catch(err) {
                    console.error(err);
                }
            }
        });
    });
 
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            alert("Edição via modal será implementada em breve.");
        });
    });
}
 
// Inicia
init();