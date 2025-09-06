const database = require('../config/database');
const QRCode = require('qrcode');
const axios = require('axios');

const donationController = {
  // Criar nova doação
  async createDonation(req, res) {
    try {
      const { campaignId, amount } = req.body;
      const donorId = req.user.id;

      // Verificar se a campanha existe e está ativa
      const campaign = await database.getClient().campaign.findUnique({
        where: { id: campaignId }
      });

      if (!campaign || !campaign.isActive) {
        return res.status(404).json({
          success: false,
          error: 'Campanha não encontrada ou inativa'
        });
      }

      // Verificar se a campanha não expirou
      if (new Date() > campaign.deadline) {
        return res.status(400).json({
          success: false,
          error: 'Esta campanha já expirou'
        });
      }

      // Criar doação no banco
      const donation = await database.getClient().donation.create({
        data: {
          amount: parseFloat(amount),
          donorId,
          campaignId,
          status: 'pending'
        },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              author: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      // Gerar QR Code para pagamento
      const paymentData = {
        donationId: donation.id,
        amount: parseFloat(amount),
        campaignTitle: campaign.title,
        donorName: `${req.user.firstName} ${req.user.lastName}`.trim()
      };

      const qrCodeData = await QRCode.toDataURL(JSON.stringify(paymentData));
      
      // Atualizar doação com QR Code
      const updatedDonation = await database.getClient().donation.update({
        where: { id: donation.id },
        data: { qrCode: qrCodeData },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              author: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        data: updatedDonation,
        message: 'Doação criada com sucesso. Use o QR Code para realizar o pagamento.'
      });
    } catch (error) {
      console.error('Error creating donation:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar doação'
      });
    }
  },

  // Obter doações do usuário
  async getMyDonations(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      const donorId = req.user.id;

      const [donations, total] = await Promise.all([
        database.getClient().donation.findMany({
          where: { donorId },
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
          where: { donorId }
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
      console.error('Error getting my donations:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar doações'
      });
    }
  },

  // Obter doações de uma campanha
  async getCampaignDonations(req, res) {
    try {
      const { campaignId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      // Verificar se a campanha existe
      const campaign = await database.getClient().campaign.findUnique({
        where: { id: campaignId }
      });

      if (!campaign) {
        return res.status(404).json({
          success: false,
          error: 'Campanha não encontrada'
        });
      }

      const [donations, total] = await Promise.all([
        database.getClient().donation.findMany({
          where: { 
            campaignId,
            status: 'completed' // Apenas doações confirmadas
          },
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
          skip: parseInt(skip),
          take: parseInt(limit)
        }),
        database.getClient().donation.count({
          where: { 
            campaignId,
            status: 'completed'
          }
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
      console.error('Error getting campaign donations:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar doações da campanha'
      });
    }
  },

  // Webhook para confirmação de pagamento (Mercado Pago)
  async handlePaymentWebhook(req, res) {
    try {
      const { type, data } = req.body;

      if (type === 'payment') {
        const paymentId = data.id;
        
        // Aqui você integraria com a API do Mercado Pago para verificar o status
        // Por enquanto, vamos simular uma confirmação
        const donation = await database.getClient().donation.findFirst({
          where: { paymentId }
        });

        if (donation) {
          await database.getClient().donation.update({
            where: { id: donation.id },
            data: { status: 'completed' }
          });

          // Atualizar valor arrecadado da campanha
          const totalRaised = await database.getClient().donation.aggregate({
            where: {
              campaignId: donation.campaignId,
              status: 'completed'
            },
            _sum: { amount: true }
          });

          await database.getClient().campaign.update({
            where: { id: donation.campaignId },
            data: { current: totalRaised._sum.amount || 0 }
          });
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error handling payment webhook:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao processar webhook de pagamento'
      });
    }
  }
};

module.exports = donationController;
