import './index.css';
import Rotas from './Renderer/Services/Rotas.js';
// import Configuracao from './Renderer_front/Services/Configuracao.js'; // Descomente quando sua equipe criar este arquivo

// const config = new Configuracao();
// await config.modoEscuro();

const rota_mapeada = new Rotas();

async function navegarPara(rota) {
    // Busca a "Página" (HTML + JS) no sistema de rotas
    const pagina = await rota_mapeada.getPage(rota);
    
    // Injeta o HTML na div #app
    const app = document.querySelector('#app');
    if (app) {
        app.innerHTML = pagina.html;
        
        // O Pulo do Gato: Executa o JS da tela (listeners) depois que o HTML existe
        if (pagina.init) {
            pagina.init();
        }
    } else {
        console.error('Erro: Div #app não encontrada no index.html');
    }
}

window.addEventListener('hashchange', async () => {
    const rota = window.location.hash.replace('#', '/');
    await navegarPara(rota);
});

// --- Adaptação: Inicia direto na sua tela ---
navegarPara('/agendamento');