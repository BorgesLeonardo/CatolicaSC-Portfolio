# Configuração de Secrets do GitHub

## Secrets Necessários

Para que os pipelines CI/CD funcionem corretamente, você precisa configurar os seguintes secrets no GitHub:

### 1. SonarQube
- **SONAR_TOKEN**: Token de acesso do SonarQube
- **SONAR_HOST_URL**: URL do servidor SonarQube

### 2. Snyk (Opcional)
- **SNYK_TOKEN**: Token de acesso do Snyk para análise de segurança

### 3. Deploy (Opcional)
- **DOCKER_USERNAME**: Usuário do Docker Hub
- **DOCKER_PASSWORD**: Senha do Docker Hub
- **KUBECONFIG**: Configuração do Kubernetes (se usando K8s)

## Como Configurar

### 1. Acesse as Configurações do Repositório
1. Vá para o seu repositório no GitHub
2. Clique em **Settings**
3. No menu lateral, clique em **Secrets and variables** > **Actions**

### 2. Adicione os Secrets
1. Clique em **New repository secret**
2. Digite o nome do secret (ex: `SONAR_TOKEN`)
3. Digite o valor do secret
4. Clique em **Add secret**

### 3. Configuração do SonarQube

#### Para SonarQube Cloud (SonarCloud):
1. Acesse [sonarcloud.io](https://sonarcloud.io)
2. Faça login com sua conta GitHub
3. Crie um novo projeto
4. Vá em **Administration** > **Security** > **Generate Tokens**
5. Gere um token e copie o valor
6. Configure os secrets:
   - `SONAR_TOKEN`: Token gerado
   - `SONAR_HOST_URL`: https://sonarcloud.io

#### Para SonarQube Self-Hosted:
1. Acesse seu servidor SonarQube
2. Faça login como administrador
3. Vá em **Administration** > **Security** > **Users**
4. Gere um token para o usuário
5. Configure os secrets:
   - `SONAR_TOKEN`: Token gerado
   - `SONAR_HOST_URL`: URL do seu servidor (ex: http://localhost:9000)

### 4. Configuração do Snyk (Opcional)

1. Acesse [snyk.io](https://snyk.io)
2. Faça login com sua conta GitHub
3. Vá em **Account settings** > **General** > **API Token**
4. Copie o token
5. Configure o secret:
   - `SNYK_TOKEN`: Token do Snyk

## Verificação

Após configurar os secrets, você pode verificar se estão funcionando:

1. Faça um push para a branch `main` ou `develop`
2. Vá para a aba **Actions** do seu repositório
3. Verifique se os workflows estão executando sem erros
4. Se houver erros relacionados a secrets, verifique se os nomes estão corretos

## Troubleshooting

### Erro: "Secret not found"
- Verifique se o nome do secret está correto
- Certifique-se de que o secret foi adicionado no repositório correto

### Erro: "Invalid token"
- Verifique se o token está correto
- Para SonarQube, certifique-se de que o token tem as permissões necessárias

### Erro: "Connection refused"
- Verifique se a URL do SonarQube está correta
- Certifique-se de que o servidor está acessível

## Exemplo de Configuração Local

Para testar localmente, você pode criar um arquivo `.env` na raiz do projeto:

```bash
# .env (não commitar este arquivo)
SONAR_TOKEN=seu-token-aqui
SONAR_HOST_URL=http://localhost:9000
SNYK_TOKEN=seu-token-snyk-aqui
```

E executar os comandos:

```bash
# Frontend
cd frontend
npm run sonar

# Backend
cd backend
npm run sonar
```
