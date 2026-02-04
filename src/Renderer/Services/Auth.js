// src/Renderer/Services/Auth.js

const Auth = {
    // Verifica se o usuário está logado
    check: (caminhoParaRaiz = '../../../../') => {
        const usuario = JSON.parse(localStorage.getItem('usuario_logado'));

        if (!usuario) {
            alert("Sessão expirada. Faça login novamente.");
            window.location.href = `${caminhoParaRaiz}index.html`;
            return null;
        }
        return usuario;
    },

    // Realiza o logout (com confirmação)
    logout: (caminhoParaRaiz = '../../../../') => {
        if (confirm("Tem certeza que deseja sair?")) {
            Auth.forceLogout(caminhoParaRaiz);
        }
    },

    // Logout forçado (sem confirmação)
    forceLogout: (caminhoParaRaiz = '../../../../') => {
        localStorage.removeItem('usuario_logado');
        localStorage.removeItem('auth_token');
        window.location.href = `${caminhoParaRaiz}index.html`;
    },

    // Atualiza o nome do usuário na interface
    updateProfileUI: () => {
        const usuario = JSON.parse(localStorage.getItem('usuario_logado'));
        if (usuario) {
            // Procura elementos comuns de perfil para atualizar
            const nomeEls = document.querySelectorAll('.user-profile span');
            nomeEls.forEach(el => el.innerText = usuario.nome_usuario || 'Usuário');
        }
    }
};

// Exporta para uso global (já que não estamos usando bundler complexo nos HTMLs)
window.Auth = Auth;

// Auto-inicializa o listener de sessão expirada se estiver no Electron
if (window.electronAPI && window.electronAPI.onSessionExpired) {
    window.electronAPI.onSessionExpired(() => {
        alert("Sua sessão expirou. Você será redirecionado para o login.");
        // Tenta adivinhar o caminho para raiz baseado na URL atual ou usa o default
        // Se a gente estiver em Views/Pagamento/pagamento.html, são 4 níveis
        Auth.forceLogout('../../../../');
    });
}