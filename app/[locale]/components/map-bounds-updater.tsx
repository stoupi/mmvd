'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface Centre {
  latitude: number | null;
  longitude: number | null;
}

interface MapBoundsUpdaterProps {
  centres: Centre[];
}

export function MapBoundsUpdater({ centres }: MapBoundsUpdaterProps) {
  const map = useMap();

  useEffect(() => {
    if (map && centres.length > 0) {
      const bounds: [number, number][] = centres
        .filter((centre) => centre.latitude !== null && centre.longitude !== null)
        .map((centre) => [centre.latitude!, centre.longitude!]);

      if (bounds.length > 0) {
        const latLngBounds = L.latLngBounds(bounds);
        map.fitBounds(latLngBounds, { padding: [50, 50] });
      }
    }
  }, [map, centres]);

  return null;
}
