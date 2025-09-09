import { server } from './app/server'
import { testDatabaseConnections } from './db'

const PORT = process.env['PORT'] || 3333

// Testar conexões com os bancos de dados
async function initializeApp() {
  try {
    const connections = await testDatabaseConnections()
    
    if (!connections.allConnected) {
      console.warn('⚠️  Algumas conexões de banco de dados falharam:')
      console.warn(`   Prisma: ${connections.prisma ? '✅' : '❌'}`)
      console.warn(`   Postgres: ${connections.postgres ? '✅' : '❌'}`)
    } else {
      console.log('✅ Todas as conexões de banco de dados estabelecidas')
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar conexões de banco de dados:', error)
  }
}

// Inicializar aplicação
initializeApp().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`)
    console.log(`📊 Ambiente: ${process.env['NODE_ENV'] || 'development'}`)
  })
})
