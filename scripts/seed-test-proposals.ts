import { PrismaClient } from '@/app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Get the test user (Demo PI)
  const user = await prisma.user.findFirst({
    where: {
      email: 'demo@company.com'
    }
  });

  if (!user) {
    console.error('User not found');
    return;
  }

  // Get main areas
  const mainAreas = await prisma.mainArea.findMany();
  if (mainAreas.length === 0) {
    console.error('No main areas found');
    return;
  }

  // Create old submission windows
  const oldWindow1 = await prisma.submissionWindow.upsert({
    where: { name: 'Q3 2024 Submission' },
    update: {},
    create: {
      name: 'Q3 2024 Submission',
      submissionOpenAt: new Date('2024-07-01'),
      submissionCloseAt: new Date('2024-09-30'),
      reviewStartAt: new Date('2024-10-01'),
      reviewDeadlineDefault: new Date('2024-10-31'),
      responseDeadline: new Date('2024-11-15'),
      nextWindowOpensAt: new Date('2024-10-01'),
      status: 'CLOSED'
    }
  });

  const oldWindow2 = await prisma.submissionWindow.upsert({
    where: { name: 'Q4 2024 Submission' },
    update: {},
    create: {
      name: 'Q4 2024 Submission',
      submissionOpenAt: new Date('2024-10-01'),
      submissionCloseAt: new Date('2024-12-31'),
      reviewStartAt: new Date('2025-01-01'),
      reviewDeadlineDefault: new Date('2025-01-31'),
      responseDeadline: new Date('2025-02-15'),
      nextWindowOpensAt: new Date('2025-01-01'),
      status: 'REVIEW'
    }
  });

  // Create proposals - only ONE per window per PI
  // Q3 2024: Submitted proposal
  await prisma.proposal.create({
    data: {
      title: 'Impact of Exercise Training on Cardiac Function in Heart Failure Patients',
      piUserId: user.id,
      submissionWindowId: oldWindow1.id,
      mainAreaId: mainAreas[0].id,
      centreCode: 'FR001',
      secondaryTopics: ['Exercise physiology', 'Cardiac rehabilitation'],
      scientificBackground: 'Heart failure remains a major public health concern with significant morbidity and mortality. Exercise training has emerged as an important therapeutic intervention.',
      literaturePosition: 'Recent meta-analyses suggest exercise training improves functional capacity and quality of life in heart failure patients.',
      competingWork: [
        { title: 'Exercise training in heart failure', journal: 'Eur Heart J', year: 2023 }
      ],
      primaryObjective: 'To evaluate the impact of supervised exercise training on left ventricular function in heart failure patients',
      secondaryObjectives: ['Assess changes in quality of life', 'Evaluate safety outcomes'],
      mainExposure: 'Supervised exercise training program (3 times per week for 12 weeks)',
      primaryEndpoint: 'Change in left ventricular ejection fraction at 12 weeks',
      secondaryEndpoints: ['Quality of life scores', 'Adverse events'],
      studyPopulation: 'Adult patients with heart failure with reduced ejection fraction (HFrEF)',
      inclusionCriteria: 'Age ≥18 years, LVEF <40%, stable medical therapy',
      exclusionCriteria: 'Recent myocardial infarction, unstable angina',
      dataBaseline: true,
      dataBiological: true,
      dataTTE: true,
      dataTOE: false,
      dataStressEcho: true,
      dataCMR: false,
      dataCT: false,
      dataRHC: false,
      dataHospitalFollowup: true,
      dataClinicalFollowup: true,
      dataTTEFollowup: true,
      dataCoreLab: false,
      analysisTypes: ['cox', 'logistic'],
      analysisDescription: 'Mixed-effects models will be used to analyze changes in LVEF over time',
      adjustmentCovariates: 'Age, sex, baseline LVEF, comorbidities',
      subgroupAnalyses: 'By age groups, sex, baseline LVEF categories',
      targetJournals: ['European Heart Journal', 'Circulation', 'JACC'],
      status: 'SUBMITTED',
      submittedAt: new Date('2024-08-15')
    }
  });

  // Q4 2024: Draft proposal (not submitted yet)
  await prisma.proposal.create({
    data: {
      title: 'Role of Coronary Microvascular Dysfunction in Heart Failure with Preserved Ejection Fraction',
      piUserId: user.id,
      submissionWindowId: oldWindow2.id,
      mainAreaId: mainAreas[0].id,
      centreCode: 'FR001',
      secondaryTopics: ['Microvascular disease', 'HFpEF'],
      scientificBackground: 'Heart failure with preserved ejection fraction (HFpEF) lacks effective therapies, partly due to incomplete understanding of pathophysiology.',
      literaturePosition: 'Coronary microvascular dysfunction has emerged as a potential contributor to HFpEF.',
      competingWork: [],
      primaryObjective: 'To characterize coronary microvascular function in HFpEF patients',
      secondaryObjectives: ['Correlate with clinical outcomes'],
      mainExposure: 'Coronary microvascular dysfunction assessed by stress CMR',
      primaryEndpoint: 'Myocardial perfusion reserve index',
      secondaryEndpoints: ['Exercise capacity', 'Quality of life'],
      studyPopulation: 'Patients with HFpEF',
      inclusionCriteria: 'LVEF ≥50%, signs/symptoms of heart failure',
      exclusionCriteria: 'Obstructive coronary artery disease',
      dataBaseline: true,
      dataBiological: true,
      dataTTE: true,
      dataTOE: false,
      dataStressEcho: false,
      dataCMR: true,
      dataCT: true,
      dataRHC: true,
      dataHospitalFollowup: true,
      dataClinicalFollowup: true,
      dataTTEFollowup: false,
      dataCoreLab: true,
      analysisTypes: ['logistic'],
      analysisDescription: 'Correlation and regression analyses',
      adjustmentCovariates: 'Age, sex, comorbidities',
      subgroupAnalyses: 'None planned',
      targetJournals: ['European Heart Journal', 'Circulation', ''],
      status: 'DRAFT',
      submittedAt: null
    }
  });

  console.log('✅ Test proposals created successfully!');
  console.log(`- Old window 1: ${oldWindow1.name} (${oldWindow1.status}) - 1 SUBMITTED proposal`);
  console.log(`- Old window 2: ${oldWindow2.name} (${oldWindow2.status}) - 1 DRAFT proposal`);
  console.log('- Only 2 statuses used: DRAFT and SUBMITTED');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
