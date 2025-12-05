interface MapStatsProps {
  totalCentres: number;
  totalPatients: number;
  totalCountries: number;
}

export function MapStats({ totalCentres, totalPatients, totalCountries }: MapStatsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-8 mb-8'>
      <div className='text-center'>
        <p className='text-6xl font-bold text-pink-500 mb-2'>{totalCountries}</p>
        <p className='text-gray-600'>Countries</p>
      </div>

      <div className='text-center border-l border-r border-gray-300'>
        <p className='text-6xl font-bold text-pink-500 mb-2'>{totalCentres}</p>
        <p className='text-gray-600'>Participating Centres</p>
      </div>

      <div className='text-center'>
        <p className='text-6xl font-bold text-pink-500 mb-2'>{totalPatients.toLocaleString()}</p>
        <p className='text-gray-600'>Patients Included</p>
      </div>
    </div>
  );
}
