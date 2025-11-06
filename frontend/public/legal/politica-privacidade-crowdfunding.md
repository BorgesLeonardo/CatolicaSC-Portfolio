> CAIXA DE AVISO — TODOs pendentes para validação
>
> - {{PLATAFORMA_NOME}}: Crowdfunding (pode ser atualizado com o nome oficial)
> - {{PLATAFORMA_URL}}: TODO: https://www.seu-dominio.com
> - {{CONTROLADORA_RAZAO_SOCIAL}}: TODO: Razão social completa da empresa controladora
> - {{CONTROLADORA_CNPJ}}: TODO: 00.000.000/0001-00
> - {{CONTROLADORA_ENDERECO}}: TODO: Cidade/UF, Brasil
> - {{ENCARREGADO_NOME}} / {{ENCARREGADO_EMAIL}} / {{ENCARREGADO_CANAL}}: TODO: DPO nome, e-mail e canal (ex.: formulário)
> - {{PUBLICO_ALVO}}: Criadores de campanhas e apoiadores maiores de 18 anos
> - {{ABRANGENCIA}}: Brasil; doações internacionais opcionais
> - {{GATEWAYS_PAGAMENTO}}: Stripe (intermediação e repasses)
> - {{NOTIFICACOES}}: E-mail; SMS/push (opcionais)
> - {{ANTIFRAUDE_KYC}}: Stripe Identity (KYC); verificações documentais
> - {{ANALYTICS}}: Google Analytics v4 (consentimento), opcional Matomo self-hosted
> - {{SUPORTE_CANAIS}}: E-mail e Chat
> - {{TERCEIROS_LISTA}}: Stripe (pagamentos), AWS S3 (armazenamento), Vercel (hosting), Clerk (autenticação), Google (Analytics), Provedor de e-mail (TODO)
> - {{MENORES_POLITICA}}: não permitido; bloqueios e verificação de idade
> - {{RETENCAO_LOGS}}: 6 meses (segurança); registros críticos até 12 meses
> - {{FORO_CIDADE_UF}}: TODO: Cidade/UF do foro competente

