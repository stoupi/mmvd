import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function setToDraft() {
  console.log('🔄 Setting proposal to DRAFT status...');

  const proposal = await prisma.proposal.update({
    where: { id: 'cmiu5nwh900016cz8t8w9x0fh' },
    data: { status: 'DRAFT' }
  });

  console.log('✅ Proposal updated:', {
    id: proposal.id,
    title: proposal.title,
    status: proposal.status
  });

  await pool.end();
}

setToDraft().catch(console.error);
