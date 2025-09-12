/**
 * Valida se uma URL é de uma imagem válida
 * @param url - URL a ser validada
 * @returns true se a URL for válida para imagem, false caso contrário
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false
  
  // Verifica se é uma URL válida
  try {
    new URL(url)
  } catch {
    return false
  }
  
  const urlLower = url.toLowerCase()
  
  // Verifica se a URL termina com extensões de imagem comuns
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.avif', '.tiff']
  if (imageExtensions.some(ext => urlLower.includes(ext))) {
    return true
  }
  
  // Se é uma URL de serviços de imagem conhecidos, é válida
  const imageServices = [
    'imgur.com', 
    'cloudinary.com', 
    'unsplash.com', 
    'pexels.com', 
    'pixabay.com', 
    'images.google.com', 
    'googleusercontent.com',
    'picsum.photos',
    'via.placeholder.com',
    'placeholder.com',
    'dummyimage.com',
    'lorempixel.com',
    'i.imgur.com',
    'cdn.pixabay.com',
    'images.pexels.com',
    'images.unsplash.com',
    'shutterstock.com',
    'website-files.com',
    'cdn.prod.website-files.com'
  ]
  
  if (imageServices.some(service => urlLower.includes(service))) {
    return true
  }
  
  // Se contém parâmetros de imagem comuns, provavelmente é válida
  const imageKeywords = ['image', 'photo', 'picture', 'img', 'pic', 'thumbnail', 'avatar', 'preview']
  if (imageKeywords.some(keyword => urlLower.includes(keyword))) {
    return true
  }
  
  // Para desenvolvimento, aceita qualquer URL que pareça ser de imagem
  // (pode ser removido em produção para maior segurança)
  if (urlLower.includes('http') && (
    urlLower.includes('image') || 
    urlLower.includes('photo') || 
    urlLower.includes('pic') ||
    urlLower.includes('img') ||
    imageExtensions.some(ext => urlLower.includes(ext))
  )) {
    return true
  }
  
  return false
}

/**
 * Gera URLs de exemplo para ajudar o usuário
 */
export const getImageUrlExamples = (): string[] => [
  'https://picsum.photos/800/600',
  'https://via.placeholder.com/800x600',
  'https://images.unsplash.com/photo-exemplo',
  'https://i.imgur.com/exemplo.jpg'
]

/**
 * Valida e formata uma URL de imagem
 * @param url - URL a ser processada
 * @returns URL formatada ou null se inválida
 */
export function processImageUrl(url: string): string | null {
  if (!url) return null
  
  const trimmedUrl = url.trim()
  
  if (!isValidImageUrl(trimmedUrl)) {
    return null
  }
  
  return trimmedUrl
}
