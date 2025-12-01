import './index.css';
import Rotas from './Services/Rotas.js';

navegarPara('/login');

window.addEventListener('hashchange', async () => {
  const rota = window.location.hash.replace('#', '/');
  
  const usuarioLogado = sessionStorage.getItem('usuario_logado');
  if (rota !== '/login' && !usuarioLogado) {
      window.location.hash = '#login';
      return;
  }

  await navegarPara(rota);
});
