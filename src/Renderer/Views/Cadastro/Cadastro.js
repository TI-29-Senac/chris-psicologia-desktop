console.log("Script Cadastro.js carregado com sucesso!");

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
        btnCliente.classList.add('active');
        btnProf.classList.remove('active');
        areaProf.style.display = 'none';
    } else {
        btnProf.classList.add('active');
        btnCliente.classList.remove('active');
        areaProf.style.display = 'block';
    }
}

// --- FUNÇÃO DE SALVAR ---
document.getElementById('btn-salvar').addEventListener('click', async () => {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!nome || !email || !senha) {
        return alert("Por favor, preencha nome, email e senha.");
    }

    // --- VALIDAÇÃO DE EMAIL ---
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return alert("Por favor, insira um email válido (ex: nome@dominio.com).");
    }

    const dominiosPermitidos = [
        'gmail.com',
        'hotmail.com', 'hotmail.com.br',
        'outlook.com', 'outlook.com.br',
        'yahoo.com', 'yahoo.com.br',
        'live.com',
        'icloud.com'
    ];

    const dominioEmail = email.split('@')[1];
    if (!dominiosPermitidos.includes(dominioEmail)) {
        return alert(`O domínio @${dominioEmail} não é aceito. Use um dos seguintes: Gmail, Hotmail, Outlook, Yahoo, Live ou iCloud.`);
    }

    // OBJETO PADRONIZADO COM O BACKEND
    const dados = {
        nome_usuario: nome,
        email_usuario: email,
        senha_usuario: senha,
        tipo_usuario: tipoAtual, // 'cliente' ou 'profissional'
        cpf: document.getElementById('cpf')?.value || ""
    };

    if (tipoAtual === 'profissional') {
        dados.especialidade = document.getElementById('especialidade').value;
        dados.valor_consulta = document.getElementById('valorConsulta').value;
    }

    try {
        console.log("Enviando dados padronizados para o Electron:", dados);
        const res = await window.electronAPI.cadastrarUsuario(dados);

        if (res.success) {
            alert("Usuário cadastrado com sucesso!");
            window.location.href = '../Usuario/usuarios.html';
        } else {
            alert("Erro ao cadastrar: " + (res.erro || "Erro desconhecido"));
        }
    } catch (error) {
        console.error("Erro no processo de cadastro:", error);
        alert("Erro interno ao tentar cadastrar.");
    }
});

// --- CÁLCULO AUTOMÁTICO DO SINAL ---
const consulta = document.getElementById("valorConsulta");
const sinal = document.getElementById("valorSinal");

if (consulta && sinal) {
    consulta.addEventListener("input", () => {
        const v = parseFloat(consulta.value) || 0;
        sinal.value = (v * 0.20).toFixed(2);
    });
}

// Expõe a função para o HTML
window.mudarTipo = mudarTipo;