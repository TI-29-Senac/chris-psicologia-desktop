const PagamentoServices = (() => {
  const tbody = document.getElementById('lista-pagamentos');
  const btnAtualizar = document.getElementById('btn-atualizar');
  const totalTransacoesEl = document.getElementById('total-transacoes');

  const carregarDados = async () => {
    // 1. Mostrar loading
    if(tbody) tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Atualizando...</td></tr>';

    // 2. Pedir dados ao Backend (que pede ao Stripe)
    const resultado = await window.electronAPI.listarPagamentos();

    // 3. Renderizar
    if (tbody) tbody.innerHTML = ''; // Limpa

    if (resultado.success && resultado.data.length > 0) {
      if(totalTransacoesEl) totalTransacoesEl.innerText = resultado.data.length;

      resultado.data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.data}</td>
          <td><small style="opacity: 0.7">${item.id}</small></td>
          <td>${item.email}</td>
          <td style="text-transform: capitalize;">${item.metodo}</td>
          <td>R$ ${item.valor.replace('.', ',')}</td>
          <td><span class="badge ${item.status}">${traduzirStatus(item.status)}</span></td>
        `;
        tbody.appendChild(row);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma transação encontrada no Stripe (Modo Teste).</td></tr>';
    }
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
      console.log("Gestão Financeira Iniciada");
      carregarDados();
      
      if(btnAtualizar) {
        btnAtualizar.addEventListener('click', carregarDados);
      }
    }
  };
})();

// Auto-inicialização para facilitar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PagamentoServices.start);
} else {
    PagamentoServices.start();
}