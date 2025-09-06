const database = require('../config/database');
const { validationResult } = require('express-validator');

const campaignController = {
  // Obter todas as campanhas
  async getAllCampaigns(req, res) {
    try {
      const { page = 1, limit = 10, search, category } = req.query;
      const skip = (page - 1) * limit;

      const where = {
        isActive: true,
        ...(search && {
          OR: [
            { title: { contains: search } },
            { description: { contains: search } }
          ]
        })
      };

      const [campaigns, total] = await Promise.all([
        database.getClient().campaign.findMany({
          where,
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true
              }
            },
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
        database.getClient().campaign.count({ where })
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
      console.error('Error getting campaigns:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar campanhas'
      });
    }
  },

  // Obter campanha por ID
  async getCampaignById(req, res) {
    try {
      const { id } = req.params;

      const campaign = await database.getClient().campaign.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          },
          donations: {
            include: {
              donor: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  imageUrl: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: {
              donations: true,
              comments: true
            }
          }
        }
      });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campanha não encontrada'
        });
      }

      res.json({
        success: true,
        data: campaign
      });
    } catch (error) {
      console.error('Error getting campaign:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar campanha'
      });
    }
  },

  // Criar nova campanha
  async createCampaign(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Dados inválidos',
          details: errors.array()
        });
      }

      const { title, description, goal, deadline, imageUrl } = req.body;
      const authorId = req.user.id;

      const campaign = await database.getClient().campaign.create({
        data: {
          title,
          description,
          goal: parseFloat(goal),
          deadline: new Date(deadline),
          imageUrl,
          authorId
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: campaign,
        message: 'Campanha criada com sucesso'
      });
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar campanha'
      });
    }
  },

  // Atualizar campanha
  async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { title, description, goal, deadline, imageUrl } = req.body;

      // Verificar se a campanha existe e pertence ao usuário
      const existingCampaign = await database.getClient().campaign.findFirst({
        where: { id, authorId: userId }
      });

      if (!existingCampaign) {
        return res.status(404).json({
          success: false,
          error: 'Campanha não encontrada ou você não tem permissão para editá-la'
        });
      }

      const campaign = await database.getClient().campaign.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(goal && { goal: parseFloat(goal) }),
          ...(deadline && { deadline: new Date(deadline) }),
          ...(imageUrl !== undefined && { imageUrl })
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: campaign,
        message: 'Campanha atualizada com sucesso'
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar campanha'
      });
    }
  },

  // Deletar campanha
  async deleteCampaign(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verificar se a campanha existe e pertence ao usuário
      const existingCampaign = await database.getClient().campaign.findFirst({
        where: { id, authorId: userId }
      });

      if (!existingCampaign) {
        return res.status(404).json({
          success: false,
          error: 'Campanha não encontrada ou você não tem permissão para deletá-la'
        });
      }

      await database.getClient().campaign.update({
        where: { id },
        data: { isActive: false }
      });

      res.json({
        success: true,
        message: 'Campanha deletada com sucesso'
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao deletar campanha'
      });
    }
  },

  // Obter comentários da campanha
  async getCampaignComments(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const comments = await database.getClient().comment.findMany({
        where: { campaignId: id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      });

      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar comentários'
      });
    }
  },

  // Adicionar comentário
  async addComment(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user.id;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Conteúdo do comentário é obrigatório'
        });
      }

      // Verificar se a campanha existe
      const campaign = await database.getClient().campaign.findUnique({
        where: { id }
      });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campanha não encontrada'
        });
      }

      const comment = await database.getClient().comment.create({
        data: {
          content: content.trim(),
          authorId: userId,
          campaignId: id
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: comment,
        message: 'Comentário adicionado com sucesso'
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao adicionar comentário'
      });
    }
  }
};

module.exports = campaignController;
