# Crowdfunding

Nome do Estudante: Leonardo Pereira Borges.

Curso: Engenharia de Software.

Data de Entrega: 29/11/2025.

## Resumo

Este documento apresenta o desenvolvimento de uma plataforma web de crowdfunding que permite aos usuários criarem campanhas de financiamento coletivo e apoiar projetos de terceiros. A solução combina tecnologias modernas como Vue.js (Quasar), Node.js, PostgreSQL e integração com Stripe para pagamentos, oferecendo uma experiência intuitiva e segura para criadores e apoiadores. O projeto demonstra a aplicação prática de princípios de Engenharia de Software, incluindo arquitetura escalável, segurança da informação, design responsivo e integração com serviços externos.

## 1. Introdução

**Contexto**

O crowdfunding emergiu como uma técnica revolucionária de financiamento coletivo, permitindo que indivíduos e organizações obtenham recursos financeiros através da colaboração voluntária de uma comunidade online. Com o avanço tecnológico e a crescente conectividade digital, este modelo se consolidou globalmente, democratizando o acesso ao financiamento para projetos inovadores, causas sociais e empreendimento criativos.

**Justificativa**

A criação de uma plataforma web de crowdfunding representa uma excelente oportunidade para aplicar na prática os fundamentos da Engenharia de Software. Este tipo de sistema exige a integração de diversos conceitos técnicos essenciais: arquitetura de software robusta, segurança da informação, gerenciamento eficiente de dados, design responsivo focado na experiência do usuário, e integração confiável com serviços externos como gateways de pagamento. Além disso, o projeto permite explorar aspectos de escalabilidade, performance e conformidade com regulamentações de proteção de dados.

**Objetivos**

**Objetivo Principal:**

* Desenvolver uma aplicação web completa que facilite o cadastro, visualização e apoio financeiro a projetos de forma simples, segura e acessível.

Objetivos Específicos:

* Implementar sistema de autenticação seguro com gerenciamento de usuários via Clerk
* Criar interface moderna e responsiva utilizando Quasar Framework (Vue.js)
* Desenvolver API RESTful robusta com Node.js e Express
* Integrar sistema de pagamentos confiável através do Stripe
* Implementar funcionalidades de comentários e interação social
* Garantir persistência segura de dados com PostgreSQL
* Estabelecer pipeline de CI/CD com testes automatizados


## Documentação adicional:
- [Descrição do Projeto](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/2.-Descri%C3%A7%C3%A3o-Projeto)
- [Especificação Técnica](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/3.-Especifica%C3%A7%C3%A3o-T%C3%A9cnica)
- [Teste](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/4.-Testes)
- [Apêndices](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/5.-Ap%C3%AAndices)
- [Deploy](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/6.-Deploy)
- [Ferramentas de Qualidade e Observabilidade](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/7.-Ferramentas-de-Qualidade-e-Observabilidade)
- [Próximos Passos](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/Pr%C3%B3ximos-Passos)




## FAQ

> [!NOTE]
> Dúvidas rápidas e links úteis para rodar, testar e fazer deploy.

### Atalhos

