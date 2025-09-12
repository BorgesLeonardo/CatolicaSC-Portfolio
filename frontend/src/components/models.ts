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

export interface Project {
  id: string;
  ownerId: string;
  categoryId?: string;
  title: string;
  description?: string;
  goalCents: number;
  deadline: string;
  imageUrl?: string;
  raisedCents?: number;        // Valor arrecadado em centavos
  supportersCount?: number;    // Número de apoiadores únicos
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
