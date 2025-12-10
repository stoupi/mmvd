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

interface Investigator {
  id: string;
  firstName: string;
  lastName: string;
  role: 'PI' | 'CO_INVESTIGATOR';
  displayOrder: number;
  photoUrl: string | null;
}

interface Centre {
  id: string;
  code: string;
  name: string;
  city: string | null;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  patientCount: number;
  investigators: Investigator[];
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

function InvestigatorAvatar({ investigator }: { investigator: Investigator }) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (role: string) => {
    return role === 'PI'
      ? 'bg-gradient-to-br from-purple-600 to-pink-500'
      : 'bg-gradient-to-br from-blue-500 to-indigo-500';
  };

  return (
    <div className='flex items-center gap-1.5'>
      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${getAvatarColor(investigator.role)} text-white text-[10px] font-semibold flex-shrink-0`}>
        {investigator.photoUrl ? (
          <img
            src={investigator.photoUrl}
            alt={`${investigator.firstName} ${investigator.lastName}`}
            className='h-full w-full rounded-full object-cover'
          />
        ) : (
          getInitials(investigator.firstName, investigator.lastName)
        )}
      </div>
      <div className='text-xs'>
        <span className='font-medium text-gray-900'>
          {investigator.firstName} {investigator.lastName}
        </span>
        {investigator.role === 'PI' && (
          <span className='ml-1 text-[10px] text-purple-600 font-semibold'>(PI)</span>
        )}
      </div>
    </div>
  );
}

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
  // Map centered at [42, 25] with zoom 4 - updated positioning
  const [isClient, setIsClient] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);

    import('leaflet').then((L) => {
      const pinkMarkerSvg = `
        <svg width="20" height="30" viewBox="0 0 20 30" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 1C5.582 1 2 4.582 2 9c0 7 8 18 8 18s8-11 8-18c0-4.418-3.582-8-8-8z"
                fill="#ec4899" stroke="#be185d" stroke-width="1.5" opacity="0.8"/>
          <circle cx="10" cy="9" r="2.5" fill="white"/>
        </svg>
      `;

      const pinkMarkerUrl = 'data:image/svg+xml;base64,' + btoa(pinkMarkerSvg);

      const icon = L.icon({
        iconUrl: pinkMarkerUrl,
        iconSize: [20, 30],
        iconAnchor: [10, 30],
        popupAnchor: [0, -30]
      });
      setCustomIcon(icon);
    });
  }, []);

  if (!isClient || !customIcon) {
    return (
      <div className='w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center'>
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
    <div className='w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 shadow-lg'>
      <MapContainer
        center={[40, 15]}
        zoom={2.4}
        minZoom={2}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <CountryLayer countriesWithCentres={countriesWithCentres} />
        {centresWithCoordinates.map((centre) => (
          <Marker
            key={centre.id}
            position={[centre.latitude!, centre.longitude!]}
            icon={customIcon}
          >
            <Popup>
              <div className='p-2 min-w-[240px]'>
                <div className='mb-2'>
                  <div className='font-semibold text-sm leading-none'>{centre.name}</div>
                  <div className='text-xs text-gray-500 leading-none mt-0.5'>
                    {centre.city}, {countryNames[centre.countryCode] || centre.countryCode}
                  </div>
                </div>

                {centre.investigators.length > 0 && (
                  <div className='space-y-1.5 mt-2'>
                    {centre.investigators.map((investigator) => (
                      <InvestigatorAvatar key={investigator.id} investigator={investigator} />
                    ))}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