- [Documentação (Wiki)](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki)
- [Descrição do Projeto](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/2.-Descri%C3%A7%C3%A3o-Projeto)
- [Especificação Técnica](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/3.-Especifica%C3%A7%C3%A3o-T%C3%A9cnica)
- [Testes](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/4.-Testes)
- [Apêndices](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/5.-Ap%C3%AAndices)
- [Deploy](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/6.-Deploy)
- [Ferramentas de Qualidade e Observabilidade](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/7.-Ferramentas-de-Qualidade-e-Observabilidade)
- [Próximos Passos](https://github.com/BorgesLeonardo/CatolicaSC-Portfolio/wiki/Pr%C3%B3ximos-Passos)


### Perguntas frequentes

<details>
<summary><strong>Como executo o projeto localmente?</strong></summary>

Pré‑requisitos: Node 20+, PostgreSQL, contas de teste no Clerk e Stripe.

1. Backend
   - Variáveis mínimas: `DATABASE_URL`, `STRIPE_SECRET_KEY`, `CLERK_SECRET_KEY` (ou `CLERK_JWT_VERIFICATION_KEY`), `FRONTEND_ORIGIN=http://localhost:9000`.
   - Opcional: `APP_BASE_URL`, `APP_USE_HASH_ROUTER`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY=BRL`, `PLATFORM_FEE_PERCENT=5`.
   - Comandos:
     ```bash
     cd backend
     npm ci
     npm run dev
     ```
2. Frontend
   - Variáveis mínimas: `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_API_BASE_URL=http://localhost:3333`.
   - Comandos:
     ```bash
     cd frontend
     npm ci
     npm run dev
     ```
</details>

<details>
<summary><strong>Como rodo os testes e vejo a cobertura?</strong></summary>

Backend (Jest):
```bash
cd backend
npm run test:coverage    # relatórios em backend/coverage/
```
Frontend (Vitest):
```bash
cd frontend
npm run test:unit        # relatórios em frontend/coverage-unit/
```
Cobertura combinada (gate ≥ 80%):
```bash
node scripts/merge-lcov.js backend/coverage/lcov.info frontend/coverage-unit/lcov.info
```
</details>

<details>
<summary><strong>Como simulo pagamentos com Stripe (sandbox)?</strong></summary>

- Use chaves de teste do Stripe (`sk_test_*`) no backend e inicie um Checkout pela UI.
- Para webhooks locais:
```bash
cd backend
npm run listen    # usa Stripe CLI e encaminha para /api/webhooks/stripe
```
- Para repasses (Stripe Connect), faça o onboarding do criador:
  - `POST /api/connect/onboard` → retorna o link de onboarding.
  - Depois consulte `GET /api/me/connect/status`.
</details>

<details>
<summary><strong>Como funciona a autenticação (Clerk)?</strong></summary>

- Frontend usa Clerk Vue SDK com `VITE_CLERK_PUBLISHABLE_KEY`.
- Backend valida o token via `@clerk/express`. Para testes automatizados há bypass controlado por env/headers (ver `backend/src/middleware/auth.ts`).
</details>

<details>
<summary><strong>Onde estão a API e os schemas?</strong></summary>

- OpenAPI (visão geral): `openapi.json` (raiz).
- Schemas do banco (Prisma): `backend/prisma/schema.prisma`.
</details>

<details>
<summary><strong>Como faço o deploy?</strong></summary>

- Frontend: Vercel (`frontend/vercel.json`).
- Backend: Node/Express (scripts `build`/`start`), migrations com Prisma (`prisma migrate deploy`). Opcional PM2/SSH (ver `ecosystem.config.js`).
- CI executa build, testes, merge de cobertura e análise SonarCloud antes do deploy.
</details>

<details>
<summary><strong>Problemas comuns</strong></summary>

- CORS: alinhe `FRONTEND_ORIGIN` no backend.
- Webhook inválido: confira `STRIPE_WEBHOOK_SECRET` e se a Stripe CLI está apontando para `/api/webhooks/stripe`.
- 401 em rotas privadas: verifique o token do Clerk no frontend e variáveis de backend (`CLERK_SECRET_KEY`). 
- Imagens não aparecem: confira `VITE_API_BASE_URL` e `ASSETS_BASE_URL`/S3 (se habilitado).
</details>


## Referências

#### Frameworks e Bibliotecas

> [1] **Vue.js Documentation.** [[vuejs.org](https://vuejs.org/)](https://vuejs.org/)
>
> [2] **Quasar Framework Documentation.** [[quasar.dev](https://quasar.dev/)](https://quasar.dev/)
>
> [3] **Express.js Documentation.** [[expressjs.com](https://expressjs.com/)](https://expressjs.com/)
>
> [4] **Prisma Documentation.** [[prisma.io/docs](https://www.prisma.io/docs)](https://www.prisma.io/docs)
>
> [5] **Stripe API Documentation.** [[stripe.com/docs/api](https://stripe.com/docs/api)](https://stripe.com/docs/api)
>
> [6] **Clerk Documentation.** [[clerk.com/docs](https://clerk.com/docs)](https://clerk.com/docs)

#### Padrões e Boas Práticas

> [7] **OWASP Top 10 (2021).** [[owasp.org/Top10](https://owasp.org/Top10/)](https://owasp.org/Top10/)
>
> [8] **REST API Design Guidelines (Microsoft).**
>
> [9] **Vue.js Style Guide.** [[vuejs.org/style-guide](https://vuejs.org/style-guide/)](https://vuejs.org/style-guide/)
>
> [10] **Node.js Best Practices.** [[github.com/goldbergyoni/nodebestpractices](https://github.com/goldbergyoni/nodebestpractices)](https://github.com/goldbergyoni/nodebestpractices)

#### Regulamentações

> [11] **Lei Geral de Proteção de Dados (LGPD).** Lei nº 13.709/2018
>
> [12] **Marco Civil da Internet.** Lei nº 12.965/2014
>
> [13] **Código de Defesa do Consumidor.** Lei nº 8.078/1990
>
> [14] **PCI DSS.** PCI Security Standards Council

#### Artigos e Estudos

> [15] Agrawal, A.; Catalini, C.; Goldfarb, A. “Crowdfunding: Geography, Social Networks, and the Timing of Investment Decisions.” Journal of Economics & Management Strategy, 2015.
>
> [16] Belleflamme, P.; Lambert, T.; Schwienbacher, A. “The Economics of Crowdfunding Platforms.” Information Economics and Policy, 2014.