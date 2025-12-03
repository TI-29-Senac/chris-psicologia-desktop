const PagamentoServices = (() => {
  let state = {};
  let elements = {};
  let listeners = []; // Armazena os listeners para poder removê-los depois

  const renderPaymentMethod = () => {
    if (!elements.creditForm) return; // Garante que os elementos existem
    const isCredit = state.activePaymentMethod === 'credit';

    elements.creditForm.classList.toggle('active-form', isCredit);
    elements.creditForm.classList.toggle('hidden-form', !isCredit);
    elements.pixArea.classList.toggle('active-form', !isCredit);
    elements.pixArea.classList.toggle('hidden-form', isCredit);

    elements.creditBtns.forEach(btn => btn.classList.toggle('active', isCredit));
    elements.pixBtns.forEach(btn => btn.classList.toggle('active', !isCredit));
  };

  const controller = {
    switchPaymentMethod: (method) => {
      if (state.activePaymentMethod !== method) {
        state.activePaymentMethod = method;
        renderPaymentMethod();
      }
    },
    handleConfirm: async () => {
      const dadosPagamento = {
        valor: 150.00, // Exemplo
        metodo: state.activePaymentMethod,
      };
      const resultado = await window.electronAPI.processarPagamento(dadosPagamento);
      alert(resultado.message);
    },
  };

  // Função para adicionar um event listener e guardá-lo para remoção futura
  function addManagedListener(element, event, handler) {
    element.addEventListener(event, handler);
    listeners.push({ element, event, handler });
  }

  return {
    // Inicia a lógica da página
    start: () => {
      // 1. Encontra os elementos na DOM
      elements = {
        creditForm: document.getElementById('credit-form'),
        pixArea: document.getElementById('pix-area'),
        confirmBtn: document.querySelector('.confirm-btn'),
        creditBtns: document.querySelectorAll('.tab-btn[data-method="credit"]'),
        pixBtns: document.querySelectorAll('.tab-btn[data-method="pix"]'),
      };

      // Se os elementos principais não existem, não faz nada
      if (!elements.creditForm || !elements.pixArea) {
        console.warn("Elementos do formulário de pagamento não encontrados. O serviço não será iniciado.");
        return;
      }

      // 2. Reseta o estado
      state = {
        activePaymentMethod: 'credit',
      };

      // 3. Adiciona os event listeners de forma gerenciada
      elements.creditBtns.forEach(btn => {
        addManagedListener(btn, 'click', () => controller.switchPaymentMethod('credit'));
      });
      elements.pixBtns.forEach(btn => {
        addManagedListener(btn, 'click', () => controller.switchPaymentMethod('pix'));
      });

      if (elements.confirmBtn) {
        addManagedListener(elements.confirmBtn, 'click', controller.handleConfirm);
      }

      // 4. Renderiza o estado inicial
      renderPaymentMethod();
      console.log("Serviço de Pagamento INICIADO.");
    },

    // Para a lógica e limpa os listeners
    stop: () => {
      listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      listeners = []; // Limpa o array de listeners
      elements = {}; // Limpa as referências aos elementos
      console.log("Serviço de Pagamento PARADO.");
    },
  };
})();
