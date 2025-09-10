import { clerkClient } from '../config/clerk.js';
import prisma from '../config/database.js';

// Sincroniza um usuário do Clerk com o banco de dados
export async function syncUserFromClerk(clerkUserId) {
  try {
    // Busca o usuário no Clerk
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    
    if (!clerkUser) {
      throw new Error('Usuário não encontrado no Clerk');
    }

    // Verifica se o usuário já existe no banco
    const existingUser = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    const userData = {
      clerkUserId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      imageUrl: clerkUser.imageUrl || null,
    };

    if (existingUser) {
      // Atualiza o usuário existente
      const updatedUser = await prisma.user.update({
        where: { clerkUserId },
        data: {
          email: userData.email,
          name: userData.name,
          imageUrl: userData.imageUrl,
          updatedAt: new Date()
        }
      });
      
      console.log(`✅ Usuário atualizado: ${updatedUser.email}`);
      return updatedUser;
    } else {
      // Cria um novo usuário
      const newUser = await prisma.user.create({
        data: {
          ...userData,
          role: 'USER' // Default role
        }
      });
      
      console.log(`✅ Novo usuário criado: ${newUser.email}`);
      return newUser;
    }
  } catch (error) {
    console.error('Erro ao sincronizar usuário:', error);
    throw error;
  }
}

// Remove um usuário do banco quando deletado no Clerk
export async function removeUserFromDatabase(clerkUserId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId }
    });

    if (!user) {
      console.log(`Usuário ${clerkUserId} não encontrado no banco`);
      return null;
    }

    // Remove o usuário (cascade delete vai remover relacionamentos)
    await prisma.user.delete({
      where: { clerkUserId }
    });

    console.log(`✅ Usuário removido: ${user.email}`);
    return user;
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    throw error;
  }
}

// Busca um usuário no banco pelo Clerk ID
export async function getUserByClerkId(clerkUserId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        campaigns: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true
          }
        },
        contributions: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
}

// Atualiza o perfil do usuário
export async function updateUserProfile(clerkUserId, updateData) {
  try {
    const allowedFields = ['name', 'imageUrl'];
    const filteredData = {};
    
    // Filtra apenas campos permitidos
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        filteredData[key] = updateData[key];
      }
    });

    if (Object.keys(filteredData).length === 0) {
      throw new Error('Nenhum campo válido para atualização');
    }

    const updatedUser = await prisma.user.update({
      where: { clerkUserId },
      data: {
        ...filteredData,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Perfil atualizado: ${updatedUser.email}`);
    return updatedUser;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
}
