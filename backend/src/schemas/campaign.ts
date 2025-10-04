import { z } from 'zod';

// Create campaign schema (server-side source of truth)
export const createCampaignSchema = z.object({
  title: z.string().trim().min(5, 'Título deve ter pelo menos 5 caracteres').max(120, 'Título deve ter no máximo 120 caracteres'),
  description: z.string().trim().min(20, 'Descrição deve ter pelo menos 20 caracteres').max(5000, 'Descrição deve ter no máximo 5000 caracteres'),
  goalCents: z.number().int('Meta deve ser um inteiro em centavos').refine(v => v >= 1_000 && v <= 100_000_000, 'Meta deve estar entre R$ 10,00 e R$ 1.000.000,00'),
  minContributionCents: z.number().int('Mínimo deve ser um inteiro em centavos').refine(v => v >= 500 && v <= 100_000_000, 'Contribuição mínima deve estar entre R$ 5,00 e R$ 1.000.000,00').optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date({ required_error: 'Data de término é obrigatória' }),
  categoryId: z.string().trim().min(1, 'Categoria deve ser selecionada'),
}).superRefine((data, ctx) => {
  const now = new Date();
  const startsAt = data.startsAt ?? now;
  if (startsAt < now) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Início deve ser no futuro', path: ['startsAt'] });
  }
  if (!(data.endsAt instanceof Date)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Data de término inválida', path: ['endsAt'] });
    return;
  }
  if (data.endsAt <= startsAt) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Término deve ser após o início', path: ['endsAt'] });
  }
  const maxEnd = new Date(startsAt.getTime() + 365 * 24 * 60 * 60 * 1000);
  if (data.endsAt > maxEnd) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Duração máxima é de 365 dias', path: ['endsAt'] });
  }
  if (typeof data.minContributionCents === 'number' && data.minContributionCents > data.goalCents) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Contribuição mínima deve ser menor ou igual à meta', path: ['minContributionCents'] });
  }
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;


