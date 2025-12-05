'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { LatLngBoundsExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

const MapBoundsUpdater = dynamic(
  () => import('./map-bounds-updater').then((mod) => ({ default: mod.MapBoundsUpdater })),
  { ssr: false }
);

const CountryLayer = dynamic(
  () => import('./country-layer').then((mod) => ({ default: mod.CountryLayer })),
  { ssr: false }
);

interface Centre {
  id: string;
  code: string;
  name: string;
  city: string | null;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  patientCount: number;
}

const countryNames: Record<string, string> = {
  'AT': 'Austria',
  'BE': 'Belgium',
  'CA': 'Canada',
  'CH': 'Switzerland',
  'CY': 'Cyprus',
  'DE': 'Germany',
  'DZ': 'Algeria',
  'FR': 'France',
  'GE': 'Georgia',
  'GR': 'Greece',
  'HR': 'Croatia',
  'IR': 'Iran',
  'IT': 'Italy',
  'JP': 'Japan',
  'LT': 'Lithuania',
  'MK': 'North Macedonia',
  'PK': 'Pakistan',
  'PL': 'Poland',
  'PT': 'Portugal',
  'RO': 'Romania',
  'RS': 'Serbia',
  'SI': 'Slovenia',
  'TR': 'Turkey',
  'UA': 'Ukraine'
};

interface MapData {
  centres: Centre[];
  statsByCountry: Record<
    string,
    {
      centreCount: number;
      patientCount: number;
      centres: Centre[];
    }
  >;
  totalCentres: number;
  totalPatients: number;
}

interface WorldMapProps {
  data: MapData;
}

export function WorldMap({ data }: WorldMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);

    import('leaflet').then((L) => {
      const pinkMarkerSvg = `
        <svg width="30" height="45" viewBox="0 0 30 45" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 2C8.373 2 3 7.373 3 14c0 10.5 12 27 12 27s12-16.5 12-27c0-6.627-5.373-12-12-12z"
                fill="#ec4899" stroke="#be185d" stroke-width="2"/>
          <circle cx="15" cy="14" r="4" fill="white"/>
        </svg>
      `;

      const pinkMarkerUrl = 'data:image/svg+xml;base64,' + btoa(pinkMarkerSvg);

      const icon = L.icon({
        iconUrl: pinkMarkerUrl,
        iconSize: [30, 45],
        iconAnchor: [15, 45],
        popupAnchor: [0, -45]
      });
      setCustomIcon(icon);
    });
  }, []);

  if (!isClient || !customIcon) {
    return (
      <div className='max-w-4xl mx-auto h-[400px] bg-gray-100 rounded-lg flex items-center justify-center'>
        <p className='text-gray-500'>Loading map...</p>
      </div>
    );
  }

  const centresWithCoordinates = data.centres.filter(
    (centre) => centre.latitude !== null && centre.longitude !== null
  );

  const countriesWithCentres = Array.from(
    new Set(data.centres.map((centre) => centre.countryCode))
  );

  return (
    <div className='max-w-4xl mx-auto h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-lg'>
      <MapContainer
        center={[48, 15]}
        zoom={2}
        minZoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <CountryLayer countriesWithCentres={countriesWithCentres} />
        <MapBoundsUpdater centres={centresWithCoordinates} />
        {centresWithCoordinates.map((centre) => (
          <Marker
            key={centre.id}
            position={[centre.latitude!, centre.longitude!]}
            icon={customIcon}
          >
            <Popup>
              <div className='p-2'>
                <h3 className='font-semibold text-base mb-1'>
                  {centre.name}
                </h3>
                <p className='text-sm text-gray-600'>
                  {centre.city}, {countryNames[centre.countryCode] || centre.countryCode}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
