import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Mapping des anciens topics LEGACY vers les nouveaux codes
const LEGACY_TO_NEW_MAPPING: Record<string, string> = {
  'LEGACY-1': 'A-08', // Aortic Stenosis
  'LEGACY-2': 'A-11', // Mitral Regurgitation (primary)
  'LEGACY-3': 'A-07', // Multiple valve disease
  'LEGACY-4': 'D-01', // TTE (Transthoracic echocardiography)
  'LEGACY-5': 'K-01', // All-cause mortality (Clinical Outcomes)
};

async function migrateLegacyTopics() {
  console.log('🔄 Starting legacy topics migration...\n');

  try {
    // 1. Get all LEGACY topics
    const legacyTopics = await prisma.mainArea.findMany({
      where: {
        code: {
          startsWith: 'LEGACY'
        }
      }
    });

    console.log(`Found ${legacyTopics.length} legacy topics to migrate\n`);

    // 2. For each legacy topic, find the new topic and update proposals
    for (const legacyTopic of legacyTopics) {
      const newCode = LEGACY_TO_NEW_MAPPING[legacyTopic.code || ''];

      if (!newCode) {
        console.log(`⚠️  No mapping found for ${legacyTopic.code}, skipping...`);
        continue;
      }

      // Find the new topic
      const newTopic = await prisma.mainArea.findUnique({
        where: { code: newCode }
      });

      if (!newTopic) {
        console.log(`❌ New topic ${newCode} not found, skipping...`);
        continue;
      }

      console.log(`Migrating ${legacyTopic.code} → ${newCode} (${newTopic.label})`);

      // Update proposals that use this legacy topic as main area
      const proposalsWithMainArea = await prisma.proposal.updateMany({
        where: {
          mainAreaId: legacyTopic.id
        },
        data: {
          mainAreaId: newTopic.id
        }
      });

      console.log(`  ✓ Updated ${proposalsWithMainArea.count} proposals (main area)`);

      // Update proposals that have this legacy topic in secondary topics
      const proposalsWithSecondary = await prisma.proposal.findMany({
        where: {
          secondaryTopics: {
            has: legacyTopic.id
          }
        }
      });

      for (const proposal of proposalsWithSecondary) {
        const updatedSecondaryTopics = proposal.secondaryTopics.map(topicId =>
          topicId === legacyTopic.id ? newTopic.id : topicId
        );

        await prisma.proposal.update({
          where: { id: proposal.id },
          data: { secondaryTopics: updatedSecondaryTopics }
        });
      }

      console.log(`  ✓ Updated ${proposalsWithSecondary.length} proposals (secondary topics)`);

      // Mark legacy topic as inactive
      await prisma.mainArea.update({
        where: { id: legacyTopic.id },
        data: { isActive: false }
      });

      console.log(`  ✓ Marked legacy topic as inactive\n`);
    }

    // 3. Show final summary
    const activeLegacyCount = await prisma.mainArea.count({
      where: {
        code: { startsWith: 'LEGACY' },
        isActive: true
      }
    });

    console.log('\n✅ Migration complete!');
    console.log(`Active legacy topics remaining: ${activeLegacyCount}`);

  } catch (error) {
    console.error('❌ Error migrating legacy topics:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

migrateLegacyTopics()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
