# Integração com Bling - Guia de Implementação

## Visão Geral

A integração com a API do Bling foi implementada para permitir a sincronização automática de pedidos de produção, produtos e clientes. A implementação inclui autenticação OAuth 2.0 completa e interface de usuário intuitiva.

## Funcionalidades Implementadas

### ✅ Autenticação OAuth 2.0
- Fluxo completo de autorização OAuth 2.0
- Renovação automática de tokens
- Persistência de tokens no localStorage
- Interface para desconectar/reconectar

### ✅ Sincronização de Dados
- Importação de pedidos de produção
- Busca de produtos e clientes
- Filtros específicos para pedidos de produção
- Tratamento robusto de erros

### ✅ Interface de Usuário
- Página de configuração com OAuth e token manual
- Lista de pedidos com filtros e busca
- Histórico de importações
- Logs detalhados do sistema
- Callback OAuth com feedback visual

## Como Usar

### 1. Configuração Inicial

1. Acesse a página de **Integração Bling** no sistema
2. Escolha entre **OAuth 2.0** (recomendado) ou **Token Manual**
3. Para OAuth:
   - Clique em "Autorizar com Bling"
   - Faça login no Bling e autorize o aplicativo
   - Você será redirecionado de volta automaticamente

### 2. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Configurações da API Bling
VITE_BLING_CLIENT_ID=seu_client_id_aqui
VITE_BLING_CLIENT_SECRET=seu_client_secret_aqui
VITE_BLING_ACCESS_TOKEN=seu_access_token_aqui
VITE_BLING_BASE_URL=https://api.bling.com.br/Api/v3
VITE_BLING_REDIRECT_URI=http://localhost:5173/bling/callback
VITE_BLING_AUTO_SYNC=true
VITE_BLING_SYNC_INTERVAL=30
```

### 3. Registro no Bling

Para usar OAuth 2.0, você precisa registrar sua aplicação no Bling:

1. Acesse o painel de desenvolvedor do Bling
2. Crie uma nova aplicação
3. Configure a URL de callback: `http://localhost:5173/bling/callback`
4. Copie o Client ID e Client Secret para o arquivo `.env`

## Estrutura de Arquivos

```
src/
├── services/
│   └── blingService.ts          # Serviço principal da API Bling
├── hooks/
│   └── useBling.ts             # Hook React para integração
├── pages/
│   ├── BlingIntegration/       # Página principal de integração
│   └── BlingCallback/          # Página de callback OAuth
├── components/
│   └── BlingOrdersList/        # Componente de lista de pedidos
└── types/
    └── blingOrders.ts          # Tipos TypeScript para pedidos
```

## API Endpoints Utilizados

### Pedidos
- `GET /pedidos` - Lista pedidos com filtros
- `GET /pedidos/{id}` - Busca pedido específico

### Produtos
- `GET /produtos` - Lista produtos

### Clientes
- `GET /contatos` - Lista clientes/contatos

### OAuth
- `GET /oauth/authorize` - Inicia fluxo OAuth
- `POST /oauth/token` - Troca código por token

## Mapeamento de Status

Os status do Bling são mapeados para status internos:

| Bling Status | Status Interno |
|--------------|----------------|
| em_aberto | pending |
| em_producao | processing |
| aguardando_producao | pending |
| concluido | completed |
| cancelado | cancelled |

## Tratamento de Erros

A integração inclui tratamento robusto de erros:

- **Erro de Conexão**: Tentativas automáticas de reconexão
- **Token Expirado**: Renovação automática via refresh token
- **Rate Limiting**: Retry com backoff exponencial
- **Dados Inválidos**: Validação e logs detalhados

## Logs e Monitoramento

O sistema registra todas as operações:

- Tentativas de conexão
- Importações realizadas
- Erros encontrados
- Estatísticas de sincronização

## Segurança

- Tokens armazenados de forma segura no localStorage
- Validação de estado OAuth para prevenir CSRF
- Renovação automática de tokens
- Logs de auditoria para todas as operações

## Próximos Passos

Para expandir a integração, considere:

1. **Sincronização Bidirecional**: Enviar atualizações de volta para o Bling
2. **Webhooks**: Receber notificações em tempo real
3. **Cache Inteligente**: Otimizar performance com cache local
4. **Relatórios**: Dashboard com métricas de integração
5. **Backup**: Sistema de backup dos dados sincronizados

## Troubleshooting

### Problemas Comuns

1. **Erro 401 - Não Autorizado**
   - Verifique se o token está válido
   - Tente renovar a autorização OAuth

2. **Erro 429 - Rate Limit**
   - Aguarde alguns minutos antes de tentar novamente
   - Considere aumentar o intervalo de sincronização

3. **Pedidos não aparecem**
   - Verifique os filtros de status
   - Confirme se há pedidos com status de produção no Bling

4. **Callback OAuth não funciona**
   - Verifique se a URL de callback está configurada corretamente
   - Confirme se o Client ID está correto

### Logs de Debug

Para ativar logs detalhados, abra o console do navegador (F12) e observe as mensagens de debug durante as operações de integração.

## Suporte

Para dúvidas ou problemas com a integração, consulte:

1. Documentação da API Bling
2. Logs do sistema na aba "Logs"
3. Histórico de importações na aba "Histórico"
4. Console do navegador para erros técnicos
