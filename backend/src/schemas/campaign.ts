import { z } from 'zod';

// Create campaign schema (server-side source of truth)
export const createCampaignSchema = z.object({
  title: z.string().trim().min(5, 'Título deve ter pelo menos 5 caracteres').max(120, 'Título deve ter no máximo 120 caracteres'),
  description: z.string().trim().min(20, 'Descrição deve ter pelo menos 20 caracteres').max(5000, 'Descrição deve ter no máximo 5000 caracteres'),
  // Tipo de financiamento: Direto (doações únicas) ou Recorrente (assinaturas)
  fundingType: z.enum(['DIRECT', 'RECURRING'], { required_error: 'Selecione o tipo de captação' }),
  // Meta (apenas para campanhas de pagamento direto)
  goalCents: z.number().int('Meta deve ser um inteiro em centavos').optional(),
  minContributionCents: z.number().int('Mínimo deve ser um inteiro em centavos').refine(v => v >= 500 && v <= 100_000_000, 'Contribuição mínima deve estar entre R$ 5,00 e R$ 1.000.000,00').optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date({ required_error: 'Data de término é obrigatória' }),
  categoryId: z.string().trim().min(1, 'Categoria deve ser selecionada'),
  hasImage: z.boolean().optional(),
  hasVideo: z.boolean().optional(),
  // Assinaturas
  subscriptionEnabled: z.boolean().optional(),
  subscriptionPriceCents: z.number().int('Preço da assinatura deve ser inteiro em centavos').optional(),
  subscriptionInterval: z.enum(['MONTH', 'YEAR']).optional(),
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

  // Regra de mídia: imagem OU vídeo deve ser informado
  const hasVideo = Boolean((data as any).hasVideo);
  const hasImg = Boolean((data as any).hasImage);
  if (!hasVideo && !hasImg) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Envie uma imagem ou um vídeo', path: ['hasVideo'] });
  }

  // Valida metas por tipo
  if (data.fundingType === 'DIRECT') {
    if (typeof data.goalCents !== 'number' || !(data.goalCents >= 1_000 && data.goalCents <= 100_000_000)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Meta deve estar entre R$ 10,00 e R$ 1.000.000,00', path: ['goalCents'] });
    }
    // Em campanhas diretas, assinatura deve estar desativada
    if ((data as any).subscriptionEnabled) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Assinatura não é permitida para campanhas de pagamento direto', path: ['subscriptionEnabled'] });
    }
  }

  // Regras de assinatura (apenas para campanhas recorrentes)
  const subEnabled = data.fundingType === 'RECURRING' ? true : Boolean((data as any).subscriptionEnabled);
  const subPrice = (data as any).subscriptionPriceCents as number | undefined;
  const subInterval = (data as any).subscriptionInterval as 'MONTH' | 'YEAR' | undefined;
  if (data.fundingType === 'RECURRING') {
    // Força ativação e preenchimento
    if (typeof subPrice !== 'number') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o preço da assinatura', path: ['subscriptionPriceCents'] });
    } else if (!(subPrice >= 500 && subPrice <= 100_000_000)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Assinatura deve estar entre R$ 5,00 e R$ 1.000.000,00', path: ['subscriptionPriceCents'] });
    }
    if (!subInterval) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o intervalo da assinatura', path: ['subscriptionInterval'] });
    }
  } else if (subEnabled) {
    if (typeof subPrice !== 'number') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o preço da assinatura', path: ['subscriptionPriceCents'] });
    } else if (!(subPrice >= 500 && subPrice <= 100_000_000)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Assinatura deve estar entre R$ 5,00 e R$ 1.000.000,00', path: ['subscriptionPriceCents'] });
    }
    if (!subInterval) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Informe o intervalo da assinatura', path: ['subscriptionInterval'] });
    }
  } else {
    // If disabled, ignore provided price/interval but allow
  }
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;


