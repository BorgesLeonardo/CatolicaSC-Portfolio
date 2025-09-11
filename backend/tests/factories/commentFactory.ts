import { nanoid } from 'nanoid';

export interface CommentData {
  id: string;
  content: string;
  projectId: string;
  authorId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export function createComment(overrides: Partial<CommentData> = {}): CommentData {
  const now = new Date();
  const id = overrides.id || `comment_${nanoid(8)}`;
  
  return {
    id,
    content: overrides.content || `Test comment ${id}`,
    projectId: overrides.projectId || `proj_${nanoid(8)}`,
    authorId: overrides.authorId || `user_${nanoid(8)}`,
    parentId: overrides.parentId,
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    deletedAt: overrides.deletedAt,
    ...overrides,
  };
}

export function createReplyComment(parentId: string, overrides: Partial<CommentData> = {}): CommentData {
  return createComment({
    parentId,
    content: overrides.content || `Reply to comment ${parentId}`,
    ...overrides,
  });
}
