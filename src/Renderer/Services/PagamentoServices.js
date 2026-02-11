const PagamentoServices = (() => {

  // --- VERIFICAÇÃO DE SESSÃO (NOVO) ---
  const checkSession = () => {
    // ALTERAÇÃO: localStorage
    const sessao = localStorage.getItem('usuario_logado');
    if (!sessao) {
      window.location.href = '../../../../index.html';
      return false;
    }
    return true;
  };

  const tbody = document.getElementById('lista-pagamentos');
  const btnAtualizar = document.getElementById('btn-atualizar');
  const totalTransacoesEl = document.getElementById('total-transacoes');

  const ITEMS_PER_PAGE = 10;
  let todosDados = [];
  let paginaAtual = 1;

  const carregarDados = async () => {
    // 1. Mostrar loading
    if (tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">Atualizando...</td></tr>';

    // 2. Pedir dados ao Backend
    const resultado = await window.electronAPI.listarPagamentos();

    if (resultado.success) {
      todosDados = resultado.data || [];
      if (totalTransacoesEl) totalTransacoesEl.innerText = todosDados.length;

      // --- Busca o Total do Mês ---
      try {
        const resTotal = await window.electronAPI.obterTotalMes();
        const elTotal = document.getElementById('total-recebido-mes');
        if (elTotal && resTotal.success) {
          elTotal.innerText = 'R$ ' + parseFloat(resTotal.total).toFixed(2).replace('.', ',');
        }
      } catch (errTotal) { console.error(errTotal); }

      renderizarPagina(1);
    } else {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Erro ao carregar.</td></tr>';
    }
  };

  const renderizarPagina = (pagina) => {
    paginaAtual = pagina;
    tbody.innerHTML = '';

    if (todosDados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum registro encontrado.</td></tr>';
      document.getElementById('paginacao-container').innerHTML = '';
      return;
    }

    const inicio = (pagina - 1) * ITEMS_PER_PAGE;
    const fim = inicio + ITEMS_PER_PAGE;
    const paginados = todosDados.slice(inicio, fim);

    paginados.forEach(item => {
      const row = document.createElement('tr');
      // Formata Data e Hora
      const dataObj = new Date(item.data);
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();
      const dataFormatada = `${dia}/${mes}/${ano}`;
      const horaFormatada = String(dataObj.getHours()).padStart(2, '0') + ':' + String(dataObj.getMinutes()).padStart(2, '0');
      // Tradução de método
      const metodoMap = { '1': 'Dinheiro', '2': 'Pix', '3': 'Crédito', '4': 'Débito' };
      // Se vier string do backend, usa, senão tenta mapear ID
      const metodoExibicao = item.metodo || metodoMap[item.id_forma_pagamento] || 'Desconhecido';

      row.innerHTML = `
          <td>${dataFormatada}</td>
          <td>${horaFormatada}</td>
          <td><small style="opacity: 0.7">${item.id}</small></td>
          <td>${item.email}</td>
          <td style="text-transform: capitalize;">${metodoExibicao}</td>
          <td>R$ ${parseFloat(item.valor || 0).toFixed(2).replace('.', ',')}</td>
          <td><span class="badge ${item.status}">${traduzirStatus(item.status)}</span></td>
        `;
      tbody.appendChild(row);
    });

    renderizarControles();
  };

  const renderizarControles = () => {
    const container = document.getElementById('paginacao-container');
    if (!container) return;

    const totalPaginas = Math.ceil(todosDados.length / ITEMS_PER_PAGE);

    // Se só tem 1 página, não precisa mostrar botão (Opcional, mas mostrarei para feedback)
    if (totalPaginas <= 1 && todosDados.length > 0) {
      container.innerHTML = `<span style="font-size: 12px; color: #888;">Mostrando ${todosDados.length} registros</span>`;
      return;
    }

    let html = '';

    // Botão Anterior
    html += `<button class="page-btn" ${paginaAtual === 1 ? 'disabled' : ''} onclick="PagamentoServices.mudarPagina(${paginaAtual - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;

    // Números (Lógica simples: mostra todos. Para muitos dados, ideal é ... )
    // Vou fazer uma lógica simplificada: se > 10 pags, mostra atual, primeira, ultima e vizinhos.
    // Para simplificar agora: mostra até 7 botões.

    for (let i = 1; i <= totalPaginas; i++) {
      // Se for a primeira, ultima, ou estiver a +/- 2 da atual
      if (i === 1 || i === totalPaginas || (i >= paginaAtual - 2 && i <= paginaAtual + 2)) {
        html += `<button class="page-btn ${i === paginaAtual ? 'active' : ''}" onclick="PagamentoServices.mudarPagina(${i})">${i}</button>`;
      } else if (i === paginaAtual - 3 || i === paginaAtual + 3) {
        html += `<span style="padding: 0 5px;">...</span>`;
      }
    }

    // Botão Próximo
    html += `<button class="page-btn" ${paginaAtual === totalPaginas ? 'disabled' : ''} onclick="PagamentoServices.mudarPagina(${paginaAtual + 1})"><i class="fa-solid fa-chevron-right"></i></button>`;

    container.innerHTML = html;
  };

  const traduzirStatus = (status) => {
    const mapa = {
      'succeeded': 'Aprovado',
      'pending': 'Pendente',
      'failed': 'Falhou'
    };
    return mapa[status] || status;
  };

  return {
    start: () => {
      // --- CHECAGEM ANTES DE INICIAR ---
      if (!checkSession()) return;

      console.log("Gestão Financeira Iniciada");
      carregarDados();

      if (btnAtualizar) {
        btnAtualizar.addEventListener('click', carregarDados);
      }
    },
    mudarPagina: (p) => renderizarPagina(p)
  };
})();

window.PagamentoServices = PagamentoServices;

// Auto-inicialização para facilitar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', PagamentoServices.start);
} else {
  PagamentoServices.start();
}