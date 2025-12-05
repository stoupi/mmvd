import { prisma } from '../lib/prisma';

async function main() {
  // List all proposals
  const proposals = await prisma.proposal.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      centreId: true,
      piUserId: true,
      submissionWindowId: true
    }
  });

  console.log('All proposals:');
  console.table(proposals);

  // List all centres
  const centres = await prisma.centre.findMany({
    select: {
      id: true,
      name: true
    }
  });

  console.log('\nAll centres:');
  console.table(centres);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
