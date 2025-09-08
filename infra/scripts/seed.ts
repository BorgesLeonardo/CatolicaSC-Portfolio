import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar categorias
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Educação' },
      update: {},
      create: {
        name: 'Educação',
        description: 'Projetos relacionados à educação e ensino'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Saúde' },
      update: {},
      create: {
        name: 'Saúde',
        description: 'Projetos relacionados à saúde e bem-estar'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Tecnologia' },
      update: {},
      create: {
        name: 'Tecnologia',
        description: 'Projetos de tecnologia e inovação'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Meio Ambiente' },
      update: {},
      create: {
        name: 'Meio Ambiente',
        description: 'Projetos ambientais e sustentabilidade'
      }
    }),
    prisma.category.upsert({
      where: { name: 'Cultura' },
      update: {},
      create: {
        name: 'Cultura',
        description: 'Projetos culturais e artísticos'
      }
    })
  ])

  console.log(`✅ ${categories.length} categorias criadas`)

  // Criar usuário de exemplo (simulando dados do Clerk)
  const user = await prisma.user.upsert({
    where: { clerkId: 'user_example_123' },
    update: {},
    create: {
      clerkId: 'user_example_123',
      email: 'usuario@exemplo.com',
      name: 'Usuário Exemplo',
      avatar: 'https://via.placeholder.com/150'
    }
  })

  console.log(`✅ Usuário exemplo criado: ${user.email}`)

  // Criar campanhas de exemplo
  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        title: 'Biblioteca Digital para Escola Pública',
        description: 'Projeto para criar uma biblioteca digital com livros e recursos educacionais para uma escola pública da região.',
        goal: 5000.00,
        current: 1250.00,
        image: 'https://via.placeholder.com/400x300',
        status: 'ACTIVE',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        userId: user.id,
        categoryId: categories[0].id // Educação
      }
    }),
    prisma.campaign.create({
      data: {
        title: 'Equipamentos Médicos para Posto de Saúde',
        description: 'Campanha para adquirir equipamentos médicos essenciais para o posto de saúde da comunidade.',
        goal: 8000.00,
        current: 3200.00,
        image: 'https://via.placeholder.com/400x300',
        status: 'ACTIVE',
        endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
        userId: user.id,
        categoryId: categories[1].id // Saúde
      }
    }),
    prisma.campaign.create({
      data: {
        title: 'Aplicativo de Gestão Comunitária',
        description: 'Desenvolvimento de um aplicativo para facilitar a gestão e comunicação da comunidade local.',
        goal: 12000.00,
        current: 0.00,
        image: 'https://via.placeholder.com/400x300',
        status: 'ACTIVE',
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        userId: user.id,
        categoryId: categories[2].id // Tecnologia
      }
    })
  ])

  console.log(`✅ ${campaigns.length} campanhas criadas`)

  // Criar contribuições de exemplo
  const contributions = await Promise.all([
    prisma.contribution.create({
      data: {
        amount: 100.00,
        message: 'Excelente projeto! Vamos apoiar a educação!',
        anonymous: false,
        status: 'COMPLETED',
        paymentId: 'mp_payment_123',
        userId: user.id,
        campaignId: campaigns[0].id
      }
    }),
    prisma.contribution.create({
      data: {
        amount: 50.00,
        message: 'Apoio total!',
        anonymous: true,
        status: 'COMPLETED',
        paymentId: 'mp_payment_124',
        userId: user.id,
        campaignId: campaigns[0].id
      }
    }),
    prisma.contribution.create({
      data: {
        amount: 200.00,
        message: 'Muito importante para nossa comunidade!',
        anonymous: false,
        status: 'COMPLETED',
        paymentId: 'mp_payment_125',
        userId: user.id,
        campaignId: campaigns[1].id
      }
    })
  ])

  console.log(`✅ ${contributions.length} contribuições criadas`)

  // Criar comentários de exemplo
  const comments = await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Projeto muito interessante! Vou acompanhar de perto.',
        userId: user.id,
        campaignId: campaigns[0].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'Parabéns pela iniciativa! A educação precisa de mais projetos como este.',
        userId: user.id,
        campaignId: campaigns[0].id
      }
    })
  ])

  console.log(`✅ ${comments.length} comentários criados`)

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
