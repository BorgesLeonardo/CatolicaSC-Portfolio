import 'dotenv/config'
import { clerkClient } from '@clerk/express'
import { prisma } from '../src/infrastructure/prisma'

async function main() {
  const hasSecret = Boolean(process.env.CLERK_SECRET_KEY)
  if (!hasSecret) {
    console.error('CLERK_SECRET_KEY is missing. Set it before running this script.')
    process.exit(1)
  }

  const users = await prisma.user.findMany({ where: { OR: [{ email: null }, { name: null }] } })
  console.log(`Found ${users.length} users with missing profile fields`)

  let updated = 0
  for (const u of users) {
    try {
      const c = await clerkClient.users.getUser(u.id)
      const fullName = (c.fullName || [c.firstName, c.lastName].filter(Boolean).join(' ')).trim()
      const name = fullName || null
      const email = (c.emailAddresses && c.emailAddresses[0]?.emailAddress) || null

      if (name || email) {
        await prisma.user.update({
          where: { id: u.id },
          data: {
            ...(name ? { name } : {}),
            ...(email ? { email } : {}),
          },
        })
        updated++
        console.log(`Updated ${u.id} -> name: ${name ?? 'unchanged'}, email: ${email ?? 'unchanged'}`)
      }
    } catch (err) {
      console.warn(`Failed to sync user ${u.id}:`, (err as any)?.message || err)
    }
  }

  console.log(`Done. Updated ${updated} users.`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })


