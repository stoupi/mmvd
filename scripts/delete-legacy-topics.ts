import { prisma } from '../lib/prisma';

async function deleteLegacyTopics() {
  console.log('🗑️  Deleting LEGACY topics...\n');

  // Find all LEGACY topics
  const legacyTopics = await prisma.mainArea.findMany({
    where: {
      code: {
        startsWith: 'LEGACY'
      }
    },
    include: {
      reviewers: {
        select: {
          id: true,
          email: true,
          reviewTopics: {
            select: {
              id: true,
              code: true,
              label: true
            }
          }
        }
      }
    }
  });

  if (legacyTopics.length === 0) {
    console.log('✅ No LEGACY topics found');
    return;
  }

  console.log(`Found ${legacyTopics.length} LEGACY topics\n`);

  // Step 1: Remove LEGACY topics from reviewers
  console.log('📝 Step 1: Removing LEGACY topics from reviewers...\n');

  const legacyTopicIds = legacyTopics.map(t => t.id);
  let reviewersUpdated = 0;

  for (const topic of legacyTopics) {
    for (const reviewer of topic.reviewers) {
      // Get current review topics excluding LEGACY ones
      const newTopics = reviewer.reviewTopics
        .filter(t => !legacyTopicIds.includes(t.id))
        .map(t => ({ id: t.id }));

      await prisma.user.update({
        where: { id: reviewer.id },
        data: {
          reviewTopics: {
            set: newTopics
          }
        }
      });

      console.log(`  ✓ Removed LEGACY topics from ${reviewer.email}`);
      console.log(`    Topics before: ${reviewer.reviewTopics.map(t => t.code).join(', ')}`);
      console.log(`    Topics after: ${newTopics.length === 0 ? 'none' : 'kept non-LEGACY topics'}`);
      reviewersUpdated++;
    }
  }

  console.log(`\n✅ Updated ${reviewersUpdated} reviewers\n`);

  // Step 2: Verify no proposals are using LEGACY topics
  console.log('📝 Step 2: Verifying no proposals use LEGACY topics...\n');

  for (const topic of legacyTopics) {
    const proposalsAsMain = await prisma.proposal.count({
      where: {
        mainAreaId: topic.id,
        isDeleted: false
      }
    });

    const proposalsAsSecondary = await prisma.proposal.count({
      where: {
        secondaryTopics: {
          has: topic.id
        },
        isDeleted: false
      }
    });

    if (proposalsAsMain > 0 || proposalsAsSecondary > 0) {
      console.error(`❌ ERROR: ${topic.code} still used in ${proposalsAsMain + proposalsAsSecondary} proposals`);
      console.error('   Cannot delete. Please migrate proposals first.');
      return;
    }
  }

  console.log('✅ No proposals are using LEGACY topics\n');

  // Step 3: Delete LEGACY topics
  console.log('📝 Step 3: Deleting LEGACY topics...\n');

  for (const topic of legacyTopics) {
    await prisma.mainArea.delete({
      where: { id: topic.id }
    });
    console.log(`  ✓ Deleted ${topic.code} - ${topic.label}`);
  }

  console.log(`\n✅ Successfully deleted ${legacyTopics.length} LEGACY topics`);
}

deleteLegacyTopics()
  .then(() => {
    console.log('\n✅ Cleanup complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
