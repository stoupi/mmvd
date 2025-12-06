import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const migrationSQL = `
-- Add isDraft and emailSentAt fields to Review table
ALTER TABLE "Review"
ADD COLUMN IF NOT EXISTS "isDraft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "emailSentAt" TIMESTAMP(3);

-- Create index on isDraft for efficient querying
CREATE INDEX IF NOT EXISTS "Review_isDraft_idx" ON "Review"("isDraft");
`;

async function runMigration() {
  try {
    console.log('Running migration: add_review_draft_fields');
    await pool.query(migrationSQL);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
