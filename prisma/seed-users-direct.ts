import { PrismaClient } from '../app/generated/prisma';
import { createId } from '@paralleldrive/cuid2';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo users directly...');

  // Get first centre
  const firstCentre = await prisma.centre.findFirst();
  if (!firstCentre) {
    console.error('No centre found. Please run seed-centres.ts first.');
    process.exit(1);
  }

  // Hash passwords
  const hashedPassword = await hash('password', 10);
  const hashedAdminPassword = await hash('admin123', 10);

  // Create PI user with SUBMISSION permission
  try {
    const existingPi = await prisma.user.findUnique({
      where: { email: 'demo@company.com' }
    });

    if (existingPi) {
      console.log('PI user already exists, updating...');
      await prisma.user.update({
        where: { id: existingPi.id },
        data: {
          emailVerified: true,
          firstName: 'Demo',
          lastName: 'PI',
          centreId: firstCentre.id,
          affiliation: 'Demo University Hospital',
          permissions: ['SUBMISSION'],
          isActive: true
        }
      });
    } else {
      const userId = createId();
      await prisma.user.create({
        data: {
          id: userId,
          email: 'demo@company.com',
          emailVerified: true,
          name: 'Demo PI',
          firstName: 'Demo',
          lastName: 'PI',
          centreId: firstCentre.id,
          affiliation: 'Demo University Hospital',
          permissions: ['SUBMISSION'],
          isActive: true
        }
      });

      // Create account with password
      await prisma.account.create({
        data: {
          id: createId(),
          userId: userId,
          accountId: userId,
          providerId: 'credential',
          password: hashedPassword
        }
      });
      console.log('Created PI user: demo@company.com / password');
    }
  } catch (error) {
    console.error('Error creating PI user:', error);
  }

  // Create admin user with all permissions
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@company.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists, updating...');
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          emailVerified: true,
          firstName: 'Admin',
          lastName: 'User',
          centreId: firstCentre.id,
          affiliation: 'Study Administration',
          permissions: ['SUBMISSION', 'REVIEWING', 'ADMIN'],
          isActive: true
        }
      });
    } else {
      const userId = createId();
      await prisma.user.create({
        data: {
          id: userId,
          email: 'admin@company.com',
          emailVerified: true,
          name: 'Admin User',
          firstName: 'Admin',
          lastName: 'User',
          centreId: firstCentre.id,
          affiliation: 'Study Administration',
          permissions: ['SUBMISSION', 'REVIEWING', 'ADMIN'],
          isActive: true
        }
      });

      // Create account with password
      await prisma.account.create({
        data: {
          id: createId(),
          userId: userId,
          accountId: userId,
          providerId: 'credential',
          password: hashedAdminPassword
        }
      });
      console.log('Created admin user: admin@company.com / admin123');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }

  // Create reviewer user
  try {
    const existingReviewer = await prisma.user.findUnique({
      where: { email: 'reviewer@company.com' }
    });

    if (existingReviewer) {
      console.log('Reviewer user already exists, updating...');
      await prisma.user.update({
        where: { id: existingReviewer.id },
        data: {
          emailVerified: true,
          firstName: 'Demo',
          lastName: 'Reviewer',
          centreId: firstCentre.id,
          affiliation: 'Review Committee',
          permissions: ['REVIEWING'],
          isActive: true
        }
      });
    } else {
      const userId = createId();
      await prisma.user.create({
        data: {
          id: userId,
          email: 'reviewer@company.com',
          emailVerified: true,
          name: 'Demo Reviewer',
          firstName: 'Demo',
          lastName: 'Reviewer',
          centreId: firstCentre.id,
          affiliation: 'Review Committee',
          permissions: ['REVIEWING'],
          isActive: true
        }
      });

      // Create account with password
      await prisma.account.create({
        data: {
          id: createId(),
          userId: userId,
          accountId: userId,
          providerId: 'credential',
          password: hashedPassword
        }
      });
      console.log('Created reviewer user: reviewer@company.com / password');
    }
  } catch (error) {
    console.error('Error creating reviewer user:', error);
  }

  console.log('\nDemo users created successfully!');
  console.log('Login credentials:');
  console.log('  Admin: admin@company.com / admin123');
  console.log('  PI: demo@company.com / password');
  console.log('  Reviewer: reviewer@company.com / password');
}

main()
  .catch((error) => {
    console.error('Error seeding demo users:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
