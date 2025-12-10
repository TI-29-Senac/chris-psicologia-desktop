const sessao = localStorage.getItem('usuario_logado');
if (!sessao) {
    window.location.href = '../../../../index.html';
}
 
async function init() {
    const listaEl = document.getElementById('lista-usuarios');
 
    // 1. Função para carregar a tabela
    async function carregarUsuarios() {
        try {
            const usuarios = await window.electronAPI.listarUsuarios();
           
            if (usuarios.length === 0) {
                listaEl.innerHTML = "<tr><td colspan='6' class='text-center'>Nenhum usuário encontrado.</td></tr>";
                return;
            }
 
            listaEl.innerHTML = usuarios.map(u => `
                <tr>
                    <td>#${u.id_usuario}</td>
                    <td><strong>${u.nome_usuario}</strong></td>
                    <td>${u.email}</td>
                    <td><span class="badge ${u.tipo_usuario === 'profissional' ? 'status-agendado' : 'status-pending'}">${u.tipo_usuario}</span></td>
                    <td>${u.especialidade || '-'}</td>
                    <td class="text-center">
                        <button class="action-btn btn-edit" data-id="${u.id_usuario}" title="Editar">✏️</button>
                        <button class="action-btn btn-delete" data-id="${u.id_usuario}" title="Excluir">🗑️</button>
                    </td>
                </tr>
            `).join('');
 
            adicionarEventos();
 
        } catch (error) {
            console.error("Erro ao listar usuários:", error);
        }
    }
 
    // 2. Eventos dos botões da tabela
    function adicionarEventos() {
        // EDITAR
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                // Redireciona para a tela de cadastro passando o ID na URL para edição
                // (Você precisará ajustar o cadastro.js para ler esse ID da URL se quiser editar lá)
                alert(`Funcionalidade de editar ID ${id} em desenvolvimento.`);
                // window.location.href = `../Cadastro/cadastro.html?id=${id}`;
            });
        });
 
        // EXCLUIR
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.closest('button').dataset.id;
                if(confirm("Tem certeza que deseja excluir este usuário?")) {
                    const res = await window.electronAPI.excluirUsuario(id);
                    if(res.success) {
                        alert("Usuário excluído!");
                        carregarUsuarios();
                    } else {
                        alert("Erro ao excluir: " + res.erro);
                    }
                }
            });
        });
    }
 
    // Inicia
    carregarUsuarios();
}
 
init();