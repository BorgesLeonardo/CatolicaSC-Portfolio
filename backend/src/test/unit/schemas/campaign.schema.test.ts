import { createCampaignSchema } from '../../../schemas/campaign'

describe('createCampaignSchema', () => {
  const base = {
    title: 'Título válido',
    description: 'Descrição com mais de vinte caracteres para ser válida.',
    fundingType: 'DIRECT' as const,
    goalCents: 10000,
    minContributionCents: 500,
    endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    categoryId: 'cat1',
    hasImage: true,
  }

  it('accepts a valid DIRECT campaign with image', () => {
    const res = createCampaignSchema.safeParse(base)
    expect(res.success).toBe(true)
  })

  it('rejects when endsAt before startsAt or too long', () => {
    const tooSoon = { ...base, endsAt: new Date(Date.now() - 1000) }
    expect(createCampaignSchema.safeParse(tooSoon).success).toBe(false)
  })

  it('requires media (image or video)', () => {
    const noMedia = { ...base, hasImage: false, hasVideo: false }
    expect(createCampaignSchema.safeParse(noMedia).success).toBe(false)
  })

  it('RECURRING requires subscription price and interval', () => {
    const recurring = {
      ...base,
      fundingType: 'RECURRING' as const,
      subscriptionEnabled: true,
      subscriptionPriceCents: 990,
      subscriptionInterval: 'MONTH' as const,
    }
    const ok = createCampaignSchema.safeParse(recurring)
    expect(ok.success).toBe(true)

    const missing = { ...recurring, subscriptionPriceCents: undefined }
    expect(createCampaignSchema.safeParse(missing).success).toBe(false)
  })
})


