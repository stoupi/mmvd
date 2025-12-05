import { prisma } from '../lib/prisma';

async function main() {
  const centreId = 'cmirhs17j0000z81hviluf84s'; // Frantz Fanon Hospital

  // Find proposals for this centre
  const proposals = await prisma.proposal.findMany({
    where: {
      centreId
    },
    select: {
      id: true,
      title: true,
      status: true,
      centreId: true
    }
  });

  console.log(`Found ${proposals.length} proposals for centre ${centreId}:`);
  console.table(proposals);

  // Delete them
  const result = await prisma.proposal.deleteMany({
    where: {
      centreId
    }
  });

  console.log(`\nDeleted ${result.count} proposals for centre ${centreId}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
