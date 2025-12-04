import { PrismaClient } from '../app/generated/prisma';

const prisma = new PrismaClient();

async function geocodeAddress(address: string, city: string, postalCode: string, countryCode: string) {
  // Try with full address first
  let query = encodeURIComponent(`${address}, ${postalCode} ${city}, France`);
  let url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

  console.log('Geocoding (full):', query);

  let response = await fetch(url);
  let data = await response.json();

  if (data && data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    };
  }

  // Try with just city and postal code
  await new Promise(resolve => setTimeout(resolve, 1000));
  query = encodeURIComponent(`${city}, ${postalCode}, France`);
  url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;

  console.log('Geocoding (city):', query);

  response = await fetch(url);
  data = await response.json();

  if (data && data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon)
    };
  }

  return null;
}

async function main() {
  const centresToGeocode = await prisma.centre.findMany({
    where: {
      code: { in: ['019', '026', '044'] },
      latitude: null
    }
  });

  console.log(`Found ${centresToGeocode.length} centres to geocode\n`);

  for (const centre of centresToGeocode) {
    const coords = await geocodeAddress(
      centre.address || '',
      centre.city || '',
      centre.postalCode || '',
      centre.countryCode
    );

    if (coords) {
      await prisma.centre.update({
        where: { id: centre.id },
        data: {
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      });
      console.log(`✓ ${centre.code} - ${centre.name}: ${coords.latitude}, ${coords.longitude}\n`);
    } else {
      console.log(`✗ ${centre.code} - ${centre.name}: Geocoding failed\n`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('Done!');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
