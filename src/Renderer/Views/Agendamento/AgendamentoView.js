import Form from './form/AgendamentoForm.js';
import Listar from './listar/AgendamentoListar.js';

const html = `
  <div class="container" style="padding: 20px;">
    <h1>Gestão de Agendamentos</h1>
    ${Form.html}
    ${Listar.html}
  </div>
`;

function init() {
    Form.init();
    Listar.init();
}

export default { html, init };