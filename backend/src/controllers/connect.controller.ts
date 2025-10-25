import { Request, Response, NextFunction } from 'express'
import { prisma } from '../infrastructure/prisma'
import { AppError } from '../utils/AppError'
import { stripe } from '../utils/stripeClient'

export class ConnectController {
  async onboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).authUserId as string

      const user = await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId }
      })

      let accountId = user.stripeAccountId || null

      // Validate existing account id against current Stripe key; recreate if missing
      if (accountId) {
        try {
          await stripe.accounts.retrieve(accountId)
        } catch (err: any) {
          const msg = String(err?.message || '')
          const code = (err as any)?.code
          const isMissing = msg.includes('No such account') || msg.includes('does not have access to account') || code === 'resource_missing' || code === 'account_invalid'
          if (isMissing) {
            accountId = null
            await prisma.user.update({ where: { id: userId }, data: { stripeAccountId: null } })
          } else {
            throw err
          }
        }
      }

      if (!accountId) {
        const account = await stripe.accounts.create({ type: 'express' })
        accountId = account.id
        await prisma.user.update({ where: { id: userId }, data: { stripeAccountId: accountId } })
      }

      const refreshUrl = process.env.CONNECT_REFRESH_URL || `${process.env.FRONTEND_ORIGIN || 'http://localhost:9000'}/connect/refresh`
      const returnUrl = process.env.CONNECT_RETURN_URL || `${process.env.FRONTEND_ORIGIN || 'http://localhost:9000'}/connect/return`

      const link = await stripe.accountLinks.create({
        account: accountId!,
        refresh_url: refreshUrl,
        return_url: returnUrl,
        type: 'account_onboarding',
      })

      return res.json({ url: link.url })
    } catch (error) {
      return next(error)
    }
  }

  async status(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).authUserId as string
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user?.stripeAccountId) {
        return res.json({ connected: false, chargesEnabled: false, payoutsEnabled: false })
      }
      try {
        const account = await stripe.accounts.retrieve(user.stripeAccountId)
        return res.json({
          connected: true,
          chargesEnabled: !!(account as any).charges_enabled,
          payoutsEnabled: !!(account as any).payouts_enabled,
          requirements: (account as any).requirements,
        })
      } catch (err: any) {
        const msg = String(err?.message || '')
        const code = (err as any)?.code
        const isMissing = msg.includes('No such account') || msg.includes('does not have access to account') || code === 'resource_missing' || code === 'account_invalid'
        if (isMissing) {
          await prisma.user.update({ where: { id: userId }, data: { stripeAccountId: null } })
          return res.json({ connected: false, chargesEnabled: false, payoutsEnabled: false, reason: 'missing_account' })
        }
        throw err
      }
    } catch (error) {
      return next(error)
    }
  }

  async dashboardLink(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).authUserId as string
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user?.stripeAccountId) throw new AppError('Connect account not found', 404)

      // Ensure account exists under current key
      try {
        await stripe.accounts.retrieve(user.stripeAccountId)
      } catch (err: any) {
        const msg = String(err?.message || '')
        const code = (err as any)?.code
        const isMissing = msg.includes('No such account') || msg.includes('does not have access to account') || code === 'resource_missing' || code === 'account_invalid'
        if (isMissing) {
          await prisma.user.update({ where: { id: userId }, data: { stripeAccountId: null } })
          throw new AppError('Connect account not found', 404)
        }
        throw err
      }

      const link = await stripe.accounts.createLoginLink(user.stripeAccountId)
      return res.json({ url: link.url })
    } catch (error) {
      return next(error)
    }
  }
}




