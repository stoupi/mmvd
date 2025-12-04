import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

const colors = [
  '#3B82F6', // blue-500
  '#10B981', // green-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
];

async function main() {
  console.log('Updating main areas with colors...');

  const mainAreas = await prisma.mainArea.findMany({
    orderBy: { label: 'asc' }
  });

  for (let i = 0; i < mainAreas.length; i++) {
    const area = mainAreas[i];
    const color = colors[i % colors.length];

    await prisma.mainArea.update({
      where: { id: area.id },
      data: { color }
    });

    console.log(`Updated ${area.label} with color ${color}`);
  }

  console.log('\n✅ All main areas updated with colors!');
}

main()
  .catch((error) => {
    console.error('Error updating main areas:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
