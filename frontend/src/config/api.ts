// Configuração da API
export const API_CONFIG = {
  // URL base da API - em desenvolvimento usa localhost:3333, em produção usa a URL do backend
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-domain.com' 
    : 'http://localhost:3333',
    
  // Endpoints
  ENDPOINTS: {
    PROJECTS: '/api/projects',
    UPLOADS: '/uploads'
  }
}

// Helper para construir URLs de imagens
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return ''
  
  // Se já é uma URL completa, retorna como está
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // Constrói URL completa com o backend
  return `${API_CONFIG.BASE_URL}${imagePath}`
}
