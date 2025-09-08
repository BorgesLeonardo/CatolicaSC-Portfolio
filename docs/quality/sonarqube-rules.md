# SonarQube Quality Rules

## Configuração de Qualidade

### Cobertura de Código
- **Mínimo**: 80% de cobertura de linhas
- **Branches**: 80% de cobertura de branches
- **Functions**: 80% de cobertura de funções
- **Statements**: 80% de cobertura de statements

### Duplicação de Código
- **Máximo**: 3% de código duplicado
- **Exclusões**: Arquivos de teste, migrações, configurações

### Complexidade Ciclomática
- **Máximo**: 10 por função
- **Exclusões**: Funções de teste

### Tamanho de Arquivo
- **Máximo**: 500 linhas por arquivo
- **Exclusões**: Arquivos de configuração, migrações

### Tamanho de Função
- **Máximo**: 50 linhas por função
- **Exclusões**: Funções de teste

### Número de Parâmetros
- **Máximo**: 5 parâmetros por função
- **Exclusões**: Funções de teste

### Número de Linhas por Classe
- **Máximo**: 300 linhas por classe
- **Exclusões**: Classes de teste

### Número de Métodos por Classe
- **Máximo**: 20 métodos por classe
- **Exclusões**: Classes de teste

## Regras de Segurança

### Vulnerabilidades
- **Críticas**: 0 permitidas
- **Altas**: 0 permitidas
- **Médias**: Máximo 5
- **Baixas**: Máximo 10

### Hotspots de Segurança
- **Críticos**: 0 permitidos
- **Altos**: 0 permitidos
- **Médios**: Máximo 3
- **Baixos**: Máximo 5

## Regras de Manutenibilidade

### Code Smells
- **Críticos**: 0 permitidos
- **Altos**: Máximo 5
- **Médios**: Máximo 10
- **Baixos**: Máximo 20

### Dívida Técnica
- **Máximo**: 30 minutos por linha de código
- **Exclusões**: Arquivos de teste

## Configuração de Exclusões

### Arquivos Excluídos da Análise
```
**/node_modules/**
**/dist/**
**/build/**
**/coverage/**
**/*.spec.ts
**/*.test.ts
**/migrations/**
**/prisma/**
**/*.config.*
**/test/**
```

### Diretórios Excluídos da Cobertura
```
**/*.spec.ts
**/*.test.ts
**/test/**
**/migrations/**
**/prisma/**
**/coverage/**
```

## Configuração de Quality Gate

### Critérios de Aprovação
1. **Cobertura de Código**: ≥ 80%
2. **Duplicação**: ≤ 3%
3. **Vulnerabilidades**: 0 críticas/altas
4. **Hotspots**: 0 críticos/altos
5. **Code Smells**: ≤ 5 altos
6. **Dívida Técnica**: ≤ 30min/linha

### Critérios de Falha
- Qualquer vulnerabilidade crítica ou alta
- Qualquer hotspot crítico ou alto
- Cobertura de código abaixo de 80%
- Duplicação acima de 3%
- Mais de 5 code smells altos
