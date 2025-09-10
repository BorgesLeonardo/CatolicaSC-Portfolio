import dotenv from 'dotenv';
import Database from '../config/database';

// Load environment variables
dotenv.config();

async function seedCategories() {
  console.log('🌱 Populando categorias iniciais...');
  
  try {
    await Database.connect();
    const prisma = Database.getInstance();
    
    const categories = [
      {
        name: 'Tecnologia',
        description: 'Projetos relacionados a tecnologia, inovação e desenvolvimento'
      },
      {
        name: 'Educação',
        description: 'Projetos educacionais, cursos e materiais didáticos'
      },
      {
        name: 'Saúde',
        description: 'Projetos relacionados à saúde, medicina e bem-estar'
      },
      {
        name: 'Arte e Cultura',
        description: 'Projetos artísticos, culturais e criativos'
      },
      {
        name: 'Meio Ambiente',
        description: 'Projetos sustentáveis e de preservação ambiental'
      },
      {
        name: 'Esportes',
        description: 'Projetos esportivos e de atividade física'
      },
      {
        name: 'Social',
        description: 'Projetos sociais e de impacto na comunidade'
      },
      {
        name: 'Negócios',
        description: 'Projetos empresariais e de empreendedorismo'
      }
    ];
    
    console.log('📝 Criando categorias...');
    
    for (const category of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: category.name }
      });
      
      if (!existingCategory) {
        await prisma.category.create({
          data: category
        });
        console.log(`✅ Categoria '${category.name}' criada`);
      } else {
        console.log(`⚠️  Categoria '${category.name}' já existe`);
      }
    }
    
    // List all categories
    const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 Categorias disponíveis:');
    allCategories.forEach(category => {
      console.log(`- ${category.name}: ${category.description}`);
    });
    
    console.log(`\n🎉 Total de categorias: ${allCategories.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao popular categorias:', error);
  } finally {
    await Database.disconnect();
  }
}

// Run the seed
seedCategories();

