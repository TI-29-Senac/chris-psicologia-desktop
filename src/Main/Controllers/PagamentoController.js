import 'dotenv/config';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY); 

const PagamentoController = {
  // Função para buscar o histórico de pagamentos no Stripe
  async listarPagamentos() {
    try {
      // Busca os últimos 10 pagamentos (charges)
      const charges = await stripe.charges.list({
        limit: 10,
      });

      // Mapeia os dados para um formato simples para o seu sistema
      const dadosFormatados = charges.data.map(charge => ({
        id: charge.id,
        valor: (charge.amount / 100).toFixed(2), // Stripe usa centavos, dividimos por 100
        status: charge.status, // succeeded, pending, failed
        metodo: charge.payment_method_details.type, // card, pix, etc
        data: new Date(charge.created * 1000).toLocaleDateString('pt-BR'), // Converte timestamp
        email: charge.billing_details.email || 'Não informado'
      }));

      return { success: true, data: dadosFormatados };
    } catch (error) {
      console.error('Erro ao buscar pagamentos no Stripe:', error);
      return { success: false, message: 'Erro de conexão com Stripe', error: error.message };
    }
  }
};

export default PagamentoController;