class FetchAPI {
    constructor(baseURL) {
        this.baseURL = "http://localhost:9000/backend/api/";
        this.chaveAPI = "73C60B2A5B23B2300B235AF6EE616F46167F2B830E78F0A8DDCBDF5C9598BCAD";
    }  
    async get(endpoint) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${this.chaveAPI}`
    }
});
        return response.json();
    }
    async post(endpoint, data) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${this.chaveAPI}`
            },
            body: JSON.stringify(data)
        });
        return response.json();

    }

}
export default FetchAPI;