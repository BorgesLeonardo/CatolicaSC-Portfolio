import { nanoid } from 'nanoid';

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export function createUser(overrides: Partial<UserData> = {}): UserData {
  const now = new Date();
  const id = overrides.id || `user_${nanoid(8)}`;
  
  return {
    id,
    email: overrides.email || `user-${id}@test.com`,
    name: overrides.name || `Test User ${id}`,
    role: overrides.role || 'user',
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    ...overrides,
  };
}

export function createAdminUser(overrides: Partial<UserData> = {}): UserData {
  return createUser({
    role: 'admin',
    ...overrides,
  });
}
