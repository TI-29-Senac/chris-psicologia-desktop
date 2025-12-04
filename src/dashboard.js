// src/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
  // Configuração global de cores para combinar com o tema
  Chart.defaults.font.family = "'Questrial', sans-serif";
  Chart.defaults.color = '#5D6D68';
  const colorPrimary = '#5D6D68';
  const colorSecondary = '#7A8F89';
  const colorAccent = '#d6e3d6';

  /* --- 1. Gráfico de Agendamentos (Linha) --- */
 const ctxAppt = document.getElementById('appointmentsChart').getContext('2d');

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
      },
      {
        label: 'Semana 2',
        data: [14, 17, 20, 18, 26, 12],
        borderColor: '#9ac2abff',
        backgroundColor: 'rgba(108, 140, 122, 0.15)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6c8c7a',
        pointRadius: 5
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true }
    },
    scales: {
      y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
      x: { grid: { display: false } }
    }
  }
});


  /* --- 2. Gráfico de Usuários (Doughnut) --- */
  const ctxUsers = document.getElementById('usersChart').getContext('2d');
  new Chart(ctxUsers, {
    type: 'doughnut',
    data: {
      labels: ['Ativos', 'Inativos', 'Novos'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: [
          colorPrimary,    // #5D6D68
          colorAccent,     // #d6e3d6
          '#E8D5B5'       // Uma cor creme mais escura para contraste
        ],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      },
      cutout: '70%' // Espessura da rosca
    }
  });

  /* --- 3. Gráfico Financeiro (Barra) --- */
  const ctxFinance = document.getElementById('financeChart').getContext('2d');
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
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { 
          beginAtZero: true, 
          grid: { display: false },
          ticks: { display: false } // Ocultar valores do eixo Y para visual mais limpo
        },
        x: { grid: { display: false } }
      }
    }
  });
});