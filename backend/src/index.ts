import { server } from './app/server'

const PORT = process.env['PORT'] || 3333

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📊 Ambiente: ${process.env['NODE_ENV'] || 'development'}`)
})
