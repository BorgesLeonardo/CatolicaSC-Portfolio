// Configuração da API
export const API_CONFIG = {
  // URL base da API: usa VITE_API_BASE_URL quando disponível; fallback para localhost em dev
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333',
    
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
