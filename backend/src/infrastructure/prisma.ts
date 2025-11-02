// Use default import to avoid named-export type checks when prisma types are not generated in CI
// This preserves runtime behavior and avoids build failures when postinstall scripts are skipped
// eslint-disable-next-line @typescript-eslint/no-var-requires
import pkg from '@prisma/client';

export const prisma = new (pkg as any).PrismaClient();



