import LoginView from "../Views/Auth/LoginView.js";

class Rotas {
    constructor(){
        this.rotas = {
            "/login": () => {
                const view = new LoginView();
                setTimeout(() => view.adicionarEventos(), 100); 
                return view.renderizar();
            },
        }
    }
}
export default Rotas;