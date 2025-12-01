import './index.css';
import Rotas from './Renderer/Services/Rotas.js';

const rotas = new Rotas();

async function navegarPara(rota) {
  if (rotas.rotas[rota]) {
    const html = await rotas.rotas[rota](); 
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = html;
    } else {
        console.error('Elemento #app não encontrado no index.html');
    }
  } else {
    console.error('Rota não encontrada:', rota);
  }
}

window.addEventListener('hashchange', async () => {
  const rota = window.location.hash.replace('#', '/');
  
  const usuarioLogado = sessionStorage.getItem('usuario_logado');
  
  if (rota !== '/login' && !usuarioLogado) {
      window.location.hash = '#login';
      return;
  }

  await navegarPara(rota);
});

navegarPara('/login');