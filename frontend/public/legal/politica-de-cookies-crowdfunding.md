# Política de Cookies e Tecnologias de Rastreamento

> TODOs de contexto (preencha e remova esta seção)
> - Nome da plataforma: {{PLATAFORMA_NOME}}
> - URL: {{PLATAFORMA_URL}}
> - Controladora (razão social) e CNPJ: {{CONTROLADORA_RAZAO_SOCIAL}} — {{CONTROLADORA_CNPJ}}
> - Encarregado/DPO (nome, e-mail, canal): {{ENCARREGADO_NOME}} — {{ENCARREGADO_EMAIL}} — {{ENCARREGADO_CANAL}}
> - Público-alvo: {{PUBLICO_ALVO}}
> - Stack web/app: {{STACK}}
> - Ferramentas/terceiros efetivamente usadas (analytics, ads, pagamento, segurança, chat, CRM/CDP, CDN): {{ANALYTICS_E_ADS}}, {{CDN}}, {{CRM/CDP}}, {{ANTIFRAUDE}}, {{CHAT/SUPORTE}}
> - Uso de app mobile e SDKs de tracking? {{MOBILE_SDKS}}
> - Abrangência geográfica: {{ABRANGENCIA}}
>
> Recomendações: (1) ativar modos de consentimento (Google Consent Mode / Meta Consent) quando aplicável; (2) usar hash/salteamento para `user_id`/IP; (3) manter retenção mínima necessária e revisão trimestral do inventário.

