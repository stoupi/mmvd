import { prisma } from '@/lib/prisma';

export async function getAllCentres() {
  return prisma.centre.findMany({
    where: {
      isActive: true
    },
    orderBy: [
      { code: 'asc' }
    ]
  });
}

export async function getCentreByCode(code: string) {
  return prisma.centre.findUnique({
    where: { code }
  });
}

export async function getCentreById(id: string) {
  return prisma.centre.findUnique({
    where: { id }
  });
}

export async function getCentreStats() {
  const centres = await prisma.centre.findMany({
    where: { isActive: true },
    select: {
      id: true,
      code: true,
      name: true,
      city: true,
      countryCode: true,
      latitude: true,
      longitude: true,
      patientCount: true
    }
  });

  // Group by country
  const statsByCountry = centres.reduce((acc, centre) => {
    if (!acc[centre.countryCode]) {
      acc[centre.countryCode] = {
        centreCount: 0,
        patientCount: 0,
        centres: []
      };
    }

    acc[centre.countryCode].centreCount++;
    acc[centre.countryCode].patientCount += centre.patientCount;
    acc[centre.countryCode].centres.push(centre);

    return acc;
  }, {} as Record<string, { centreCount: number; patientCount: number; centres: typeof centres }>);

  return {
    centres,
    statsByCountry,
    totalCentres: centres.length,
    totalPatients: centres.reduce((sum, c) => sum + c.patientCount, 0)
  };
}
