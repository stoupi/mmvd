import { prisma } from '@/lib/prisma';

async function main() {
  const email = 'pi_soumission@yopmail.com';

  const user = await prisma.user.findUnique({
    where: { email }
  });

  console.log('User:', JSON.stringify(user, null, 2));

  const invitations = await prisma.verification.findMany({
    where: {
      identifier: {
        startsWith: 'INVITE:'
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('\nAll invitations:', JSON.stringify(invitations, null, 2));

  const userInvitations = invitations.filter(inv => {
    try {
      const value = JSON.parse(inv.value);
      return value.email === email;
    } catch {
      return false;
    }
  });

  console.log(`\nInvitations for ${email}:`, JSON.stringify(userInvitations, null, 2));
}

main()
  .catch(console.error);
