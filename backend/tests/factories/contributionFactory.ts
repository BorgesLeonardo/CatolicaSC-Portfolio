import { nanoid } from 'nanoid';

export interface ContributionData {
  id: string;
  amountCents: number;
  projectId: string;
  contributorId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createContribution(overrides: Partial<ContributionData> = {}): ContributionData {
  const now = new Date();
  const id = overrides.id || `contrib_${nanoid(8)}`;
  
  return {
    id,
    amountCents: overrides.amountCents || 5000, // R$ 50,00
    projectId: overrides.projectId || `proj_${nanoid(8)}`,
    contributorId: overrides.contributorId || `user_${nanoid(8)}`,
    status: overrides.status || 'pending',
    stripeSessionId: overrides.stripeSessionId || `cs_test_${nanoid(8)}`,
    stripePaymentIntentId: overrides.stripePaymentIntentId || `pi_test_${nanoid(8)}`,
    createdAt: overrides.createdAt || now,
    updatedAt: overrides.updatedAt || now,
    ...overrides,
  };
}

export function createCompletedContribution(overrides: Partial<ContributionData> = {}): ContributionData {
  return createContribution({
    status: 'completed',
    ...overrides,
  });
}

export function createPendingContribution(overrides: Partial<ContributionData> = {}): ContributionData {
  return createContribution({
    status: 'pending',
    ...overrides,
  });
}

export function createFailedContribution(overrides: Partial<ContributionData> = {}): ContributionData {
  return createContribution({
    status: 'failed',
    ...overrides,
  });
}
