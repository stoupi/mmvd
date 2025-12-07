import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import categoriesData from './data/categories.json';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CategoryData {
  code: string;
  label: string;
  description: string;
  order: number;
}

async function seedCategories() {
  console.log('🌱 Starting category seeding...');

  try {
    for (const categoryData of categoriesData as CategoryData[]) {
      const category = await prisma.category.upsert({
        where: { code: categoryData.code },
        update: {
          label: categoryData.label,
          description: categoryData.description,
          order: categoryData.order,
          isActive: true,
        },
        create: {
          code: categoryData.code,
          label: categoryData.label,
          description: categoryData.description,
          order: categoryData.order,
          isActive: true,
        },
      });

      console.log(`  ✓ Category ${category.code}: ${category.label}`);
    }

    console.log(`\n✅ Successfully seeded ${categoriesData.length} categories`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedCategories();
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
