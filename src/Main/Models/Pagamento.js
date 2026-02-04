import FetchAPI from '../Service/FetchAPI.js';

class PagamentoModel {
    constructor() {
        this.api = new FetchAPI();
    }

    async listar() {
        try {
            // CUIDADO: O Backend não fornece uma rota clara de API para listar pagamentos (Admin).
            // A rota 'pagamentos/listar' retorna HTML.
            // A rota 'api/cliente/financeiro' retorna dados do cliente logado.
            // Por enquanto, retornamos vazio para não quebrar a tela ou tentamos via API se disponível.
            console.warn("Rota API de listagem de pagamentos não disponível no backend.");
            return { success: true, data: [] }; // Retorna vazio provisoriamente

            // const resposta = await this.api.get('pagamentos');

            // Tratamento caso a API devolva { success: true, data: [...] }
            if (resposta.success && resposta.data) {
                return resposta;
            }
            // Caso retorne o array direto
            return { success: true, data: Array.isArray(resposta) ? resposta : [] };
        } catch (error) {
            console.error("Model Pagamento (listar):", error);
            return { success: false, error: error.message };
        }
    }

    async processar(dados) {
        try {
            // Rota: POST /api/pagamentos/salvar
            const res = await this.api.post('api/pagamentos/salvar', dados);
            // Se tiver tabela com 'sincronizado', usaríamos aqui.
            return res;
        } catch (error) {
            console.error("Model Pagamento (processar):", error);
            return { success: false, error: error.message };
        }
    }

    async sincronizacaoBidirecional() {
        try {
            // AVISO CRÍTICO:
            // A tabela 'pagamento' original NÃO TEM colunas 'sincronizado' ou 'excluido_em' ou 'atualizado_em'.
            // O código abaixo assume que essas colunas foram criadas no SQLite.
            // Se não existirem, vai dar erro de SQL na busca.

            // --- PUSH (Local -> API) ---
            // Verifica se a tabela suporta sync antes de tentar (evita crash)
            try {
                const pendentes = db.prepare('SELECT * FROM pagamento WHERE sincronizado = 0').all();

                for (const item of pendentes) {
                    try {
                        let res;
                        if (item.excluido_em) {
                            // Pagamentos geralmente não são deletados, mas estornados. 
                            // Mas se houver rota de delete:
                            // res = await this.api.post(`api/pagamentos/deletar/${item.id_pagamento}`);
                            console.warn("Deletar pagamento não implementado na API.");
                            continue;
                        } else {
                            // Salvar (JSON)
                            res = await this.api.post('api/pagamentos/salvar', item);
                        }

                        if (res && res.sessionExpired) return { success: false, erro: "Sessão expirada", sessionExpired: true };
                        if (res && res.offline) return { success: false, erro: "Offline", offline: true };

                        if (res && (res.success || res.offline)) {
                            db.prepare('UPDATE pagamento SET sincronizado = 1 WHERE id_pagamento = ?').run(item.id_pagamento);
                        }
                    } catch (errItem) {
                        console.error(`Erro sync pagamento ${item.id_pagamento}:`, errItem);
                    }
                }
            } catch (sqlErr) {
                console.warn("Tabela 'pagamento' não tem coluna 'sincronizado'. Pule a migração se necessário.");
            }

            // --- PULL (API -> Local) ---
            // Não existe rota API GET global para pagamentos no backend atual.
            // Implementação futura necessária no PHP: GET /api/pagamentos
            console.log("Pull de Pagamentos ignorado (sem rota API).");

            return { success: true };

        } catch (error) {
            console.error("Erro Sync Pagamentos:", error);
            return { success: false, erro: error.message };
        }
    }
}

export default PagamentoModel;