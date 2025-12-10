// src/Renderer/Views/Dashboard/dashboard.js

// 1. Recupera Sessão
const sessao = localStorage.getItem('usuario_logado');
let usuarioLogado = null;
 
if (!sessao) {
    // Se não tiver sessão, manda pro login
    window.location.href = '../../../../index.html';
} else {
    usuarioLogado = JSON.parse(sessao);
    console.log("Usuário carregado no Dashboard:", usuarioLogado); // Para debug
   
    // 2. Seleciona os elementos
    const nomeEl = document.querySelector('.user-name');
    const tipoEl = document.querySelector('.user-type'); 
    const welcomeEl = document.querySelector('.page-title p');
   
    // 3. Normaliza os dados (aceita nome ou nome_usuario)
    const nomeReal = usuarioLogado.nome || usuarioLogado.nome_usuario || "Usuário Sem Nome";
    const tipoReal = usuarioLogado.tipo || usuarioLogado.tipo_usuario;

    // 4. Preenche o Nome
    if(nomeEl) {
        nomeEl.textContent = nomeReal;
    }

    // 5. Preenche o Tipo
    if(tipoEl) {
        if (tipoReal) {
            // Capitaliza a primeira letra (ex: "profissional" -> "Profissional")
            const tipoFormatado = tipoReal.charAt(0).toUpperCase() + tipoReal.slice(1);
            tipoEl.textContent = tipoFormatado;
        } else {
            tipoEl.textContent = 'Usuário';
        }
    }

    // 6. Mensagem de Boas-vindas
    if(welcomeEl) {
        welcomeEl.textContent = `Bem-vindo de volta, ${nomeReal.split(' ')[0]}!`; // Pega só o primeiro nome
    }
   
    // Função de Logout
    window.logout = function() {
        localStorage.removeItem('usuario_logado');
        localStorage.removeItem('auth_token');
        window.location.href = '../../../../index.html';
    }
}

// -------------------------------------------------------------
// GRÁFICOS (CHART.JS)
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se o Chart.js foi carregado
    if (typeof Chart === 'undefined') return;

    Chart.defaults.font.family = "'Questrial', sans-serif";
    Chart.defaults.color = '#5D6D68';
    
    const colorPrimary = '#5D6D68';
    const colorSecondary = '#7A8F89';
    const colorAccent = '#d6e3d6';
 
    /* --- 1. Gráfico de Agendamentos (Linha) --- */
    const canvasAppt = document.getElementById('appointmentsChart');
    if (canvasAppt) {
        const ctxAppt = canvasAppt.getContext('2d');
        new Chart(ctxAppt, {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                datasets: [
                    {
                        label: 'Semana 1',
                        data: [12, 19, 15, 25, 22, 10],
                        borderColor: colorPrimary,
                        backgroundColor: 'rgba(93, 109, 104, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: colorPrimary,
                        pointRadius: 5
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
 
    /* --- 2. Gráfico de Usuários (Doughnut) --- */
    const canvasUsers = document.getElementById('usersChart');
    if (canvasUsers) {
        const ctxUsers = canvasUsers.getContext('2d');
        new Chart(ctxUsers, {
            type: 'doughnut',
            data: {
                labels: ['Ativos', 'Inativos', 'Novos'],
                datasets: [{
                    data: [300, 50, 100],
                    backgroundColor: [colorPrimary, colorAccent, '#E8D5B5'],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                cutout: '70%'
            }
        });
    }
 
    /* --- 3. Gráfico Financeiro (Barra) --- */
    const canvasFinance = document.getElementById('financeChart');
    if (canvasFinance) {
        const ctxFinance = canvasFinance.getContext('2d');
        new Chart(ctxFinance, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr'],
                datasets: [{
                    label: 'Receita (R$)',
                    data: [4500, 5200, 4800, 6100],
                    backgroundColor: colorSecondary,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { display: false },
                    x: { grid: { display: false } }
                }
            }
        });
    }
});