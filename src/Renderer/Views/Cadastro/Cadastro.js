// Verifica se há sessão ativa (Segurança)
const sessao = localStorage.getItem('usuario_logado');
if (!sessao) {
    window.location.href = '../../../../index.html';
}

let tipoAtual = 'cliente';

// --- FUNÇÃO PARA TROCAR ABAS ---
function mudarTipo(tipo) {
    tipoAtual = tipo;
    
    const btnCliente = document.getElementById('btn-cliente');
    const btnProf = document.getElementById('btn-profissional');
    const areaProf = document.getElementById('area-profissional');

    if (tipo === 'cliente') {
        // Ativa aba Cliente
        btnCliente.classList.add('active');
        btnProf.classList.remove('active');
        // Esconde campos extras
        areaProf.style.display = 'none';
    } else {
        // Ativa aba Profissional
        btnProf.classList.add('active');
        btnCliente.classList.remove('active');
        // Mostra campos extras (Especialidade/Valor)
        areaProf.style.display = 'block';
    }
}

// --- FUNÇÃO DE SALVAR ---
document.getElementById('btn-salvar').addEventListener('click', async () => {
    // Coleta dados comuns
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    
    if(!nome || !email || !senha) {
        return alert("Por favor, preencha nome, email e senha.");
    }

    // Objeto base
    const dados = {
        nome,
        email,
        senha,
        tipo: tipoAtual
    };

    // Se for profissional, valida e pega os dados extras
    if (tipoAtual === 'profissional') {
        const especialidade = document.getElementById('especialidade').value;
        // CORREÇÃO: O ID no HTML é 'valorConsulta', não 'valor'
        const valorInput = document.getElementById('valorConsulta').value; 

        if(!especialidade || !valorInput) {
            return alert("Profissionais precisam preencher Especialidade e Valor.");
        }

        dados.especialidade = especialidade;
        dados.valor = valorInput;
    }

    // Verifica se a API do Electron está disponível
    if (!window.electronAPI || !window.electronAPI.cadastrarUsuario) {
        return alert("Erro: API de sistema não encontrada.");
    }

    try {
        // Envia para o Backend (UsuarioController -> Model -> API)
        const res = await window.electronAPI.cadastrarUsuario(dados);

        if (res.success) {
            alert("Usuário cadastrado com sucesso!");
            
            // CORREÇÃO: Redireciona para a lista de usuários, e não para agendamento
            window.location.href = '../Usuario/usuarios.html';
        } else {
            alert("Erro ao cadastrar: " + (res.erro || "Erro desconhecido"));
        }
    } catch (error) {
        console.error(error);
        alert("Erro interno ao tentar cadastrar.");
    }
});

// --- CÁLCULO AUTOMÁTICO DO SINAL ---
const consulta = document.getElementById("valorConsulta");
const sinal = document.getElementById("valorSinal");

if(consulta && sinal) {
    consulta.addEventListener("input", () => {
        const v = parseFloat(consulta.value) || 0;
        sinal.value = (v * 0.20).toFixed(2);
    });
}

// Expõe a função de mudar tipo para o HTML poder usar no onclick
window.mudarTipo = mudarTipo;