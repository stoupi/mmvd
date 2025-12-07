import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function updateTopicCodes() {
  console.log('🔄 Starting topic code update...');

  try {
    const allTopics = await prisma.mainArea.findMany({
      orderBy: { code: 'asc' }
    });

    let successCount = 0;
    let skippedCount = 0;

    for (const topic of allTopics) {
      if (!topic.code) continue;

      const match = topic.code.match(/^([A-N])-(\d)$/);
      if (match) {
        const letter = match[1];
        const number = match[2];
        const newCode = `${letter}-0${number}`;

        await prisma.mainArea.update({
          where: { id: topic.id },
          data: { code: newCode }
        });

        console.log(`  ✓ Updated ${topic.code} → ${newCode}: ${topic.label}`);
        successCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`\n✅ Successfully updated ${successCount} topic codes`);
    console.log(`⏭️  Skipped ${skippedCount} topics (already formatted or 2+ digits)`);
  } catch (error) {
    console.error('❌ Error updating topic codes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

updateTopicCodes()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
