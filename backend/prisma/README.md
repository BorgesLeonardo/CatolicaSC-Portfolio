# Seed do Banco de Dados

Este diretório contém o script de seed para popular o banco de dados com dados iniciais.

## Script de Seed

O arquivo `seed.ts` contém as categorias padrão para classificação de campanhas:

- **Saúde** 🏥 - Tratamentos médicos e cuidados com a saúde
- **Educação** 📚 - Projetos educacionais e materiais de estudo
- **Tecnologia** 💻 - Inovações tecnológicas e desenvolvimento
- **Arte e Cultura** 🎨 - Projetos artísticos e culturais
- **Meio Ambiente** 🌱 - Projetos sustentáveis e conservação
- **Esportes** ⚽ - Equipamentos e atividades esportivas
- **Animais** 🐾 - Cuidados veterinários e proteção animal
- **Comunidade** 🤝 - Projetos comunitários e desenvolvimento social
- **Emergência** 🚨 - Campanhas de emergência e situações urgentes
- **Negócios** 💼 - Startups e projetos empresariais

## Como Executar

### 1. Gerar o cliente Prisma
```bash
npm run db:generate
```

### 2. Aplicar as migrações (se necessário)
```bash
npm run db:migrate
```

### 3. Executar o seed
```bash
npm run seed
```

### 4. Verificar no Prisma Studio
```bash
npm run db:studio
```

## Características do Seed

- **Idempotente**: Pode ser executado múltiplas vezes sem duplicar dados
- **Verificação de existência**: Verifica se a categoria já existe antes de criar
- **Logs informativos**: Mostra o progresso da execução
- **Tratamento de erros**: Captura e exibe erros de forma clara

## Estrutura das Categorias

Cada categoria possui:
- `name`: Nome único da categoria
- `description`: Descrição detalhada
- `color`: Cor hexadecimal para identificação visual
- `icon`: Emoji para representação visual
- `isActive`: Status ativo/inativo (padrão: true)
