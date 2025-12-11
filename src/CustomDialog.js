// src/CustomDialog.js

class CustomDialog {
    
    // Cria o HTML do modal dinamicamente
    static _createModal(title, message, type = 'alert') {
        return new Promise((resolve) => {
            // 1. Cria o Overlay
            const overlay = document.createElement('div');
            overlay.className = 'custom-modal-overlay';

            // 2. Cria a Caixa
            const box = document.createElement('div');
            box.className = 'custom-modal-box';

            // 3. Conteúdo Interno
            const titleEl = document.createElement('h3');
            titleEl.className = 'custom-modal-title';
            titleEl.innerText = title;

            const msgEl = document.createElement('p');
            msgEl.className = 'custom-modal-message';
            msgEl.innerText = message;

            const actionsEl = document.createElement('div');
            actionsEl.className = 'custom-modal-actions';

            // 4. Lógica dos Botões
            if (type === 'confirm') {
                const btnCancel = document.createElement('button');
                btnCancel.className = 'btn-modal btn-cancel';
                btnCancel.innerText = 'Cancelar';
                btnCancel.onclick = () => {
                    closeModal(false);
                };
                actionsEl.appendChild(btnCancel);
            }

            const btnConfirm = document.createElement('button');
            btnConfirm.className = 'btn-modal btn-confirm';
            btnConfirm.innerText = 'OK';
            btnConfirm.onclick = () => {
                closeModal(true);
            };
            actionsEl.appendChild(btnConfirm);

            // Montagem
            box.appendChild(titleEl);
            box.appendChild(msgEl);
            box.appendChild(actionsEl);
            overlay.appendChild(box);
            document.body.appendChild(overlay);

            // Animação de entrada
            requestAnimationFrame(() => {
                overlay.classList.add('active');
            });

            // Função para fechar e resolver a Promise
            function closeModal(result) {
                overlay.classList.remove('active');
                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                    resolve(result);
                }, 300); // Espera a transição do CSS acabar
            }
        });
    }

    // --- MÉTODOS PÚBLICOS ---

    /**
     * Substitui o alert().
     * Uso: await CustomDialog.alert("Sucesso", "Usuário cadastrado!");
     */
    static async alert(title, message) {
        // Se passar só uma string, ajusta os parametros
        if (!message) {
            message = title;
            title = "Atenção";
        }
        await this._createModal(title, message, 'alert');
    }

    /**
     * Substitui o confirm().
     * Uso: if (await CustomDialog.confirm("Tem certeza?", "Isso apagará o dado.")) { ... }
     */
    static async confirm(title, message) {
        if (!message) {
            message = title;
            title = "Confirmação";
        }
        return await this._createModal(title, message, 'confirm');
    }
}

// Expõe para ser usado globalmente se quiser, ou via import
window.CustomDialog = CustomDialog;

export default CustomDialog;