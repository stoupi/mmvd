'use client';

import { useEffect, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import type { Feature, Geometry } from 'geojson';

interface CountryLayerProps {
  countriesWithCentres: string[];
}

export function CountryLayer({ countriesWithCentres }: CountryLayerProps) {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch('/countries.geojson')
      .then((response) => response.json())
      .then((data) => setGeoData(data))
      .catch((error) => console.error('Error loading GeoJSON:', error));
  }, []);

  if (!geoData) return null;

  const style = (feature: Feature<Geometry, any> | undefined) => {
    if (!feature || !feature.properties) {
      return {
        fillColor: 'transparent',
        weight: 0,
        color: 'transparent',
        fillOpacity: 0
      };
    }

    let countryCode = feature.properties['ISO3166-1-Alpha-2'];
    const countryName = feature.properties['name'];

    // Handle special cases where GeoJSON has incorrect ISO codes
    if (countryName === 'France' || countryCode === '-99') {
      countryCode = 'FR';
    }

    const hasCenter = countriesWithCentres.includes(countryCode);

    return {
      fillColor: hasCenter ? '#ec4899' : 'transparent',
      weight: 0,
      color: 'transparent',
      fillOpacity: hasCenter ? 0.4 : 0
    };
  };

  return <GeoJSON data={geoData} style={style} />;
}
