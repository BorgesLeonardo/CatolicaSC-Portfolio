/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, ImageRun, PageBreak, Table, TableRow, TableCell, WidthType } = require('docx');

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading: level, spacing: { after: 200 } });
}

function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...opts })],
    spacing: { after: 120 },
  });
}

function bullet(text) {
  return new Paragraph({
    text,
    bullet: { level: 0 },
    spacing: { after: 60 },
  });
}

function emptyLine() {
  return new Paragraph({ text: '', spacing: { after: 120 } });
}

function addImage(doc, imgPath, width) {
  if (!fs.existsSync(imgPath)) return para(`Imagem não encontrada: ${imgPath}`);
  const buffer = fs.readFileSync(imgPath);
  const imageRun = new ImageRun({
    data: buffer,
    transformation: { width },
  });
  return new Paragraph({ children: [imageRun], alignment: AlignmentType.CENTER, spacing: { after: 200 } });
}

async function main() {
  const rootDir = path.join(__dirname, '..', '..');
  const imagensDir = path.join(rootDir, 'imagens');

  const doc = new Document({
    creator: 'CatolicaSC-Portfolio',
    title: 'RFC - Plataforma de Crowdfunding Just Founders',
    description: 'Documento RFC gerado automaticamente a partir do repositório',
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          run: { size: 24 },
          paragraph: { spacing: { line: 276 } },
        },
      ],
    },
    sections: [],
  });

  const capaTitle = 'Plataforma de Crowdfunding Just Founders';
  const estudante = 'Leonardo Pereira Borges';
  const curso = 'Engenharia de Software';
  const dataEntrega = '29/11/2025';

  const capa = [
    new Paragraph({
      children: [new TextRun({ text: capaTitle, bold: true, size: 48 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    emptyLine(),
    para(`Nome do Estudante: ${estudante}`),
    para(`Curso: ${curso}`),
    para(`Data de Entrega: ${dataEntrega}`),
    new Paragraph({ text: '', pageBreakBefore: true }),
  ];

  const resumo = [
    heading('Resumo', HeadingLevel.HEADING_1),
    para(
      'Este documento descreve a plataforma de crowdfunding Just Founders, uma aplicação Web (SPA) construída com Quasar/Vue 3 (TypeScript) e um backend Node.js 20 + Express, ' +
        'com persistência em PostgreSQL via Prisma. A solução integra Clerk para autenticação/gestão de contas e Stripe (Checkout e Connect) para pagamentos e repasses. ' +
        'O projeto adota boas práticas de Engenharia de Software: arquitetura modular, validações (Zod), testes automatizados, CI/CD, observabilidade e foco em segurança e UX.'
    ),
  ];

  const introducao = [
    heading('1. Introdução', HeadingLevel.HEADING_1),
    para('Contexto', { bold: true }),
    para(
      'O crowdfunding viabiliza o financiamento coletivo de causas e produtos por meio de comunidades online. Exige plataformas seguras, escaláveis e fáceis de usar.'
    ),
    para('Justificativa', { bold: true }),
    para(
      'Este projeto consolida fundamentos de Engenharia de Software ponta a ponta: arquitetura bem definida, integrações externas (Clerk/Stripe), ' +
        'modelagem relacional, validações robustas, testes, pipeline de entrega contínua, segurança e conformidade (LGPD, OWASP).'
    ),
    para('Objetivos', { bold: true }),
    bullet('Desenvolver uma aplicação web completa para cadastro, visualização e apoio financeiro a projetos.'),
    bullet('Integrar autenticação via Clerk e pagamentos via Stripe (Checkout, Connect, assinaturas).'),
    bullet('Garantir qualidade com testes, cobertura combinada ≥ 80% e análise contínua.'),
    bullet('Assegurar observabilidade (New Relic) e boas práticas de segurança.'),
  ];

  const descricaoProjeto = [
    heading('2. Descrição do Projeto', HeadingLevel.HEADING_1),
    para('Linha de Projeto', { bold: true }),
    para('Web Apps'),
    para('Tema do Projeto', { bold: true }),
    para('Plataforma de crowdfunding para criação de campanhas e apoio financeiro, com repasses ao criador via Stripe Connect.'),
    para('Propósito e Uso Prático', { bold: true }),
    para(
      'Facilitar a viabilização de campanhas por meio de contribuições seguras, transparentes e com boa experiência de uso, incluindo campanhas com mídia (imagens e vídeo).'
    ),
    para('Público-Alvo', { bold: true }),
    para('Criadores de campanhas e apoiadores em geral.'),
    para('Problemas a Resolver', { bold: true }),
    bullet('Dificuldade em operacionalizar arrecadação online com segurança e repasse.'),
    bullet('Gestão de campanhas, categorias, comentários e métricas.'),
    para('Diferenciação/Ineditismo', { bold: true }),
    bullet('Integração completa com Stripe Checkout e Connect para repasse ao criador.'),
    bullet('Foco em UX com SPA em Quasar/Vue 3 e composição de mídia.'),
    para('Limitações', { bold: true }),
    bullet('Não cobre leilões, marketplace amplo ou crowdfunding de equity.'),
    para('Normas e Legislações Aplicáveis', { bold: true }),
    bullet('LGPD (dados pessoais, consentimento e direitos do titular).'),
    bullet('OWASP Top 10 como guia de segurança de aplicação.'),
    bullet('PCI DSS (indiretamente, via Stripe como PCI compliant).'),
    para('Métricas de Sucesso', { bold: true }),
    bullet('Tempo de resposta médio (p95) < 300 ms no backend.'),
    bullet('Cobertura de testes combinada ≥ 80%.'),
    bullet('Taxa de conversão de checkout e churn de assinaturas.'),
  ];

  const requisitos = [
    heading('3. Especificação Técnica', HeadingLevel.HEADING_1),
    heading('3.1. Requisitos de Software', HeadingLevel.HEADING_2),
    para('Requisitos Funcionais (RF)', { bold: true }),
    bullet('RF01: Criar/editar/visualizar projetos com categorias e mídia.'),
    bullet('RF02: Realizar contribuições via Stripe Checkout.'),
    bullet('RF03: Repasse ao criador com Stripe Connect (onboarding e dashboard).'),
    bullet('RF04: Comentários públicos em projetos, com moderação básica.'),
    bullet('RF05: Assinaturas recorrentes opcionais.'),
    bullet('RF06: Autenticação/conta via Clerk; rotas privadas protegidas.'),
    bullet('RF07: Métricas pessoais e públicas (stats).'),
    para('Requisitos Não-Funcionais (RNF)', { bold: true }),
    bullet('RNF01: Disponibilidade e resiliência a falhas (tratamento de erros e idempotência).'),
    bullet('RNF02: Segurança (OWASP Top 10), validação de dados (Zod) e CORS configurado.'),
    bullet('RNF03: Desempenho (p95 < 300 ms) e paginação eficiente.'),
    bullet('RNF04: Observabilidade (New Relic) e logs estruturados.'),
    bullet('RNF05: CI/CD com testes e gate de cobertura.'),
    para('Representação dos Requisitos', { bold: true }),
    para('Casos de uso principais: gestão de campanhas, apoio (checkout), onboarding Connect e comentários.'),
    para('Aderência aos Requisitos da Linha de Projeto', { bold: true }),
    bullet('SPA responsiva com boa UX (Quasar/Vue 3).'),
    bullet('API RESTful com documentação OpenAPI.'),
    bullet('Integração de pagamentos segura (Stripe).'),
  ];

  const design = [
    heading('3.2. Considerações de Design', HeadingLevel.HEADING_2),
    para('Visão Inicial da Arquitetura', { bold: true }),
    para('Arquitetura em camadas: Frontend (SPA), Backend (REST), Persistência (PostgreSQL via Prisma), Integrações (Clerk/Stripe/S3).'),
    para('Padrões de Arquitetura', { bold: true }),
    bullet('Arquitetura em camadas e controllers/services no backend.'),
    para('Modelos C4', { bold: true }),
    para('Nível Contexto e Container ilustrados abaixo:'),
    addImage(doc, path.join(imagensDir, 'Contexto.png'), 600),
    addImage(doc, path.join(imagensDir, 'Arquitetura.png'), 600),
    para('Mockups das Telas Principais', { bold: true }),
    para('A navegação principal inclui: home com listagem/filtragem, detalhe de projeto, criação/edição, fluxo de checkout e área autenticada do usuário.'),
    para('Decisões e Alternativas Consideradas', { bold: true }),
    bullet('Vue 3 + Quasar pela produtividade e componentes, alternativa: React + Next.js.'),
    bullet('Prisma pela DX e migrations, alternativa: TypeORM.'),
    para('Critérios de Escalabilidade, Resiliência e Segurança', { bold: true }),
    bullet('Rate limit, idempotência em pontos críticos e uso de webhooks Stripe com verificação de assinatura.'),
    bullet('Uploads para S3 e uso de URLs públicas versionadas.'),
  ];

  const stack = [
    heading('3.3. Stack Tecnológica', HeadingLevel.HEADING_2),
    para('Linguagens de Programação', { bold: true }),
    bullet('TypeScript (frontend e backend).'),
    para('Frameworks e Bibliotecas', { bold: true }),
    bullet('Frontend: Vue 3, Quasar.'),
    bullet('Backend: Express, Prisma, Zod, Pino.'),
    bullet('Pagamentos: Stripe (Checkout, Connect).'),
    bullet('Autenticação: Clerk.'),
    para('Ferramentas de Desenvolvimento e Gestão', { bold: true }),
    bullet('GitHub, GitHub Actions, SonarCloud, New Relic (APM).'),
    para('Licenciamento', { bold: true }),
    bullet('MIT para o código do projeto.'),
  ];

  const seguranca = [
    heading('3.4. Considerações de Segurança', HeadingLevel.HEADING_2),
    para('Riscos Identificados', { bold: true }),
    bullet('Injeção, XSS, CSRF, exposição indevida de dados, webhooks forjados.'),
    para('Medidas de Mitigação', { bold: true }),
    bullet('Validação com Zod; sanitize de HTML; CORS e headers de segurança (helmet); verificação de assinatura do Stripe.'),
    bullet('Armazenamento mínimo e seguro de dados pessoais; segregação de funções.'),
    para('Normas e Boas Práticas Seguidas', { bold: true }),
    bullet('OWASP Top 10, LGPD, boas práticas de APIs REST.'),
    para('Responsabilidade Ética', { bold: true }),
    bullet('Minimização de dados, transparência, consentimento e possibilidade de exclusão.'),
  ];

  const conformidade = [
    heading('3.5. Conformidade e Normas Aplicáveis', HeadingLevel.HEADING_2),
    bullet('LGPD – Coleta mínima, consentimento explícito, direitos do titular e política clara.'),
    bullet('Marco Civil da Internet – Registros e guarda quando aplicável.'),
    bullet('PCI DSS – Observado via Stripe, que é PCI compliant.'),
  ];

  const proximosPassos = [
    heading('4. Próximos Passos', HeadingLevel.HEADING_1),
    bullet('Portfólio I: MVP com criação/listagem de campanhas, checkout básico e onboarding Connect.'),
    bullet('Portfólio II: Assinaturas, métricas avançadas, otimizações de UX e observabilidade.'),
    bullet('Definição de marcos e checkpoints em integração contínua.'),
  ];

  const referencias = [
    heading('5. Referências', HeadingLevel.HEADING_1),
    bullet('Vue.js – https://vuejs.org/'),
    bullet('Quasar – https://quasar.dev/'),
    bullet('Express – https://expressjs.com/'),
    bullet('Prisma – https://www.prisma.io/docs'),
    bullet('Stripe – https://stripe.com/docs/api'),
    bullet('Clerk – https://clerk.com/docs'),
    bullet('OWASP Top 10 – https://owasp.org/Top10/'),
    bullet('LGPD – Lei nº 13.709/2018'),
    bullet('Node.js Best Practices – https://github.com/goldbergyoni/nodebestpractices'),
  ];

  const apendices = [
    heading('6. Apêndices (Opcionais)', HeadingLevel.HEADING_1),
    para('Diagrama de Usuário Autenticado'),
    addImage(doc, path.join(imagensDir, 'UsuarioAutenticado.png'), 600),
    para('Diagrama de Acesso Público'),
    addImage(doc, path.join(imagensDir, 'AcessoPublico.png'), 600),
  ];

  const avaliacoes = [
    heading('7. Avaliações de Professores', HeadingLevel.HEADING_1),
    para('Considerações Professor/a:'),
    emptyLine(),
    emptyLine(),
    new Paragraph({ children: [new TextRun({ text: '' })], pageBreakBefore: true }),
    para('Considerações Professor/a:'),
    emptyLine(),
    emptyLine(),
    new Paragraph({ children: [new TextRun({ text: '' })], pageBreakBefore: true }),
    para('Considerações Professor/a:'),
    emptyLine(),
    emptyLine(),
  ];

  doc.addSection({ children: [...capa] });
  doc.addSection({ children: [...resumo] });
  doc.addSection({ children: [...introducao] });
  doc.addSection({ children: [...descricaoProjeto] });
  doc.addSection({ children: [...requisitos] });
  doc.addSection({ children: [...design] });
  doc.addSection({ children: [...stack] });
  doc.addSection({ children: [...seguranca] });
  doc.addSection({ children: [...conformidade] });
  doc.addSection({ children: [...proximosPassos] });
  doc.addSection({ children: [...referencias] });
  doc.addSection({ children: [...apendices] });
  doc.addSection({ children: [...avaliacoes] });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(rootDir, 'RFC - Plataforma de Crowdfunding - Just Founders.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`Documento gerado em: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


