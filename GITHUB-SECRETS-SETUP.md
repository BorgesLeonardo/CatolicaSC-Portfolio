# 🔐 Configuração de Secrets do GitHub

## ⚠️ **Ação Necessária**

Para que o CI/CD funcione corretamente, você precisa configurar as seguintes secrets no GitHub:

## 📋 **Secrets Obrigatórias**

### 1. **DATABASE_URL**
```
postgresql://postgres.jbuozkvrslranpnjtsen:emCire6Jy.udXAb@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

### 2. **DIRECT_URL** ⭐ **NOVA - NECESSÁRIA**
```
postgresql://postgres.jbuozkvrslranpnjtsen:emCire6Jy.udXAb@aws-1-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

### 3. **CLERK_SECRET_KEY**
```
pk_test_dXAtYmFzaWxpc2stMjkuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### 4. **CLERK_PUBLISHABLE_KEY**
```
pk_test_dXAtYmFzaWxpc2stMjkuY2xlcmsuYWNjb3VudHMuZGV2JA
```

## 🛠️ **Como Configurar**

### **Passo 1: Acessar Configurações**
1. Vá para o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Secrets and variables** → **Actions**

### **Passo 2: Adicionar Secrets**
1. Clique em **New repository secret**
2. Digite o nome da secret (ex: `DATABASE_URL`)
3. Cole o valor correspondente
4. Clique em **Add secret**
5. Repita para todas as secrets listadas acima

### **Passo 3: Verificar**
- ✅ `DATABASE_URL` - Connection pooling
- ✅ `DIRECT_URL` - Direct connection (NOVA)
- ✅ `CLERK_SECRET_KEY` - Autenticação
- ✅ `CLERK_PUBLISHABLE_KEY` - Autenticação

## 🔄 **Atualização do Workflow**

O arquivo `.github/workflows/backend.yml` foi atualizado para incluir:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  DIRECT_URL: ${{ secrets.DIRECT_URL }}  # ⭐ NOVA
  CLERK_SECRET_KEY: ${{ secrets.CLERK_SECRET_KEY }}
  CLERK_PUBLISHABLE_KEY: ${{ secrets.CLERK_PUBLISHABLE_KEY }}
```

## 🎯 **Resultado Esperado**

Após configurar as secrets, o CI/CD deve:
- ✅ **Code Quality & Tests**: Passar
- ✅ **Build & Package**: Passar  
- ✅ **Database Migration**: Passar (com DIRECT_URL)
- ✅ **Deploy to Production**: Passar
- ✅ **Notify Status**: Passar

## 🚨 **Importante**

- **DIRECT_URL** é necessária para migrações do Prisma
- **DATABASE_URL** é usada para queries normais
- Ambas apontam para o mesmo banco Supabase
- Porta 6543 = Connection pooling
- Porta 5432 = Direct connection

## 🔧 **Troubleshooting**

Se ainda houver erro:
1. Verifique se todas as secrets estão configuradas
2. Confirme se os valores estão corretos
3. Execute o workflow novamente
4. Verifique os logs do GitHub Actions

**🎉 Após configurar as secrets, o CI/CD funcionará perfeitamente!**
