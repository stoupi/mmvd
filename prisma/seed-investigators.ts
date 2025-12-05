import { PrismaClient, InvestigatorRole } from '../app/generated/prisma';
import fs from 'fs';
import path from 'path';
import iconv from 'iconv-lite';

const prisma = new PrismaClient();

interface CsvRow {
  code: string;
  name: string;
  newName: string;
  Firstname_PI: string;
  Lastname_PI: string;
  Firstname_Co1: string;
  Lastname_Co1: string;
  Firstname_Co2: string;
  Lastname_Co2: string;
}

async function seedInvestigators() {
  console.log('Starting investigators import...');

  const csvPath = path.join(process.cwd(), 'public', 'liste_centres_new.csv.txt');
  const buffer = fs.readFileSync(csvPath);
  const csvContent = iconv.decode(buffer, 'utf16le');

  const lines = csvContent.split('\n').filter(line => line.trim());

  console.log(`Found ${lines.length - 1} centres to process`);

  let processedCount = 0;
  let updatedNamesCount = 0;
  let totalInvestigatorsCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');

    if (values.length < 10) {
      console.warn(`Skipping line ${i}: insufficient data`);
      continue;
    }

    const row: CsvRow = {
      code: values[0].trim(),
      name: values[1].trim(),
      newName: values[2].trim(),
      Firstname_PI: values[8].trim(),
      Lastname_PI: values[9].trim(),
      Firstname_Co1: values[10].trim(),
      Lastname_Co1: values[11].trim(),
      Firstname_Co2: values[12].trim(),
      Lastname_Co2: values[13].trim(),
    };

    console.log(`\nProcessing centre ${row.code}: ${row.name}`);

    const centre = await prisma.centre.findUnique({
      where: { code: row.code }
    });

    if (!centre) {
      console.warn(`  ⚠ Centre ${row.code} not found, skipping`);
      continue;
    }

    if (row.newName) {
      await prisma.centre.update({
        where: { id: centre.id },
        data: { name: row.newName }
      });
      console.log(`  ✓ Updated name: ${row.name} → ${row.newName}`);
      updatedNamesCount++;
    }

    await prisma.investigator.deleteMany({
      where: { centreId: centre.id }
    });

    const investigators = [];

    if (row.Firstname_PI && row.Lastname_PI) {
      investigators.push({
        firstName: row.Firstname_PI.replace(/\*/g, '').trim(),
        lastName: row.Lastname_PI.replace(/\*/g, '').trim(),
        role: InvestigatorRole.PI,
        displayOrder: 0,
        centreId: centre.id
      });
    }

    if (row.Firstname_Co1 && row.Lastname_Co1) {
      investigators.push({
        firstName: row.Firstname_Co1.replace(/\*/g, '').trim(),
        lastName: row.Lastname_Co1.replace(/\*/g, '').trim(),
        role: InvestigatorRole.CO_INVESTIGATOR,
        displayOrder: 1,
        centreId: centre.id
      });
    }

    if (row.Firstname_Co2 && row.Lastname_Co2) {
      investigators.push({
        firstName: row.Firstname_Co2.replace(/\*/g, '').trim(),
        lastName: row.Lastname_Co2.replace(/\*/g, '').trim(),
        role: InvestigatorRole.CO_INVESTIGATOR,
        displayOrder: 2,
        centreId: centre.id
      });
    }

    if (values[14] && values[15] && values[14].trim() && values[15].trim()) {
      investigators.push({
        firstName: values[14].replace(/\*/g, '').trim(),
        lastName: values[15].replace(/\*/g, '').trim(),
        role: InvestigatorRole.CO_INVESTIGATOR,
        displayOrder: 3,
        centreId: centre.id
      });
    }

    if (investigators.length > 0) {
      await prisma.investigator.createMany({
        data: investigators
      });
      console.log(`  ✓ Created ${investigators.length} investigator(s)`);
      totalInvestigatorsCount += investigators.length;
    }

    processedCount++;
  }

  console.log('\n========================================');
  console.log('✅ Import completed successfully!');
  console.log(`Centres processed: ${processedCount}`);
  console.log(`Centre names updated: ${updatedNamesCount}`);
  console.log(`Total investigators created: ${totalInvestigatorsCount}`);
  console.log('========================================\n');
}

seedInvestigators()
  .catch((error) => {
    console.error('Error seeding investigators:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
