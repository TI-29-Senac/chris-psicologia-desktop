function initializeHeaderServices() {
  // Impede a reinicialização se o script for carregado novamente.
  if (window.headerServicesInitialized) {
    return;
  }

  const sideModal = document.getElementById("side-modal");
  const menuTrigger = document.getElementById("menu-trigger");
  const closeModal = document.getElementById("close-modal");
  const overlay = document.getElementById("overlay");

  // Se os elementos do cabeçalho não estiverem nesta página, não faz nada.
  if (!sideModal || !menuTrigger || !closeModal || !overlay) {
    return;
  }

  // --- Model (Estado da Aplicação) ---
  const state = {
    isModalOpen: false,
  };

  // --- View (Funções de Renderização) ---
  const renderModal = () => {
    sideModal.classList.toggle("active", state.isModalOpen);
    overlay.classList.toggle("active", state.isModalOpen);
  };

  // --- Controller ---
  const controller = {
    toggleModal: () => {
      state.isModalOpen = !state.isModalOpen;
      renderModal();
    },
  };

  // --- Inicialização dos Eventos ---
  menuTrigger.addEventListener("click", controller.toggleModal);
  closeModal.addEventListener("click", controller.toggleModal);
  overlay.addEventListener("click", controller.toggleModal);

  window.headerServicesInitialized = true;
}

document.addEventListener("DOMContentLoaded", initializeHeaderServices);