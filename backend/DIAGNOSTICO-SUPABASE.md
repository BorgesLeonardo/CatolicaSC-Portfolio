# 🔍 Diagnóstico da Conexão com Supabase

## ❌ Problemas Identificados

### 1. **Chave da API Inválida**
- **Erro**: `Invalid API key`
- **Causa**: A chave `pk_test_dXAtYmFzaWxpc2stMjkuY2xlcmsuYWNjb3VudHMuZGV2JA` não é válida
- **Solução**: Verificar as credenciais no painel do Supabase

### 2. **URL do Banco Inacessível**
- **Erro**: `Can't reach database server at db.jbuozkvrslranpnjtsen.supabase.co:5432`
- **Causa**: O host não está sendo resolvido ou o projeto não existe
- **Solução**: Verificar se o projeto Supabase está ativo

## 🔧 Credenciais Fornecidas

```env
# Supabase
SUPABASE_URL=https://jbuozkvrslranpnjtsen.supabase.co
SUPABASE_ANON_KEY=pk_test_dXAtYmFzaWxpc2stMjkuY2xlcmsuYWNjb3VudHMuZGV2JA

# Database
DATABASE_URL=postgresql://postgres:emCire6Jy.udXAb@db.jbuozkvrslranpnjtsen.supabase.co:5432/postgres
```

## 🚨 Ações Necessárias

### 1. **Verificar Projeto Supabase**
- Acesse o [painel do Supabase](https://supabase.com/dashboard)
- Verifique se o projeto `jbuozkvrslranpnjtsen` existe
- Confirme se o projeto está ativo e não foi pausado

### 2. **Obter Credenciais Corretas**
- **URL do Projeto**: Vá em Settings > API
- **Chave Anônima**: Copie a `anon public` key
- **URL do Banco**: Vá em Settings > Database > Connection string

### 3. **Verificar Configurações de Rede**
- **Firewall**: Verifique se a porta 5432 está liberada
- **SSL**: Confirme se SSL está habilitado
- **Região**: Verifique se o projeto está na região correta

## 🔄 Testes Realizados

### ✅ **Teste 1: Resolução DNS**
```bash
Test-NetConnection -ComputerName db.jbuozkvrslranpnjtsen.supabase.co -Port 5432
```
**Resultado**: ❌ Falha na resolução do nome

### ✅ **Teste 2: Cliente Supabase**
```bash
node test-supabase.js
```
**Resultado**: ❌ Invalid API key

### ✅ **Teste 3: Prisma Connection**
```bash
npm run db:push
```
**Resultado**: ❌ Can't reach database server

## 📋 Próximos Passos

1. **Verificar no painel do Supabase**:
   - Projeto existe e está ativo?
   - Credenciais estão corretas?
   - Banco de dados está acessível?

2. **Atualizar credenciais**:
   - Copiar URL correta do projeto
   - Copiar chave anônima correta
   - Copiar string de conexão do banco

3. **Testar novamente**:
   - Executar `node test-supabase.js`
   - Executar `npm run db:push`

## 🆘 Suporte

Se o problema persistir:
- Verifique a [documentação do Supabase](https://supabase.com/docs)
- Consulte o [status do Supabase](https://status.supabase.com)
- Entre em contato com o suporte do Supabase
