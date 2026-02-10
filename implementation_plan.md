# Sincronização Direta com Banco de Dados Remoto (MySQL)

## Objetivo
Configurar o aplicativo Desktop para conectar diretamente ao banco de dados MySQL do servidor (69.6.213.160), permitindo a sincronização de agendamentos sem depender da API local (`localhost:9000`) que não possui acesso aos dados de produção.

## Motivação
O usuário forneceu as credenciais de acesso direto ao banco de dados do site original e confirmou que a porta 3306 está aberta. A configuração atual via API local não está trazendo os dados corretamente.

## Mudanças Propostas

### Dependências
- **Instalar `mysql2`**: Biblioteca necessária para conexão com MySQL.

### Arquivos Modificados

#### [NEW] [MySQLService.js](file:///c:/Users/jean.mnrocha/Documents/desktop/chris-psicologia-desktop/src/Main/Service/MySQLService.js)
- Criar um serviço para gerenciar a conexão com o banco remoto.
- Implementar métodos `query` e `execute` seguros.
- Utilizar as credenciais fornecidas no `.env`.

#### [MODIFY] [AgendamentoModel.js](file:///c:/Users/jean.mnrocha/Documents/desktop/chris-psicologia-desktop/src/Main/Models/Agendamento.js)
- Adicionar lógica de sincronização direta (Direct Sync) como alternativa ou substituta ao `FetchAPI`.
- Mapear os campos do banco remoto para o local.

#### [MODIFY] .env
- Adicionar as credenciais `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`.

## Plano de Verificação
1. Testar a conexão com o banco remoto ao iniciar a aplicação.
2. Executar a sincronização e verificar se os agendamentos antigos aparecem na lista.
3. Criar um novo agendamento e verificar se ele é persistido no banco remoto.
