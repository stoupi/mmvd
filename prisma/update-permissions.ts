import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating user permissions...');

  // Get all users
  const users = await prisma.user.findMany();

  console.log('Found users:', users.map(u => ({ email: u.email, permissions: u.permissions })));

  // Update demo@company.com to have SUBMISSION permission
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@company.com' }
  });

  if (demoUser) {
    await prisma.user.update({
      where: { email: 'demo@company.com' },
      data: {
        permissions: ['SUBMISSION'],
        centreCode: 'CENTRE001',
        firstName: 'Demo',
        lastName: 'PI',
        affiliation: 'Demo University Hospital',
        isActive: true
      }
    });
    console.log('Updated demo@company.com with SUBMISSION permission');
  }

  // Update admin@company.com to have all permissions
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@company.com' }
  });

  if (adminUser) {
    await prisma.user.update({
      where: { email: 'admin@company.com' },
      data: {
        permissions: ['SUBMISSION', 'REVIEWING', 'ADMIN'],
        firstName: 'Admin',
        lastName: 'User',
        affiliation: 'Study Administration',
        isActive: true
      }
    });
    console.log('Updated admin@company.com with all permissions');
  }

  console.log('Permissions updated successfully!');
}

main()
  .catch((error) => {
    console.error('Error updating permissions:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
