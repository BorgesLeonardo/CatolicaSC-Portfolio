const { verifyToken } = require('@clerk/backend');
const database = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso não fornecido'
      });
    }

    // Verificar token com Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    if (!payload) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    // Buscar ou criar usuário no banco local
    let user = await database.getClient().user.findUnique({
      where: { clerkId: payload.sub }
    });

    if (!user) {
      // Criar usuário se não existir
      user = await database.getClient().user.create({
        data: {
          clerkId: payload.sub,
          email: payload.email,
          firstName: payload.given_name || null,
          lastName: payload.family_name || null,
          imageUrl: payload.picture || null
        }
      });
    }

    // Adicionar usuário ao request
    req.user = user;
    req.clerkPayload = payload;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      req.user = null;
      return next();
    }

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    if (payload) {
      let user = await database.getClient().user.findUnique({
        where: { clerkId: payload.sub }
      });

      if (!user) {
        user = await database.getClient().user.create({
          data: {
            clerkId: payload.sub,
            email: payload.email,
            firstName: payload.given_name || null,
            lastName: payload.family_name || null,
            imageUrl: payload.picture || null
          }
        });
      }

      req.user = user;
      req.clerkPayload = payload;
    }
    
    next();
  } catch (error) {
    // Se houver erro, continua sem autenticação
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuth
};
