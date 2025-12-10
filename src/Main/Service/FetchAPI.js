class FetchAPI {
    constructor() {
        // Apontando para o servidor local conforme solicitado
        this.baseURL = "http://localhost:9000/backend/api/";
        
        // Token fixo para testes (idealmente viria de um .env ou login dinâmico)
        this.chaveAPI = "73C60B2A5B23B2300B235AF6EE616F46167F2B830E78F0A8DDCBDF5C9598BCAD";
    }  

    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.chaveAPI}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error(`Erro GET em ${endpoint}:`, error);
            // Retorna um objeto de erro padronizado para não quebrar quem chamou
            return { success: false, erro: "Erro de conexão com a API Local." };
        }
    }

    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${this.chaveAPI}`
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error(`Erro POST em ${endpoint}:`, error);
            return { success: false, erro: "Erro de conexão com a API Local." };
        }
    }
}

export default FetchAPI;