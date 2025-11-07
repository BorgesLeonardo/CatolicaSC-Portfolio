export interface Todo {
  id: number;
  content: string;
}

export interface Meta {
  totalCount: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  projectsCount?: number;
}

export interface ProjectImage {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  ownerId: string;
  owner?: {
    id: string;
    name?: string | null;
  };
  categoryId?: string;
  title: string;
  description?: string;
  goalCents: number;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  deadline: string;
  imageUrl?: string;           // Mantido para compatibilidade
  videoUrl?: string;           // URL de vídeo opcional
  images?: ProjectImage[];     // Novo sistema de imagens
  raisedCents?: number;        // Valor arrecadado em centavos
  supportersCount?: number;    // Número de apoiadores únicos
  // Assinaturas (recorrente)
  subscriptionEnabled?: boolean;
  subscriptionPriceCents?: number;
  subscriptionInterval?: 'MONTH' | 'YEAR';
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  category?: Category;
}

export interface ProjectResponse {
  items: Project[];
  totalCount?: number;
  total?: number;
}

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  author?: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  items: Comment[];
  total?: number;
}

export interface Contribution {
  id: string;
  projectId: string;
  contributorId: string;
  amountCents: number;
  status: 'pending' | 'completed' | 'failed';
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
}
