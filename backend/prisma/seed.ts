import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config()

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Saúde',
    description: 'Campanhas relacionadas a tratamentos médicos, cirurgias e cuidados com a saúde',
    color: '#FF6B6B',
    icon: '🏥'
  },
  {
    name: 'Educação',
    description: 'Projetos educacionais, cursos, livros e materiais de estudo',
    color: '#4ECDC4',
    icon: '📚'
  },
  {
    name: 'Tecnologia',
    description: 'Inovações tecnológicas, desenvolvimento de software e hardware',
    color: '#45B7D1',
    icon: '💻'
  },
  {
    name: 'Arte e Cultura',
    description: 'Projetos artísticos, culturais, música, teatro e cinema',
    color: '#96CEB4',
    icon: '🎨'
  },
  {
    name: 'Meio Ambiente',
    description: 'Projetos sustentáveis, conservação ambiental e energia limpa',
    color: '#FFEAA7',
    icon: '🌱'
  },
  {
    name: 'Esportes',
    description: 'Equipamentos esportivos, competições e atividades físicas',
    color: '#DDA0DD',
    icon: '⚽'
  },
  {
    name: 'Animais',
    description: 'Cuidados veterinários, resgate de animais e proteção animal',
    color: '#F39C12',
    icon: '🐾'
  },
  {
    name: 'Comunidade',
    description: 'Projetos comunitários, eventos locais e desenvolvimento social',
    color: '#E17055',
    icon: '🤝'
  },
  {
    name: 'Emergência',
    description: 'Campanhas de emergência, desastres naturais e situações urgentes',
    color: '#E84393',
    icon: '🚨'
  },
  {
    name: 'Negócios',
    description: 'Startups, empreendimentos e projetos empresariais',
    color: '#6C5CE7',
    icon: '💼'
  }
]

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar categorias existentes (opcional - descomente se quiser resetar)
  // await prisma.category.deleteMany()
  // console.log('🗑️ Categorias existentes removidas')

  // Criar categorias
  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { name: category.name }
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: category
      })
      console.log(`✅ Categoria "${category.name}" criada`)
    } else {
      console.log(`⚠️ Categoria "${category.name}" já existe, pulando...`)
    }
  }

  console.log('🎉 Seed concluído com sucesso!')
  console.log('📊 Total de categorias no banco:', await prisma.category.count())
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
