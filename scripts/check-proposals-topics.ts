import 'dotenv/config';
import { PrismaClient } from '../app/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkProposals() {
  console.log('🔍 Checking proposals with topic references...\n');

  try {
    const proposals = await prisma.proposal.findMany({
      include: {
        mainArea: true
      }
    });

    console.log(`Found ${proposals.length} proposals\n`);

    for (const proposal of proposals) {
      console.log(`Proposal: ${proposal.title}`);
      console.log(`  Main Topic: ${proposal.mainArea?.code} - ${proposal.mainArea?.label}`);
      console.log(`  Secondary Topics: ${JSON.stringify(proposal.secondaryTopics)}`);
      console.log(`  Main Area ID: ${proposal.mainAreaId}`);
      console.log('');
    }

    // Check if secondaryTopics contains IDs or codes
    const proposalsWithSecondary = proposals.filter(p => p.secondaryTopics && p.secondaryTopics.length > 0);

    if (proposalsWithSecondary.length > 0) {
      console.log(`\n📊 ${proposalsWithSecondary.length} proposals have secondary topics`);

      // Try to determine if they're IDs or codes
      const firstSecondaryTopic = proposalsWithSecondary[0].secondaryTopics[0];
      console.log(`Sample secondary topic value: ${firstSecondaryTopic}`);

      // Check if it's a UUID (ID) or a code
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(firstSecondaryTopic);
      const isCode = /^[A-N]-\d+$/.test(firstSecondaryTopic);

      console.log(`Appears to be: ${isUUID ? 'UUID (ID)' : isCode ? 'Code' : 'Unknown format'}`);
    } else {
      console.log('\n📊 No proposals have secondary topics yet');
    }

  } catch (error) {
    console.error('❌ Error checking proposals:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkProposals()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
