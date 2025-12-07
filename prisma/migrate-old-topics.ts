import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migrateOldTopics() {
  console.log('🔄 Starting migration of legacy topics...');

  try {
    console.log('\n1️⃣  Creating LEGACY category...');
    const legacyCategory = await prisma.category.upsert({
      where: { code: 'LEGACY' },
      update: {
        label: 'Legacy Topics (Deprecated)',
        description: 'Original 5 topics - kept for backward compatibility',
        order: 99,
        isActive: false,
      },
      create: {
        code: 'LEGACY',
        label: 'Legacy Topics (Deprecated)',
        description: 'Original 5 topics - kept for backward compatibility',
        order: 99,
        isActive: false,
      },
    });
    console.log(`  ✓ Created LEGACY category: ${legacyCategory.id}`);

    console.log('\n2️⃣  Finding existing topics without category...');
    const oldTopics = await prisma.mainArea.findMany({
      where: {
        categoryId: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    console.log(`  ✓ Found ${oldTopics.length} legacy topics`);

    if (oldTopics.length === 0) {
      console.log('  ℹ️  No legacy topics to migrate');
      return;
    }

    console.log('\n3️⃣  Migrating topics to LEGACY category...');
    for (let index = 0; index < oldTopics.length; index++) {
      const oldTopic = oldTopics[index];
      const legacyCode = `LEGACY-${index + 1}`;

      const updated = await prisma.mainArea.update({
        where: { id: oldTopic.id },
        data: {
          code: legacyCode,
          categoryId: legacyCategory.id,
          order: index + 1,
          isActive: false,
        },
      });

      console.log(`  ✓ ${legacyCode}: ${updated.label}`);
    }

    console.log('\n4️⃣  Verifying existing proposals still linked...');
    const proposalCount = await prisma.proposal.count({
      where: {
        mainAreaId: {
          in: oldTopics.map(topic => topic.id),
        },
      },
    });

    console.log(`  ✓ ${proposalCount} existing proposals remain linked to legacy topics`);

    console.log('\n✅ Migration completed successfully!');
    console.log(`   - ${oldTopics.length} legacy topics migrated`);
    console.log(`   - ${proposalCount} existing proposals preserved`);
    console.log(`   - Legacy topics are now inactive (not selectable for new proposals)`);
  } catch (error) {
    console.error('❌ Error migrating legacy topics:', error);
    throw error;
  }
}

async function main() {
  try {
    await migrateOldTopics();
  } catch (error) {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
