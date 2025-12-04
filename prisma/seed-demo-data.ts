import { PrismaClient } from '../app/generated/prisma';
import { createId } from '@paralleldrive/cuid2';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...');

  const hashedPassword = await hash('password', 10);

  // Get some centres from different countries
  const centres = await prisma.centre.findMany({
    take: 10,
    orderBy: { code: 'asc' }
  });

  if (centres.length === 0) {
    console.error('No centres found. Please run seed-centres.ts first.');
    process.exit(1);
  }

  console.log(`Found ${centres.length} centres`);

  // Create users from different centres
  const userEmails = [
    { email: 'pi.france@mmvd.com', firstName: 'Jean', lastName: 'Dupont', centreIndex: 0 },
    { email: 'pi.belgium@mmvd.com', firstName: 'Marie', lastName: 'Martin', centreIndex: 1 },
    { email: 'pi.germany@mmvd.com', firstName: 'Hans', lastName: 'Schmidt', centreIndex: 2 },
    { email: 'pi.italy@mmvd.com', firstName: 'Marco', lastName: 'Rossi', centreIndex: 3 },
    { email: 'pi.spain@mmvd.com', firstName: 'Carlos', lastName: 'Garcia', centreIndex: 4 },
    { email: 'pi.uk@mmvd.com', firstName: 'John', lastName: 'Smith', centreIndex: 5 },
  ];

  const users = [];
  for (const userInfo of userEmails) {
    const centre = centres[userInfo.centreIndex] || centres[0];

    let user = await prisma.user.findUnique({
      where: { email: userInfo.email }
    });

    if (!user) {
      const userId = createId();
      user = await prisma.user.create({
        data: {
          id: userId,
          email: userInfo.email,
          emailVerified: true,
          name: `${userInfo.firstName} ${userInfo.lastName}`,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          title: 'Dr',
          centreId: centre.id,
          affiliation: centre.name,
          permissions: ['SUBMISSION'],
          isActive: true
        }
      });

      await prisma.account.create({
        data: {
          id: createId(),
          userId: userId,
          accountId: userId,
          providerId: 'credential',
          password: hashedPassword
        }
      });
      console.log(`Created user: ${userInfo.email} (${centre.code} - ${centre.name})`);
    } else {
      console.log(`User already exists: ${userInfo.email}`);
    }

    users.push(user);
  }

  // Create main areas
  const mainAreasData = [
    { label: 'Aortic Stenosis', description: 'Studies related to aortic stenosis' },
    { label: 'Mitral Regurgitation', description: 'Studies related to mitral regurgitation' },
    { label: 'Multiple Valve Disease', description: 'Studies involving multiple valve diseases' },
    { label: 'Imaging Techniques', description: 'Advanced cardiac imaging studies' },
    { label: 'Clinical Outcomes', description: 'Long-term clinical outcomes research' }
  ];

  const mainAreas = [];
  for (const areaData of mainAreasData) {
    let area = await prisma.mainArea.findFirst({
      where: { label: areaData.label }
    });

    if (!area) {
      area = await prisma.mainArea.create({
        data: {
          id: createId(),
          ...areaData,
          isActive: true
        }
      });
      console.log(`Created main area: ${areaData.label}`);
    }

    mainAreas.push(area);
  }

  // Create submission windows
  const now = new Date();

  // Window 1: Closed (2023)
  let window1 = await prisma.submissionWindow.findFirst({
    where: { name: 'Call 2023-1' }
  });

  if (!window1) {
    window1 = await prisma.submissionWindow.create({
      data: {
        id: createId(),
        name: 'Call 2023-1',
        submissionOpenAt: new Date('2023-01-15'),
        submissionCloseAt: new Date('2023-03-31'),
        reviewStartAt: new Date('2023-04-01'),
        reviewDeadlineDefault: new Date('2023-05-15'),
        responseDeadline: new Date('2023-06-30'),
        nextWindowOpensAt: new Date('2023-09-01'),
        status: 'CLOSED'
      }
    });
    console.log('Created window: Call 2023-1');
  }

  // Window 2: Closed (2024)
  let window2 = await prisma.submissionWindow.findFirst({
    where: { name: 'Call 2024-1' }
  });

  if (!window2) {
    window2 = await prisma.submissionWindow.create({
      data: {
        id: createId(),
        name: 'Call 2024-1',
        submissionOpenAt: new Date('2024-01-15'),
        submissionCloseAt: new Date('2024-03-31'),
        reviewStartAt: new Date('2024-04-01'),
        reviewDeadlineDefault: new Date('2024-05-15'),
        responseDeadline: new Date('2024-06-30'),
        nextWindowOpensAt: new Date('2024-09-01'),
        status: 'CLOSED'
      }
    });
    console.log('Created window: Call 2024-1');
  }

  // Window 3: Currently Open
  let window3 = await prisma.submissionWindow.findFirst({
    where: { name: 'Call 2025-1' }
  });

  if (!window3) {
    window3 = await prisma.submissionWindow.create({
      data: {
        id: createId(),
        name: 'Call 2025-1',
        submissionOpenAt: new Date('2024-12-01'),
        submissionCloseAt: new Date('2025-03-31'),
        reviewStartAt: new Date('2025-04-01'),
        reviewDeadlineDefault: new Date('2025-05-15'),
        responseDeadline: new Date('2025-06-30'),
        nextWindowOpensAt: new Date('2025-09-01'),
        status: 'OPEN'
      }
    });
    console.log('Created window: Call 2025-1 (OPEN)');
  }

  // Create proposals for closed windows
  const proposalsData = [
    {
      windowId: window1.id,
      userIndex: 0,
      mainAreaIndex: 0,
      title: 'Impact of Frailty on Outcomes After Transcatheter Aortic Valve Replacement',
      scientificBackground: 'Frailty is increasingly recognized as an important factor affecting outcomes in elderly patients undergoing TAVR. However, its precise impact on long-term mortality and quality of life remains to be fully characterized across diverse populations.',
      literaturePosition: 'While several single-center studies have examined frailty in TAVR patients, there is a lack of multicenter data with standardized frailty assessment tools.',
      primaryObjective: 'To evaluate the association between frailty status and 2-year mortality following TAVR',
      mainExposure: 'Frailty status assessed by the Essential Frailty Toolset',
      primaryEndpoint: 'All-cause mortality at 2 years',
      studyPopulation: 'Patients aged 65 years or older undergoing TAVR for severe aortic stenosis',
      status: 'SUBMITTED'
    },
    {
      windowId: window1.id,
      userIndex: 1,
      mainAreaIndex: 1,
      title: 'Prognostic Value of Right Ventricular Dysfunction in Functional Mitral Regurgitation',
      scientificBackground: 'Right ventricular (RV) dysfunction is common in patients with functional mitral regurgitation (MR) but its independent prognostic value is not well established.',
      literaturePosition: 'Most studies on functional MR focus on left ventricular parameters, with limited data on RV contribution to outcomes.',
      primaryObjective: 'To determine whether RV dysfunction independently predicts mortality in patients with moderate to severe functional MR',
      mainExposure: 'Right ventricular dysfunction defined by TAPSE < 17mm or RV FAC < 35%',
      primaryEndpoint: 'Cardiovascular mortality at 3 years',
      studyPopulation: 'Adult patients with at least moderate functional mitral regurgitation',
      status: 'SUBMITTED'
    },
    {
      windowId: window2.id,
      userIndex: 2,
      mainAreaIndex: 2,
      title: 'Prevalence and Outcomes of Combined Aortic Stenosis and Mitral Regurgitation',
      scientificBackground: 'The combination of aortic stenosis and mitral regurgitation represents a complex clinical scenario with unclear management strategies and prognosis.',
      literaturePosition: 'Limited evidence exists on the natural history and optimal treatment approach for combined valvular disease.',
      primaryObjective: 'To characterize the prevalence, clinical features, and outcomes of patients with combined moderate-to-severe AS and MR',
      mainExposure: 'Combined aortic stenosis (AVA < 1.5 cm²) and mitral regurgitation (ERO > 20 mm²)',
      primaryEndpoint: 'Composite of all-cause mortality and heart failure hospitalization at 2 years',
      studyPopulation: 'Patients with concomitant at least moderate aortic stenosis and mitral regurgitation',
      status: 'SUBMITTED'
    },
    {
      windowId: window2.id,
      userIndex: 3,
      mainAreaIndex: 3,
      title: 'Machine Learning Prediction of Post-Operative Outcomes Using Preoperative Echocardiography',
      scientificBackground: 'Advanced computational methods may improve risk stratification in valvular heart disease patients scheduled for intervention.',
      literaturePosition: 'Traditional risk scores have limited accuracy for individual patient risk prediction.',
      primaryObjective: 'To develop and validate a machine learning model for predicting 30-day mortality after valve surgery',
      mainExposure: 'Comprehensive preoperative echocardiographic parameters',
      primaryEndpoint: '30-day all-cause mortality',
      studyPopulation: 'Adult patients undergoing surgical or transcatheter valve intervention',
      status: 'SUBMITTED'
    }
  ];

  for (const propData of proposalsData) {
    const user = users[propData.userIndex];
    const mainArea = mainAreas[propData.mainAreaIndex];

    const existing = await prisma.proposal.findFirst({
      where: {
        title: propData.title,
        piUserId: user.id
      }
    });

    if (!existing) {
      await prisma.proposal.create({
        data: {
          id: createId(),
          title: propData.title,
          submissionWindowId: propData.windowId,
          mainAreaId: mainArea.id,
          secondaryTopics: [],
          piUserId: user.id,
          centreId: user.centreId!,
          scientificBackground: propData.scientificBackground,
          literaturePosition: propData.literaturePosition,
          competingWork: [],
          primaryObjective: propData.primaryObjective,
          secondaryObjectives: [],
          mainExposure: propData.mainExposure,
          primaryEndpoint: propData.primaryEndpoint,
          secondaryEndpoints: [],
          studyPopulation: propData.studyPopulation,
          inclusionCriteria: 'To be defined during protocol development',
          exclusionCriteria: 'To be defined during protocol development',
          analysisTypes: ['cox'],
          targetJournals: [],
          status: propData.status as any,
          submittedAt: new Date(),
          isDeleted: false
        }
      });
      console.log(`Created proposal: ${propData.title.substring(0, 50)}...`);
    }
  }

  console.log('\n✅ Demo data created successfully!');
  console.log('\nCreated users (all with password: password):');
  userEmails.forEach(u => console.log(`  - ${u.email}`));
  console.log('\nSubmission Windows:');
  console.log('  - Call 2023-1 (CLOSED) - 2 proposals');
  console.log('  - Call 2024-1 (CLOSED) - 2 proposals');
  console.log('  - Call 2025-1 (OPEN) - 0 proposals');
}

main()
  .catch((error) => {
    console.error('Error seeding demo data:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
