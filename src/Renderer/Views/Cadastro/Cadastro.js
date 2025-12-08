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
        const valor = document.getElementById('valor').value;

        if(!especialidade || !valor) {
            return alert("Profissionais precisam preencher Especialidade e Valor.");
        }

        dados.especialidade = especialidade;
        dados.valor = valor;
    }

    // Verifica se a API do Electron está disponível
    if (!window.api || !window.api.cadastrarUsuario) {
        return alert("Erro: API de sistema não encontrada. Verifique o preload.js");
    }

    try {
        // Envia para o Backend (UsuarioController)
        const res = await window.api.cadastrarUsuario(dados);

        if (res.success) {
            alert("Usuário cadastrado com sucesso!");
            
            // Redireciona para a tela de Agendamentos
            // O "../Agendamento" significa: sai da pasta Cadastro e entra na Agendamento
            window.location.href = '../Agendamento/agendamento.html';
        } else {
            alert("Erro ao cadastrar: " + res.erro);
        }
    } catch (error) {
        console.error(error);
        alert("Erro interno ao tentar cadastrar.");
    }
});

// Expõe a função de mudar tipo para o HTML poder usar no onclick
window.mudarTipo = mudarTipo;