class APIFetch{
    constructor(){
        this.chave = "73C60B2A5B23B2300B235AF6EE616F46167F2B830E78F0A8DDCBDF5C9598BCAD";
        this.URLBASE = "http://localhost:8080/backend/api/";
    }
    async fetch(url){
        try{
        let response = await fetch(`${this.URLBASE}${url}`, { 
        method: "GET",
            headers: {
                "Authorization": ` Bearer ${this.chave}`  
            }   
        });
        let data = await response.json();
        return data;

        }catch(error){
            console.log(`O Erro foi: ${error}`);
        }
    }
}
export default APIFetch;