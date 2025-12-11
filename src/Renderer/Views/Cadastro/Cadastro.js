// src/Renderer/Views/Cadastro/cadastro.js

// Estado atual (padrão: cliente)
let tipoAtual = 'cliente';

// --- ELEMENTOS DO DOM ---
const inputConsulta = document.getElementById('valorConsulta');
const inputSinal = document.getElementById('valorSinal');
const inputCpf = document.getElementById('cpf');

// --- 1. MÁSCARA DE CPF ---
// Formata automaticamente enquanto digita: 000.000.000-00
if (inputCpf) {
    inputCpf.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
        if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos
        
        // Aplica a máscara
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        
        e.target.value = value;
    });
}

// --- 2. CÁLCULO AUTOMÁTICO DO SINAL (20%) ---
if (inputConsulta && inputSinal) {
    inputConsulta.addEventListener('input', () => {
        const valor = parseFloat(inputConsulta.value);
        if (!isNaN(valor)) {
            // Calcula 20% e fixa em 2 casas decimais
            inputSinal.value = (valor * 0.20).toFixed(2);
        } else {
            inputSinal.value = '';
        }
    });
}

// --- 3. FUNÇÃO PARA TROCAR ABAS (Paciente/Profissional) ---
// Atribuída ao window para funcionar no onclick do HTML
window.mudarTipo = function(tipo) {
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
};

// --- 4. FUNÇÃO DE SALVAR ---
document.getElementById('btn-salvar').addEventListener('click', async () => {
    // Coleta dados comuns
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const cpf = document.getElementById('cpf').value;
    
    // Validação Básica
    if(!nome || !email || !senha || !cpf) {
        return await alert("Por favor, preencha todos os campos obrigatórios (incluindo CPF).");
    }

    // Objeto base para envio
    const dados = {
        nome,
        email,
        cpf,
        senha,
        tipo: tipoAtual
    };

    // Validação Específica de Profissional
    if (tipoAtual === 'profissional') {
        const especialidade = document.getElementById('especialidade').value;
        const valor = document.getElementById('valorConsulta').value;

        if(!especialidade || !valor) {
            return await alert("Profissionais precisam preencher Especialidade e Valor da Consulta.");
        }

        dados.especialidade = especialidade;
        dados.valor = valor;
    }

    // Verifica API (Usa 'api' conforme preload.js)
    if (!window.api || !window.api.cadastrarUsuario) {
        return await alert("Erro Crítico: API não encontrada. Reinicie o aplicativo.");
    }

    try {
        // Envia para o Backend
        const res = await window.api.cadastrarUsuario(dados);

        if (res.success) {
            // Sucesso! Mostra msg e redireciona
            await alert("Cadastro realizado com sucesso!");
            
            // Redireciona para a agenda
            window.location.href = '../Agendamento/agendamento.html';
        } else {
            await alert("Erro ao cadastrar: " + res.erro);
        }
    } catch (error) {
        console.error(error);
        await alert("Erro interno no sistema.");
    }
});