## Sumário
- [1. O que são cookies e tecnologias similares](#1-o-que-são-cookies-e-tecnologias-similares)
- [2. Categorias e bases legais](#2-categorias-e-bases-legais)
- [3. Tabela de inventário](#3-tabela-de-inventário)
- [4. Gestão de preferências](#4-gestão-de-preferências)
- [5. Consequências da recusa](#5-consequências-da-recusa)
- [6. Transferências internacionais e salvaguardas](#6-transferências-internacionais-e-salvaguardas)
- [7. Segurança, minimização e retenção](#7-segurança-minimização-e-retenção)
- [8. Registro de consentimento](#8-registro-de-consentimento)
- [9. Atualizações da Política](#9-atualizações-da-política)
- [10. Contato do Encarregado/DPO](#10-contato-do-encarregadodpo)

### 1. O que são cookies e tecnologias similares
Cookies são pequenos arquivos de texto armazenados no seu navegador que permitem funcionalidades essenciais, recordam preferências e auxiliam na melhoria do produto. Tecnologias similares incluem:
- Pixels e tags (ex.: Meta Pixel, Google Ads tags)
- Armazenamentos do navegador: `localStorage` e `sessionStorage`
- Identificadores móveis e SDKs (ex.: Firebase Analytics, Appsflyer) quando houver app

Usamos estas tecnologias para: funcionamento básico da plataforma (login, carrinho/apoio, segurança), métricas de uso, diagnóstico de desempenho, suporte/atendimento e, com seu consentimento, mensuração e personalização de campanhas publicitárias.

### 2. Categorias e bases legais
- Estritamente necessários: viabilizam funcionalidades essenciais (autenticação, pagamento, segurança, balanceamento). Base legal: execução de contrato e/ou legítimo interesse.
- Desempenho/Analíticos: medem uso e ajudam a melhorar o serviço. Base legal: consentimento (opt-in).
- Funcionais: recursos adicionais não estritamente necessários (chat/suporte, personalizações). Base legal: consentimento (opt-in), salvo quando indispensáveis à execução do serviço solicitado.
- Publicidade: mensuram conversões e personalizam anúncios. Base legal: consentimento (opt-in).

Você pode conceder ou retirar consentimento por categoria de forma granular, a qualquer momento, pelo link “Gerenciar Cookies”.

### 3. Tabela de inventário
A lista completa e atualizada está disponível no arquivo público `cookies-inventario-crowdfunding.csv`. Abaixo, exemplos típicos (ajuste conforme uso real):

| Nome | Categoria | Finalidade | Duração | Terceiro | Base legal |
| --- | --- | --- | --- | --- | --- |
| `_ga` | Desempenho/Analíticos | Mensurar uso (GA4) | 13 meses | Google | Consentimento |
| `_ga_*` | Desempenho/Analíticos | Mensurar uso (GA4) | 13 meses | Google | Consentimento |
| `_gid` | Desempenho/Analíticos | Diferenciar usuários (GA4) | 24 h | Google | Consentimento |
| `_gcl_au` | Publicidade | Mensuração de conversão (Google Ads) | 90 dias | Google | Consentimento |
| `_fbp` | Publicidade | Mensuração e personalização (Meta) | 90 dias | Meta | Consentimento |
| `__stripe_mid`/`__stripe_sid` | Estritamente necessários | Prevenção de fraude e pagamento | até 1 ano | Stripe | Execução de contrato/LI |
| `mcheckout_*` | Estritamente necessários | Fluxo de checkout | sessão | Mercado Pago | Execução de contrato/LI |
| `rc::a`/`rc::c` | Estritamente necessários | Diferenciar humanos/bots (reCAPTCHA) | variável | Google | LI (segurança) |
| `intercom-id-*`/`hubspotutk` | Funcionais | Suporte e CRM | até 13 meses | Intercom/HubSpot | Consentimento |
| `cookie_consent` | Estritamente necessários | Registrar preferências de consentimento | até 13 meses | First-party | LI |

Para SDKs móveis, consultar a seção específica no inventário e a tabela “SDKs Mobile” no CSV.

### 4. Gestão de preferências
- Banner inicial: opções equivalentes de “Aceitar tudo”, “Rejeitar tudo” e “Configurar”.
- Centro de Preferências: toggles por categoria; explicações claras; link para esta Política; botão “Salvar preferências”.
- Revogação: você pode alterar ou revogar seu consentimento a qualquer momento pelo link fixo “Gerenciar Cookies” no rodapé. A revogação não retroage quanto ao tratamento já realizado sob base legítima.
- Navegador: você pode limpar cookies nas configurações do navegador; isso pode exigir novo consentimento na próxima visita.

### 5. Consequências da recusa
Se você rejeitar categorias não necessárias, a navegação e o apoio a campanhas permanecem disponíveis; no entanto, certas funcionalidades opcionais (ex.: análises, personalizações, integrações de chat) podem ficar indisponíveis ou menos precisas. Não usamos dark patterns e não penalizamos indevidamente sua escolha.

### 6. Transferências internacionais e salvaguardas
Alguns fornecedores podem processar dados fora do Brasil (por exemplo, Google, Meta, Stripe, Intercom/HubSpot). Adotamos salvaguardas contratuais adequadas, criptografia em trânsito/repouso, minimização e avaliações de risco. Consulte as políticas dos fornecedores: `https://policies.google.com/privacy`, `https://www.facebook.com/privacy/policy`, `https://stripe.com/privacy`, `https://www.intercom.com/legal/privacy`, `https://legal.hubspot.com/privacy-policy`.

### 7. Segurança, minimização e retenção
- Minimização: coletamos apenas o necessário para as finalidades descritas.
- Segurança: TLS, controles de acesso, segregação de ambientes, registro de auditoria.
- Retenção: cookies necessários até o limite técnico/operacional (p.ex., sessão e prevenção à fraude até 1 ano); analíticos e publicidade por até 13 meses (ou menor, quando possível). Revisamos o inventário e prazos periodicamente.

### 8. Registro de consentimento
Mantemos registro de consentimento para cumprir a LGPD, incluindo: `consent_id` (UUID), `timestamp`, `policy_version`, `choices` por categoria e, quando aplicável, por fornecedor. Sempre que possível, usamos hash/pseudonimização para `user_id` e IP. Veja o modelo técnico em `consent-schema-crowdfunding.json`.

### 9. Atualizações da Política
Podemos atualizar esta Política para refletir mudanças legislativas, técnicas ou operacionais. Informaremos a nova versão e data de atualização e, quando exigido, solicitaremos novo consentimento.

### 10. Contato do Encarregado/DPO
> TODO — Preencher contato oficial do Encarregado/DPO (nome, e-mail e canal de atendimento)

—

Versão 1.0.0 — Atualizada em 2025-11-05

Changelog:
- 1.0.0: Versão inicial, com inventário exemplo, fluxo de gestão e registro de consentimento.


