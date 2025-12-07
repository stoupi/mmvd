import { prisma } from '../lib/prisma';

async function checkLegacyTopics() {
  console.log('🔍 Checking LEGACY topics status...\n');

  // Find all LEGACY topics
  const legacyTopics = await prisma.mainArea.findMany({
    where: {
      code: {
        startsWith: 'LEGACY'
      }
    },
    include: {
      proposals: {
        where: {
          isDeleted: false
        },
        select: {
          id: true,
          title: true,
          status: true
        }
      },
      reviewers: {
        select: {
          id: true,
          email: true
        }
      }
    }
  });

  if (legacyTopics.length === 0) {
    console.log('✅ No LEGACY topics found in database');
    return;
  }

  console.log(`Found ${legacyTopics.length} LEGACY topics:\n`);

  for (const topic of legacyTopics) {
    console.log(`📋 ${topic.code} - ${topic.label}`);
    console.log(`   Active: ${topic.isActive}`);
    console.log(`   Proposals using it as main area: ${topic.proposals.length}`);
    console.log(`   Reviewers assigned: ${topic.reviewers.length}`);

    if (topic.proposals.length > 0) {
      console.log('   ⚠️  WARNING: Still has proposals!');
      topic.proposals.forEach(proposal => {
        console.log(`      - ${proposal.title} (${proposal.status})`);
      });
    }

    if (topic.reviewers.length > 0) {
      console.log('   ⚠️  WARNING: Still has reviewers!');
      topic.reviewers.forEach(reviewer => {
        console.log(`      - ${reviewer.email}`);
      });
    }

    // Check if used in secondary topics
    const proposalsWithSecondary = await prisma.proposal.findMany({
      where: {
        secondaryTopics: {
          has: topic.id
        },
        isDeleted: false
      },
      select: {
        id: true,
        title: true,
        status: true
      }
    });

    if (proposalsWithSecondary.length > 0) {
      console.log(`   ⚠️  WARNING: Used in ${proposalsWithSecondary.length} proposals as secondary topic!`);
      proposalsWithSecondary.forEach(proposal => {
        console.log(`      - ${proposal.title} (${proposal.status})`);
      });
    }

    console.log('');
  }

  const canDelete = legacyTopics.every(
    topic => topic.proposals.length === 0 && topic.reviewers.length === 0
  );

  // Check secondary topics
  let hasSecondaryReferences = false;
  for (const topic of legacyTopics) {
    const count = await prisma.proposal.count({
      where: {
        secondaryTopics: {
          has: topic.id
        },
        isDeleted: false
      }
    });
    if (count > 0) {
      hasSecondaryReferences = true;
      break;
    }
  }

  if (canDelete && !hasSecondaryReferences) {
    console.log('✅ All LEGACY topics can be safely deleted');
  } else {
    console.log('❌ Cannot delete LEGACY topics - they are still referenced');
  }
}

checkLegacyTopics()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
