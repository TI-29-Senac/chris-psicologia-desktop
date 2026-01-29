class FetchAPI {
    constructor() {
        // Certifique-se de que o Apache/PHP está realmente nesta porta e caminho
        this.baseURL = "http://localhost:9000/backend/api/";
        
        // Token fixo para testes
        this.chaveAPI = "73C60B2A5B23B2300B235AF6EE616F46167F2B830E78F0A8DDCBDF5C9598BCAD";
    }  

    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": this.chaveAPI
                }
            });
            return await this._tratarResposta(response);
        } catch (error) {
            console.error(`Erro GET em ${endpoint}:`, error);
            return { success: false, erro: "Erro de conexão com a API Local." };
        }
    }

    async post(endpoint, data) {
    try {
        console.log(`Enviando POST para ${endpoint}:`, data);

        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": this.chaveAPI // REMOVIDO O 'Bearer '
            },
            body: JSON.stringify(data)
        });

        return await this._tratarResposta(response);
    } catch (error) {
        console.error(`Erro POST em ${endpoint}:`, error);
        return { success: false, erro: "Servidor indisponível ou erro de rede." };
    }
}

    /**
     * Método auxiliar para validar a resposta do PHP
     */
    async _tratarResposta(response) {
        const textoOriginal = await response.text();
        
        try {
            // Tenta converter o texto para JSON
            const json = JSON.parse(textoOriginal);
            return json;
        } catch (e) {
            // Se cair aqui, o PHP mandou um erro de texto (erro do MySQL ou do Apache)
            console.error("A API não retornou um JSON válido. Resposta bruta:", textoOriginal);
            return { 
                success: false, 
                erro: "O servidor retornou um formato inválido. Verifique o console do Terminal." 
            };
        }
    }
}

export default FetchAPI;