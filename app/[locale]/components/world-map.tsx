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
      const icon = L.icon({
        iconUrl: '/marker-icon.png',
        iconRetinaUrl: '/marker-icon-2x.png',
        shadowUrl: '/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      setCustomIcon(icon);
    });
  }, []);

  if (!isClient || !customIcon) {
    return (
      <div className='w-full h-[600px] bg-gray-100 rounded-lg flex items-center justify-center'>
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
    <div className='w-full h-[600px] rounded-lg overflow-hidden border border-gray-200 shadow-lg'>
      <MapContainer
        center={[20, 0]}
        zoom={2}
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
                <h3 className='font-bold text-lg mb-1'>
                  {centre.code} - {centre.name}
                </h3>
                <p className='text-sm text-gray-600'>
                  {centre.city}, {centre.countryCode}
                </p>
                <p className='text-sm font-semibold mt-2'>
                  Patients: {centre.patientCount}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
