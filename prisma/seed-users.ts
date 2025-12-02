import { PrismaClient } from '../app/generated/prisma';
import { auth } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo users...');

  // Create PI user with SUBMISSION permission
  try {
    const piResult = await auth.api.signUpEmail({
      body: {
        email: 'demo@company.com',
        password: 'password',
        name: 'Demo PI'
      }
    });

    if ('user' in piResult) {
      await prisma.user.update({
        where: { id: piResult.user.id },
        data: {
          emailVerified: true,
          firstName: 'Demo',
          lastName: 'PI',
          centreCode: 'CENTRE001',
          affiliation: 'Demo University Hospital',
          permissions: ['SUBMISSION'],
          isActive: true
        }
      });
      console.log('Created PI user: demo@company.com');
    }
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('PI user already exists');
      const user = await prisma.user.findUnique({ where: { email: 'demo@company.com' } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            permissions: ['SUBMISSION'],
            centreCode: 'CENTRE001',
            isActive: true
          }
        });
      }
    } else {
      console.error('Error creating PI user:', error);
    }
  }

  // Create admin user with all permissions
  try {
    const adminResult = await auth.api.signUpEmail({
      body: {
        email: 'admin@company.com',
        password: 'admin123',
        name: 'Admin User'
      }
    });

    if ('user' in adminResult) {
      await prisma.user.update({
        where: { id: adminResult.user.id },
        data: {
          emailVerified: true,
          firstName: 'Admin',
          lastName: 'User',
          affiliation: 'Study Administration',
          permissions: ['SUBMISSION', 'REVIEWING', 'ADMIN'],
          isActive: true
        }
      });
      console.log('Created admin user: admin@company.com');
    }
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('Admin user already exists');
      const user = await prisma.user.findUnique({ where: { email: 'admin@company.com' } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            permissions: ['SUBMISSION', 'REVIEWING', 'ADMIN'],
            isActive: true
          }
        });
      }
    } else {
      console.error('Error creating admin user:', error);
    }
  }

  // Create reviewer user
  try {
    const reviewerResult = await auth.api.signUpEmail({
      body: {
        email: 'reviewer@company.com',
        password: 'password',
        name: 'Demo Reviewer'
      }
    });

    if ('user' in reviewerResult) {
      await prisma.user.update({
        where: { id: reviewerResult.user.id },
        data: {
          emailVerified: true,
          firstName: 'Demo',
          lastName: 'Reviewer',
          affiliation: 'Review Committee',
          permissions: ['REVIEWING'],
          isActive: true
        }
      });
      console.log('Created reviewer user: reviewer@company.com');
    }
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      console.log('Reviewer user already exists');
      const user = await prisma.user.findUnique({ where: { email: 'reviewer@company.com' } });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            permissions: ['REVIEWING'],
            isActive: true
          }
        });
      }
    } else {
      console.error('Error creating reviewer user:', error);
    }
  }

  console.log('Demo users created successfully!');
}

main()
  .catch((error) => {
    console.error('Error seeding demo users:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
