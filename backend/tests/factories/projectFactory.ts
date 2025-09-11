import { nanoid } from 'nanoid';

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  goalCents: number;
  deadline: Date;
  ownerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export function createProject(overrides: Partial<ProjectData> = {}): ProjectData {
  const now = new Date();
  const id = overrides.id || `proj_${nanoid(8)}`;
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 3); // 3 meses no futuro
  
  return {
    id,
    title: overrides.title || `Test Project ${id}`,
    description: overrides.description || `Description for test project ${id}`,
    goalCents: overrides.goalCents || 100000, // R$ 1.000,00
    deadline: overrides.deadline || futureDate,
    ownerId: overrides.ownerId || `user_${nanoid(8)}`,
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    deletedAt: overrides.deletedAt,
    ...overrides,
  };
}

export function createActiveProject(overrides: Partial<ProjectData> = {}): ProjectData {
  return createProject({
    isActive: true,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias no futuro
    ...overrides,
  });
}

export function createInactiveProject(overrides: Partial<ProjectData> = {}): ProjectData {
  return createProject({
    isActive: false,
    deadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    ...overrides,
  });
}

export function createExpiredProject(overrides: Partial<ProjectData> = {}): ProjectData {
  return createProject({
    isActive: true,
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
    ...overrides,
  });
}
