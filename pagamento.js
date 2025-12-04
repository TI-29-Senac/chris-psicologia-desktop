document.addEventListener('DOMContentLoaded', () => {
  // Elementos do Modal
  const menuTrigger = document.getElementById('menu-trigger');
  const sideModal = document.getElementById('side-modal');
  const closeModal = document.getElementById('close-modal');
  const overlay = document.getElementById('overlay');

  // Função para fechar o modal
  const closeSideModal = () => {
    sideModal.classList.remove('active');
    overlay.classList.remove('active');
  };

  // Abrir modal
  if (menuTrigger) {
    menuTrigger.addEventListener('click', () => {
      sideModal.classList.add('active');
      overlay.classList.add('active');
    });
  }

  // Fechar modal
  if (closeModal) {
    closeModal.addEventListener('click', closeSideModal);
  }
  if (overlay) {
    overlay.addEventListener('click', closeSideModal);
  }
});