[(Voltar ao topo)](#sum%C3%A1rio)

## Sumário

- [1. Quem somos](#1-quem-somos)
- [2. Quais dados tratamos](#2-quais-dados-tratamos)
- [3. Finalidades e bases legais](#3-finalidades-e-bases-legais)
- [4. Cookies e tecnologias similares](#4-cookies-e-tecnologias-similares)
- [5. Com quem compartilhamos](#5-com-quem-compartilhamos)
- [6. Transferências internacionais](#6-transfer%C3%AAncias-internacionais)
- [7. Segurança da informação](#7-seguran%C3%A7a-da-informa%C3%A7%C3%A3o)
- [8. Retenção e descarte](#8-reten%C3%A7%C3%A3o-e-descarte)
- [9. Direitos dos titulares](#9-direitos-dos-titulares)
- [10. Uso por menores](#10-uso-por-menores)
- [11. Atualizações desta Política](#11-atualiza%C3%A7%C3%B5es-desta-pol%C3%ADtica)
- [12. Contato do Encarregado/DPO](#12-contato-do-encarregadodpo)

[(Voltar ao topo)](#sum%C3%A1rio)

### 1. Quem somos

**Controladora:** {{CONTROLADORA_RAZAO_SOCIAL}} (CNPJ: {{CONTROLADORA_CNPJ}}), com sede em {{CONTROLADORA_ENDERECO}}. Operamos a plataforma de crowdfunding **{{PLATAFORMA_NOME}}** acessível em **{{PLATAFORMA_URL}}**.

**Encarregado/DPO:** {{ENCARREGADO_NOME}} — {{ENCARREGADO_EMAIL}} — {{ENCARREGADO_CANAL}}.

Atuamos em conformidade com a LGPD (Lei nº 13.709/2018), Marco Civil da Internet e demais normas aplicáveis.

[(Voltar ao topo)](#sum%C3%A1rio)

### 2. Quais dados tratamos

Resumo por categoria. Detalhes na tabela de mapeamento.

- **Conta/Identificação:** nome, e-mail, CPF/CNPJ, data de nascimento, telefone.
- **Dados de campanha:** título, descrição, mídia, metas, recompensas.
- **Transações:** valores, horários, IDs de pagamento; não armazenamos dados completos de cartão, apenas tokens/IDs do gateway.
- **Dados fiscais:** informações para emissão de notas e relatórios de repasse.
- **Dados de uso:** logs, IP, device, analytics (respeitando consentimento quando aplicável).
- **Comunicação:** newsletter, atualizações e suporte.
- **Antifraude/KYC:** documentos e validações quando exigidos.
- **Cookies:** necessários, desempenho, funcionalidade e publicidade (com consentimento quando não necessários).

#### Tabela de mapeamento de dados

Categoria | Exemplos | Titular | Finalidade | Base legal | Operador/Terceiro | Retenção | Compartilhamento | Risco/mitigação
---|---|---|---|---|---|---|---|---
Conta/Identificação | nome, e-mail, CPF/CNPJ, data nasc., telefone | Criadores/Apoiadores | Cadastro, autenticação, contato | Execução de contrato; cumprimento legal | Clerk (autenticação), Provedor de e-mail (TODO) | Conta ativa + 6 meses após encerramento | Autoridades quando exigido por lei | Acesso mínimo; criptografia; MFA admin
Dados de campanha | título, descrição, imagens, metas | Criadores | Publicação de campanhas | Execução de contrato | AWS S3 (armazenamento), CDN (TODO) | Durante a campanha + 12 meses | Divulgação pública (site) | Moderação; controles de acesso
Transações | valor, IDs, status | Apoiadores/Criadores | Processar contribuições e repasses | Execução de contrato | Stripe (pagamentos) | Conforme obrigações financeiras (5 anos) | Autoridades fiscais quando aplicável | Não coletamos PAN/CVV; tokens do gateway; PCI-DSS via operador
Dados fiscais | notas, relatórios | Criadores/Apoiadores | Obrigações fiscais e contábeis | Cumprimento de obrigação legal | Sistema fiscal (TODO) | 5 anos (art. 173, CTN) | Escritório contábil (se aplicável) | Controle de acesso; logs
Dados de uso | IP, device, logs | Visitantes/Usuários | Segurança, performance | Legítimo interesse (LIA) | Infra/hosting (Vercel), monitoramento (TODO) | {{RETENCAO_LOGS}} | Não compartilhado exceto por incidente/lei | Minimização; anonimização quando possível
Comunicação | newsletter, suporte | Usuários | Envio de e-mails e atualizações | Consentimento (marketing); Execução de contrato (transacionais) | Provedor de e-mail (TODO) | Enquanto houver consentimento; logs por 6 meses | Opt-out a qualquer momento | Preferências granular; registro de consentimento
Antifraude/KYC | documentos, selfies | Criadores/Apoiadores (quando exigido) | Verificação de identidade e prevenção à fraude | Cumprimento legal; legítimo interesse (segurança) | Stripe Identity (KYC) | Pelo período regulatório aplicável | Autoridades/operadores conforme exigido | Princípio do menor privilégio; criptografia
Cookies | necessários e não necessários | Visitantes/Usuários | Operação e melhoria | Necessários: contrato/legítimo interesse; Não necessários: consentimento | GA4 (consentido), Tag Manager (consentido) | Conforme preferências; expiração por cookie | Terceiros listados | Banner de consentimento, revogação fácil

[(Voltar ao topo)](#sum%C3%A1rio)

### 3. Finalidades e bases legais

- **Execução de contrato:** cadastro, login, criação de campanhas, apoio, repasses, comunicações transacionais.
- **Cumprimento de obrigação legal/regulatória:** obrigações fiscais/contábeis, prevenção à lavagem de dinheiro, retenção mínima legal.
- **Legítimo interesse (com LIA):** segurança, antifraude, melhorias de usabilidade e analytics restrito com impacto mínimo e opt-out quando cabível.
- **Consentimento:** marketing (newsletter), cookies não necessários e analytics avançado. Consentimento é livre, informado e pode ser revogado a qualquer momento.

[(Voltar ao topo)](#sum%C3%A1rio)

### 4. Cookies e tecnologias similares

Utilizamos cookies para operar o site e, com seu consentimento, para análises e publicidade.

Nome | Tipo | Finalidade | Duração | Terceiro | Base legal
---|---|---|---|---|---
session_id | Necessário | Manter sessão autenticada | Sessão | {{PLATAFORMA_NOME}} | Execução de contrato
csrf_token | Necessário | Proteção contra CSRF | Sessão | {{PLATAFORMA_NOME}} | Segurança/legítimo interesse
ga_cookie | Desempenho | Métricas de uso agregadas | 13 meses | Google Analytics | Consentimento
consent_prefs | Funcionalidade | Guardar preferências de cookies | 12 meses | {{PLATAFORMA_NOME}} | Legítimo interesse
marketing_id | Publicidade | Personalização de anúncios | 6-12 meses | Provedor Ads (TODO) | Consentimento

- Apresentamos banner de consentimento granular ao primeiro acesso.
- Você pode **gerenciar/revogar** consentimentos a qualquer momento pelo link “Gerenciar Cookies” no rodapé.
- Mantemos **registro de consentimento** (logs) para comprovação.

[(Voltar ao topo)](#sum%C3%A1rio)

### 5. Com quem compartilhamos

Compartilhamos dados apenas com **operadores/terceiros essenciais** para a operação:

- **Pagamentos:** {{GATEWAYS_PAGAMENTO}} (processamento de contribuições e repasses).
- **Hospedagem/Infra:** Vercel (aplicação) e AWS S3 (mídias de campanha).
- **Autenticação:** Clerk.
- **Analytics:** {{ANALYTICS}} (ativado somente com consentimento).
- **Comunicação:** Provedor de e-mail ({{SUPORTE_CANAIS}}) — TODO: indicar fornecedor.

Sempre sob contratos e cláusulas de proteção de dados, com instruções documentadas.

[(Voltar ao topo)](#sum%C3%A1rio)

### 6. Transferências internacionais

Podem ocorrer quando usamos provedores globais (ex.: Stripe, Vercel, AWS, Google). Adotamos **mecanismos e salvaguardas** como cláusulas contratuais padrão, avaliações de risco e medidas suplementares (criptografia, minimização). Quando exigido, informamos e buscamos consentimento.

[(Voltar ao topo)](#sum%C3%A1rio)

### 7. Segurança da informação

- **Técnicos:** TLS em trânsito; criptografia em repouso quando aplicável; segregação de ambientes; backups; monitoramento; hardening; MFA para administradores.
- **Organizacionais:** princípio do menor privilégio; gestão de acessos; registro de atividades; treinamento periódico.
- **Limitações:** nenhum sistema é 100% seguro. Em caso de incidente com risco relevante, notificaremos a ANPD e os titulares conforme prazos e critérios legais.

Canal para incidentes: {{ENCARREGADO_EMAIL}}. Prazo de resposta inicial: até 72h úteis.

[(Voltar ao topo)](#sum%C3%A1rio)

### 8. Retenção e descarte

Categoria | Prazo | Fundamento
---|---|---
Dados cadastrais | Conta ativa + 6 meses após encerramento | Execução de contrato e legítimo interesse limitado
Dados de campanha | Vigência da campanha + 12 meses | Execução de contrato/interesse legítimo (histórico)
Transações/financeiro | 5 anos | Obrigação legal/fiscal
Logs de segurança | {{RETENCAO_LOGS}} | Legítimo interesse (segurança)
Marketing (consentido) | Até revogação | Consentimento

Após o prazo, realizamos anonimização ou descarte seguro.

[(Voltar ao topo)](#sum%C3%A1rio)

### 9. Direitos dos titulares

Você pode exercer seus direitos (confirmação, acesso, correção, portabilidade, eliminação, informação, revogação do consentimento, oposição) pelo canal do Encarregado: {{ENCARREGADO_EMAIL}} / {{ENCARREGADO_CANAL}}. Responderemos em até 15 dias, podendo solicitar comprovação de identidade.

[(Voltar ao topo)](#sum%C3%A1rio)

### 10. Uso por menores

{{MENORES_POLITICA}}. Identificada tentativa de uso por menores sem autorização, bloquearemos a conta e trataremos as solicitações de eliminação.

[(Voltar ao topo)](#sum%C3%A1rio)

### 11. Atualizações desta Política

Podemos atualizar esta Política para refletir mudanças legais/operacionais. Publicaremos a nova versão com data e manteremos changelog resumido.

[(Voltar ao topo)](#sum%C3%A1rio)

### 12. Contato do Encarregado/DPO

{{ENCARREGADO_NOME}} — {{ENCARREGADO_EMAIL}} — {{ENCARREGADO_CANAL}}

[(Voltar ao topo)](#sum%C3%A1rio)

---

Changelog:

- v1.0.0 (05/11/2025): Versão inicial com mapeamento de dados, cookies e retenção.

Versão 1.0.0 — Atualizada em 05/11/2025





