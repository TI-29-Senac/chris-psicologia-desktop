// src/Renderer_front/Services/Rotas.js

// AJUSTE AQUI: Mudamos 'agendamentos' para 'agendamento' (singular)
import AgendamentoView from '../Views/Agendamento/AgendamentoView.js'; 

class Rotas {
    constructor() {
        this.rotas = {
            // A rota (o que aparece no navegador/link) pode continuar plural se você quiser, 
            // ou você pode mudar para '/agendamento' se preferir tudo no singular.
            '/agendamento': AgendamentoView
        };
    }

    async getPage(rota) {
        if (this.rotas[rota]) {
            return this.rotas[rota];
        } else {
            return { html: '<h1>404 - Página não encontrada</h1>', init: null };
        }
    }
}

export default Rotas;