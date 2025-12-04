import { PrismaClient } from '../app/generated/prisma';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface CentreRow {
  code: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  countryCode: string;
  patientCount: string;
}

async function geocodeAddress(address: string, city: string, postalCode: string, countryCode: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${postalCode} ${city}, ${countryCode}`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);

    if (!response.ok) {
      console.warn(`Geocoding failed for ${city}, ${countryCode}`);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    return null;
  } catch (error) {
    console.error(`Error geocoding ${city}, ${countryCode}:`, error);
    return null;
  }
}

async function seedCentres() {
  console.log('Starting centres import...');

  const csvPath = path.join(process.cwd(), 'public', 'liste_centres.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');

  const lines = csvContent.split('\n').filter(line => line.trim());
  const headers = lines[0].split(';');

  console.log(`Found ${lines.length - 1} centres to import`);

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';');

    if (values.length < 7) {
      console.warn(`Skipping line ${i}: insufficient data`);
      continue;
    }

    const centre: CentreRow = {
      code: values[0].trim(),
      name: values[1].trim().replace(/^"|"$/g, ''), // Remove quotes if present
      address: values[2].trim(),
      city: values[3].trim(),
      postalCode: values[4].trim(),
      countryCode: values[5].trim(),
      patientCount: values[6].trim()
    };

    console.log(`\nProcessing centre ${centre.code}: ${centre.name}, ${centre.city}, ${centre.countryCode}`);

    // Geocode the address
    const coordinates = await geocodeAddress(centre.address, centre.city, centre.postalCode, centre.countryCode);

    if (coordinates) {
      console.log(`  ✓ Geocoded: ${coordinates.latitude}, ${coordinates.longitude}`);
    } else {
      console.log(`  ⚠ Could not geocode, will skip coordinates`);
    }

    // Insert into database
    await prisma.centre.upsert({
      where: { code: centre.code },
      update: {
        name: centre.name,
        address: centre.address,
        city: centre.city,
        postalCode: centre.postalCode,
        countryCode: centre.countryCode,
        patientCount: parseInt(centre.patientCount, 10),
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude
      },
      create: {
        code: centre.code,
        name: centre.name,
        address: centre.address,
        city: centre.city,
        postalCode: centre.postalCode,
        countryCode: centre.countryCode,
        patientCount: parseInt(centre.patientCount, 10),
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude
      }
    });

    console.log(`  ✓ Saved to database`);

    // Rate limiting: wait 1 second between requests to respect Nominatim's usage policy
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ All centres imported successfully!');
}

seedCentres()
  .catch((e) => {
    console.error('Error seeding centres:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
