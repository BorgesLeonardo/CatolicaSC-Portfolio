Stripe Connect setup

Required env vars:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- FRONTEND_ORIGIN (default http://localhost:9000)
- PLATFORM_FEE_PERCENT (default 5)
- CONNECT_REFRESH_URL (optional; default {FRONTEND_ORIGIN}/connect/refresh)
- CONNECT_RETURN_URL (optional; default {FRONTEND_ORIGIN}/connect/return)

Endpoints:
- POST /api/connect/onboard -> returns onboarding link
- GET /api/me/connect/status -> connect status
- GET /api/me/connect/dashboard-link -> Express dashboard link
- POST /api/contributions/checkout -> destination charges to campaign owner





Dev: Expor backend com ngrok e configurar Webhook do Stripe
1) Pré-requisitos
- Backend rodando localmente (porta 3333 por padrão; variável `PORT`).
- Chave Stripe de teste em `STRIPE_SECRET_KEY` (formato `sk_test_...`).
- Criar endpoint de Webhook no Stripe (modo teste).

2) Variáveis de ambiente
Crie/edite `backend/.env` com (exemplo):
```
PORT=3333
FRONTEND_ORIGIN=http://localhost:9000
STRIPE_SECRET_KEY=sk_test_xxx
# Defina STRIPE_WEBHOOK_SECRET no passo 5
```

3) Subir o backend em Dev
PowerShell:
```
cd backend
npm run dev
```
Verifique o log: `API running on http://localhost:3333`.

4) Instalar e autenticar ngrok (Windows)
```
winget install Ngrok.Ngrok
ngrok config add-authtoken <SEU_AUTHTOKEN>
```

5) Abrir túnel para o backend
```
ngrok http http://localhost:3333
```
Copie a URL HTTPS que aparecer, ex.: `https://abc123.ngrok.dev`.

6) URL do Webhook no Stripe
Crie um endpoint em Developers → Webhooks → Add endpoint:
- Endpoint URL: `https://<SEU_SUBDOMINIO>.ngrok.dev/api/webhooks/stripe`
- Assine estes eventos (mínimo):
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - (opcional) `payment_intent.succeeded`, `payment_intent.payment_failed`

7) Salvar o Signing secret
Ao criar o endpoint, copie o Signing secret (`whsec_...`) e adicione no `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_xxx
```
Reinicie o servidor Dev para carregar o `.env`.

8) Testar o Webhook
- No Dashboard do Stripe, abra o endpoint e clique em “Send test event”.
- Escolha `checkout.session.completed` e envie.
- O backend deve responder 200.

9) Observações importantes
- O corpo do Webhook precisa ser `raw` antes de `express.json()` (já configurado em `/api/webhooks`).
- URLs do ngrok gratuitos mudam a cada restart; atualize a URL no Stripe quando mudar.
- Em produção, use HTTPS real e rote o segredo periodicamente.

10) Referência oficial
- Stripe Webhooks: https://docs.stripe.com/webhooks

## Media Storage (Imagens e Vídeos)

Arquivos locais em `uploads/` não são persistentes em ambientes serverless/contêineres efêmeros. A API agora salva imagens e vídeos diretamente no S3 (ou compatível) e retorna URLs públicas.

Variáveis de ambiente necessárias:

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=seu-bucket
# Opcional: se usar CloudFront/domínio próprio para servir os arquivos
ASSETS_BASE_URL=https://cdn.seudominio.com
```

Chaves geradas:
- Imagens: `projects/{projectId}/images/{projectId}-{timestamp}-{i}.ext`
- Vídeos: `projects/{projectId}/videos/{projectId}-{timestamp}.ext`

Observações:
- Se `ASSETS_BASE_URL` estiver definido, as URLs públicas usarão esse domínio; caso contrário, usarão o domínio padrão do S3.
- A exclusão de mídia remove o objeto do S3 quando a URL pertence à base configurada. URLs antigas que comecem com `/uploads/` continuam sendo removidas do disco quando existentes.