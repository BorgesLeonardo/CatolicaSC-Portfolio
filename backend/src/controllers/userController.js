const database = require('../config/database');

const userController = {
  // Obter perfil do usuário
  async getProfile(req, res) {
    try {
      const user = await database.getClient().user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting profile:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar perfil'
      });
    }
  },

  // Atualizar perfil do usuário
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, imageUrl } = req.body;
      const userId = req.user.id;

      const user = await database.getClient().user.update({
        where: { id: userId },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(imageUrl !== undefined && { imageUrl })
        },
        select: {
          id: true,
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        data: user,
        message: 'Perfil atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar perfil'
      });
    }
  },

  // Obter campanhas do usuário
  async getUserCampaigns(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      const userId = req.user.id;

      const [campaigns, total] = await Promise.all([
        database.getClient().campaign.findMany({
          where: { authorId: userId },
          include: {
            _count: {
              select: {
                donations: true,
                comments: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: parseInt(skip),
          take: parseInt(limit)
        }),
        database.getClient().campaign.count({
          where: { authorId: userId }
        })
      ]);

      res.json({
        success: true,
        data: campaigns,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting user campaigns:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar campanhas do usuário'
      });
    }
  },

  // Obter doações do usuário
  async getUserDonations(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      const userId = req.user.id;

      const [donations, total] = await Promise.all([
        database.getClient().donation.findMany({
          where: { donorId: userId },
          include: {
            campaign: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                author: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: parseInt(skip),
          take: parseInt(limit)
        }),
        database.getClient().donation.count({
          where: { donorId: userId }
        })
      ]);

      res.json({
        success: true,
        data: donations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error getting user donations:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar doações do usuário'
      });
    }
  },

  // Obter estatísticas do usuário
  async getUserStats(req, res) {
    try {
      const userId = req.user.id;

      const [
        totalCampaigns,
        activeCampaigns,
        totalDonations,
        totalDonated,
        totalRaised
      ] = await Promise.all([
        // Total de campanhas criadas
        database.getClient().campaign.count({
          where: { authorId: userId }
        }),
        // Campanhas ativas
        database.getClient().campaign.count({
          where: { authorId: userId, isActive: true }
        }),
        // Total de doações recebidas
        database.getClient().donation.count({
          where: {
            campaign: { authorId: userId },
            status: 'completed'
          }
        }),
        // Total doado pelo usuário
        database.getClient().donation.aggregate({
          where: {
            donorId: userId,
            status: 'completed'
          },
          _sum: { amount: true }
        }),
        // Total arrecadado nas campanhas do usuário
        database.getClient().donation.aggregate({
          where: {
            campaign: { authorId: userId },
            status: 'completed'
          },
          _sum: { amount: true }
        })
      ]);

      res.json({
        success: true,
        data: {
          campaigns: {
            total: totalCampaigns,
            active: activeCampaigns
          },
          donations: {
            received: totalDonations,
            donated: totalDonated._sum.amount || 0,
            raised: totalRaised._sum.amount || 0
          }
        }
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar estatísticas do usuário'
      });
    }
  }
};

module.exports = userController;
