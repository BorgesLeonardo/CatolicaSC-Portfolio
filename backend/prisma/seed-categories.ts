import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  {
    name: 'Educação',
    description: 'Campanhas relacionadas a educação, cursos, materiais didáticos',
    color: '#3B82F6', // blue-500
    icon: 'school'
  },
  {
    name: 'Saúde',
    description: 'Campanhas para tratamentos médicos, medicamentos, equipamentos',
    color: '#EF4444', // red-500
    icon: 'medical_services'
  },
  {
    name: 'Esportes',
    description: 'Campanhas para atletas, equipamentos esportivos, competições',
    color: '#10B981', // green-500
    icon: 'sports_soccer'
  },
  {
    name: 'Cultura',
    description: 'Campanhas para arte, música, teatro, eventos culturais',
    color: '#8B5CF6', // purple-500
    icon: 'palette'
  },
  {
    name: 'Tecnologia',
    description: 'Campanhas para projetos de tecnologia, inovação, startups',
    color: '#06B6D4', // cyan-500
    icon: 'computer'
  },
  {
    name: 'Meio Ambiente',
    description: 'Campanhas para preservação ambiental, sustentabilidade',
    color: '#059669', // green-600
    icon: 'eco'
  },
  {
    name: 'Animais',
    description: 'Campanhas para proteção animal, ONGs, tratamentos veterinários',
    color: '#D97706', // amber-600
    icon: 'pets'
  },
  {
    name: 'Emergência',
    description: 'Campanhas para situações de emergência, desastres naturais',
    color: '#DC2626', // red-600
    icon: 'emergency'
  },
  {
    name: 'Comunidade',
    description: 'Campanhas para projetos comunitários, melhorias sociais',
    color: '#7C3AED', // violet-600
    icon: 'groups'
  },
  {
    name: 'Outros',
    description: 'Outras categorias não especificadas',
    color: '#6B7280', // gray-500
    icon: 'category'
  }
]

async function seedCategories() {
  console.log('🌱 Populando categorias...')
  
  try {
    for (const category of categories) {
      await prisma.category.upsert({
        where: { name: category.name },
        update: {
          description: category.description,
          color: category.color,
          icon: category.icon,
          isActive: true
        },
        create: category
      })
      console.log(`✅ Categoria "${category.name}" criada/atualizada`)
    }
    
    console.log('🎉 Categorias populadas com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao popular categorias:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Executa o seed automaticamente
seedCategories()
  .then(() => process.exit(0))
  .catch(() => process.exit(1))

export { seedCategories }
