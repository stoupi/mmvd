import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import topicsData from './data/topics.json';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface TopicData {
  code: string;
  categoryCode: string;
  label: string;
  order: number;
}

async function seedTopics() {
  console.log('🌱 Starting topic seeding...');

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const topicData of topicsData as TopicData[]) {
      try {
        const category = await prisma.category.findUnique({
          where: { code: topicData.categoryCode },
        });

        if (!category) {
          console.error(`  ❌ Category ${topicData.categoryCode} not found for topic ${topicData.code}`);
          errorCount++;
          continue;
        }

        const topic = await prisma.mainArea.upsert({
          where: { code: topicData.code },
          update: {
            label: topicData.label,
            categoryId: category.id,
            order: topicData.order,
            isActive: true,
          },
          create: {
            code: topicData.code,
            label: topicData.label,
            categoryId: category.id,
            order: topicData.order,
            isActive: true,
          },
        });

        console.log(`  ✓ Topic ${topic.code}: ${topic.label.substring(0, 60)}...`);
        successCount++;
      } catch (error) {
        console.error(`  ❌ Error seeding topic ${topicData.code}:`, error);
        errorCount++;
      }
    }

    console.log(`\n✅ Successfully seeded ${successCount} topics`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} topics failed to seed`);
    }
  } catch (error) {
    console.error('❌ Error seeding topics:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedTopics();
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
