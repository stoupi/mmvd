import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding test data...');

  // Create main areas
  const imagingArea = await prisma.mainArea.upsert({
    where: { label: 'Imaging Techniques' },
    update: {},
    create: {
      label: 'Imaging Techniques',
      description: 'Advanced imaging methods and techniques',
      isActive: true
    }
  });

  const clinicalArea = await prisma.mainArea.upsert({
    where: { label: 'Clinical Outcomes' },
    update: {},
    create: {
      label: 'Clinical Outcomes',
      description: 'Patient outcomes and clinical research',
      isActive: true
    }
  });

  const biomarkersArea = await prisma.mainArea.upsert({
    where: { label: 'Biomarkers' },
    update: {},
    create: {
      label: 'Biomarkers',
      description: 'Biomarker studies and analysis',
      isActive: true
    }
  });

  console.log('Created main areas:', { imagingArea, clinicalArea, biomarkersArea });

  // Create submission window
  const now = new Date();
  const submissionOpen = new Date(now.getFullYear(), now.getMonth(), 1);
  const submissionClose = new Date(now.getFullYear(), now.getMonth() + 3, 0);
  const reviewStart = new Date(now.getFullYear(), now.getMonth() + 3, 1);
  const reviewDeadline = new Date(now.getFullYear(), now.getMonth() + 5, 0);
  const responseDeadline = new Date(now.getFullYear(), now.getMonth() + 6, 0);

  const window = await prisma.submissionWindow.upsert({
    where: { name: 'Test Window 2025' },
    update: {},
    create: {
      name: 'Test Window 2025',
      submissionOpenAt: submissionOpen,
      submissionCloseAt: submissionClose,
      reviewStartAt: reviewStart,
      reviewDeadlineDefault: reviewDeadline,
      responseDeadline: responseDeadline,
      status: 'OPEN'
    }
  });

  console.log('Created submission window:', window);

  console.log('Test data seeding completed!');
}

main()
  .catch((error) => {
    console.error('Error seeding test data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
