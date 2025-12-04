interface MapStatsProps {
  totalCentres: number;
  totalPatients: number;
  totalCountries: number;
}

export function MapStats({ totalCentres, totalPatients, totalCountries }: MapStatsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
      <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-gray-600'>Countries</p>
            <p className='text-3xl font-bold text-gray-900 mt-2'>{totalCountries}</p>
          </div>
          <div className='h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center'>
            <svg className='w-6 h-6 text-blue-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-gray-600'>Medical Centres</p>
            <p className='text-3xl font-bold text-gray-900 mt-2'>{totalCentres}</p>
          </div>
          <div className='h-12 w-12 bg-green-100 rounded-full flex items-center justify-center'>
            <svg className='w-6 h-6 text-green-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' />
            </svg>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-6 shadow-sm'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-gray-600'>Patients Enrolled</p>
            <p className='text-3xl font-bold text-gray-900 mt-2'>{totalPatients.toLocaleString()}</p>
          </div>
          <div className='h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center'>
            <svg className='w-6 h-6 text-purple-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
