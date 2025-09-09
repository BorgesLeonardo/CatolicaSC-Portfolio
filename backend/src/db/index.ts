import { PrismaClient } from '@prisma/client'
import sql from './connection'

// Cliente Prisma para operações do banco de dados
export const prisma = new PrismaClient()

// Cliente postgres para consultas diretas
export { sql }

// Função para testar a conexão com o postgres
export async function testPostgresConnection() {
  try {
    await sql`SELECT 1`
    console.log('Conexão com postgres estabelecida com sucesso')
    return true
  } catch (error) {
    console.error('Erro ao testar conexão com postgres:', error)
    return false
  }
}

// Função para testar a conexão com o Prisma
export async function testPrismaConnection() {
  try {
    await prisma.$connect()
    console.log('Conexão com Prisma estabelecida com sucesso')
    return true
  } catch (error) {
    console.error('Erro ao conectar com Prisma:', error)
    return false
  }
}

// Função para testar ambas as conexões
export async function testDatabaseConnections() {
  const prismaConnected = await testPrismaConnection()
  const postgresConnected = await testPostgresConnection()
  
  return {
    prisma: prismaConnected,
    postgres: postgresConnected,
    allConnected: prismaConnected && postgresConnected
  }
}
