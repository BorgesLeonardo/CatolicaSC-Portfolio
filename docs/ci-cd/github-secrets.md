# Configuração dos Secrets do GitHub

Este documento explica como configurar os secrets necessários para o funcionamento do CI/CD.

## Secrets Obrigatórios

### 1. SONAR_TOKEN

**Descrição**: Token de acesso para autenticação no SonarQube/SonarCloud

**Valor**: `c8ecd4d1da050850cb10c45663b1201cc9bec071`

**Como configurar**:
1. Acesse o repositório no GitHub
2. Vá para **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Configure:
   - **Name**: `SONAR_TOKEN`
   - **Value**: `c8ecd4d1da050850cb10c45663b1201cc9bec071`
5. Clique em **Add secret**

## Secrets Opcionais

### 2. DEPLOY_TOKEN (Opcional)

**Descrição**: Token para deploy em ambientes específicos

**Como configurar**:
1. Acesse o repositório no GitHub
2. Vá para **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Configure:
   - **Name**: `DEPLOY_TOKEN`
   - **Value**: [Seu token de deploy]
5. Clique em **Add secret**

### 3. DATABASE_URL (Opcional)

**Descrição**: URL de conexão com o banco de dados para testes

**Como configurar**:
1. Acesse o repositório no GitHub
2. Vá para **Settings** > **Secrets and variables** > **Actions**
3. Clique em **New repository secret**
4. Configure:
   - **Name**: `DATABASE_URL`
   - **Value**: [Sua URL de banco de dados]
5. Clique em **Add secret**

## Variáveis de Ambiente

### 1. NODE_VERSION

**Descrição**: Versão do Node.js para usar no CI/CD

**Valor Padrão**: `20`

**Como configurar**:
1. Acesse o repositório no GitHub
2. Vá para **Settings** > **Secrets and variables** > **Actions**
3. Clique na aba **Variables**
4. Clique em **New repository variable**
5. Configure:
   - **Name**: `NODE_VERSION`
   - **Value**: `20`
6. Clique em **Add variable**

### 2. SONAR_ORGANIZATION

**Descrição**: Organização do SonarQube

**Valor Padrão**: `catolicasc-portfolio`

**Como configurar**:
1. Acesse o repositório no GitHub
2. Vá para **Settings** > **Secrets and variables** > **Actions**
3. Clique na aba **Variables**
4. Clique em **New repository variable**
5. Configure:
   - **Name**: `SONAR_ORGANIZATION`
   - **Value**: `catolicasc-portfolio`
6. Clique em **Add variable**

## Verificação da Configuração

### 1. Verificar Secrets

Para verificar se os secrets estão configurados:

1. Acesse o repositório no GitHub
2. Vá para **Settings** > **Secrets and variables** > **Actions**
3. Verifique se os secrets listados acima estão presentes

### 2. Testar Workflow

Para testar se a configuração está funcionando:

1. Crie um Pull Request
2. Verifique se o workflow é executado
3. Verifique se não há erros de autenticação
4. Verifique se a análise do SonarQube é executada

## Troubleshooting

### Erro de Autenticação

Se houver erro de autenticação:

1. Verifique se o `SONAR_TOKEN` está configurado corretamente
2. Confirme se o token tem permissões adequadas
3. Verifique se a organização `catolicasc-portfolio` existe

### Erro de Deploy

Se houver erro de deploy:

1. Verifique se o `DEPLOY_TOKEN` está configurado
2. Confirme se o token tem permissões de deploy
3. Verifique se as configurações de ambiente estão corretas

### Erro de Banco de Dados

Se houver erro de banco de dados:

1. Verifique se o `DATABASE_URL` está configurado
2. Confirme se a URL está acessível
3. Verifique se as credenciais estão corretas

## Segurança

### Boas Práticas

1. **Nunca commite secrets no código**
2. **Use tokens com permissões mínimas necessárias**
3. **Rotacione tokens regularmente**
4. **Monitore o uso dos tokens**
5. **Use variáveis de ambiente para valores não sensíveis**

### Rotação de Tokens

Para rotacionar tokens:

1. Gere um novo token no serviço correspondente
2. Atualize o secret no GitHub
3. Teste se o workflow ainda funciona
4. Revogue o token antigo

## Suporte

Para problemas com a configuração:

1. Verifique a documentação do SonarQube
2. Consulte os logs do GitHub Actions
3. Entre em contato com a equipe de desenvolvimento
