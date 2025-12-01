import Swal from 'sweetalert2'; // Precisa instalar: npm install sweetalert2

class MensagemDeAlerta {
    constructor(){
        this.alerta = Swal;
    }
    sucesso(mensagem){
        this.alerta.fire({
            icon: "success",
            title: mensagem,
            showConfirmButton: false,
            timer: 1500
        });
    }
    erro(mensagem){
        this.alerta.fire({
            icon: "error",
            title: "Erro",
            text: mensagem,
        });
    }
}
export default MensagemDeAlerta;