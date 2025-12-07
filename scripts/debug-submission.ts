import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function debug() {
  console.log('\n🔍 Checking submission window status...');

  // Check current window
  const currentWindow = await prisma.submissionWindow.findFirst({
    where: {
      status: 'OPEN',
      submissionOpenAt: { lte: new Date() },
      submissionCloseAt: { gte: new Date() }
    }
  });

  console.log('Current open window:', currentWindow ? {
    id: currentWindow.id,
    name: currentWindow.name,
    status: currentWindow.status,
    openAt: currentWindow.submissionOpenAt,
    closeAt: currentWindow.submissionCloseAt
  } : 'NONE');

  // Check Admin User
  console.log('\n👤 Checking Admin User...');
  const adminUser = await prisma.user.findFirst({
    where: { email: { contains: 'admin' } },
    include: { centre: true }
  });

  console.log('Admin User:', adminUser ? {
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
    centreId: adminUser.centreId,
    centre: adminUser.centre?.name
  } : 'NOT FOUND');

  // Check if centre has existing submission
  if (currentWindow && adminUser?.centreId) {
    console.log('\n📝 Checking existing submissions...');
    const existingSubmission = await prisma.proposal.findFirst({
      where: {
        submissionWindowId: currentWindow.id,
        centreId: adminUser.centreId,
        isDeleted: false,
        status: 'SUBMITTED'
      }
    });

    console.log('Existing submitted proposal:', existingSubmission ? {
      id: existingSubmission.id,
      title: existingSubmission.title,
      status: existingSubmission.status
    } : 'NONE');
  }

  await pool.end();
}

debug().catch(console.error);
