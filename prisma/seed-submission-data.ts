import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding submission data...');

  // Create main areas (topics)
  const mainAreas = await Promise.all([
    prisma.mainArea.upsert({
      where: { label: 'Cardiac Imaging' },
      update: {},
      create: {
        label: 'Cardiac Imaging',
        description: 'Advanced cardiac imaging techniques and modalities',
        isActive: true
      }
    }),
    prisma.mainArea.upsert({
      where: { label: 'Valvular Heart Disease' },
      update: {},
      create: {
        label: 'Valvular Heart Disease',
        description: 'Assessment and management of valvular conditions',
        isActive: true
      }
    }),
    prisma.mainArea.upsert({
      where: { label: 'Heart Failure' },
      update: {},
      create: {
        label: 'Heart Failure',
        description: 'Heart failure diagnosis, treatment, and outcomes',
        isActive: true
      }
    }),
    prisma.mainArea.upsert({
      where: { label: 'Clinical Outcomes' },
      update: {},
      create: {
        label: 'Clinical Outcomes',
        description: 'Patient outcomes and long-term follow-up studies',
        isActive: true
      }
    }),
    prisma.mainArea.upsert({
      where: { label: 'Machine Learning' },
      update: {},
      create: {
        label: 'Machine Learning',
        description: 'AI and machine learning applications in cardiac imaging',
        isActive: true
      }
    })
  ]);

  console.log(`✅ Created ${mainAreas.length} main areas`);

  // Create an open submission window
  const now = new Date();
  const submissionOpenAt = new Date(now);
  submissionOpenAt.setDate(now.getDate() - 7); // Started 7 days ago

  const submissionCloseAt = new Date(now);
  submissionCloseAt.setDate(now.getDate() + 30); // Closes in 30 days

  const reviewStartAt = new Date(submissionCloseAt);
  reviewStartAt.setDate(submissionCloseAt.getDate() + 1); // Review starts day after submission closes

  const reviewDeadlineDefault = new Date(reviewStartAt);
  reviewDeadlineDefault.setDate(reviewStartAt.getDate() + 21); // 3 weeks for reviews

  const responseDeadline = new Date(reviewDeadlineDefault);
  responseDeadline.setDate(reviewDeadlineDefault.getDate() + 14); // 2 weeks for responses

  const nextWindowOpensAt = new Date(responseDeadline);
  nextWindowOpensAt.setDate(responseDeadline.getDate() + 30); // Next window 30 days later

  const window = await prisma.submissionWindow.upsert({
    where: { name: 'Q1 2025 Submission' },
    update: {
      submissionOpenAt,
      submissionCloseAt,
      reviewStartAt,
      reviewDeadlineDefault,
      responseDeadline,
      nextWindowOpensAt,
      status: 'OPEN'
    },
    create: {
      name: 'Q1 2025 Submission',
      submissionOpenAt,
      submissionCloseAt,
      reviewStartAt,
      reviewDeadlineDefault,
      responseDeadline,
      nextWindowOpensAt,
      status: 'OPEN'
    }
  });

  console.log(`✅ Created submission window: ${window.name}`);
  console.log(`   Opens: ${window.submissionOpenAt.toLocaleDateString()}`);
  console.log(`   Closes: ${window.submissionCloseAt.toLocaleDateString()}`);
  console.log(`   Status: ${window.status}`);

  console.log('\n✨ Submission data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
