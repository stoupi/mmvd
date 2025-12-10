import { getTranslations } from 'next-intl/server';
import { getTypedSession } from '@/lib/auth-helpers';
import { Link } from '@/app/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import Image from 'next/image';
import { getCentreStats } from '@/lib/services/centres';
import { WorldMap } from './components/world-map';
import { MapStats } from './components/map-stats';

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'landing' });
  const session = await getTypedSession();
  const mapData = await getCentreStats();

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-pink-50'>
      {/* Hero Section */}
      <section className='container mx-auto px-4 py-20 text-center'>
        <div className='flex justify-center mb-4'>
          <Image
            src='/logo-5-vectorized.png'
            alt='MMVD Logo'
            width={210}
            height={288}
            className='w-auto h-auto'
          />
        </div>
        <h1 className='text-5xl font-bold mb-4'>
          <span
            className='bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500'
          >
            {t('hero.title')}
          </span>
        </h1>
        <p className='text-2xl text-gray-900 mb-8 font-semibold'>
          The first international prospective study<br />
          dedicated to <span className='bg-pink-100 px-2 py-1 rounded'>Multiple and Mixed Valvular Diseases</span>
        </p>
        <div className='flex justify-center gap-4'>
          <Button size='lg' asChild className='hover:bg-pink-400'>
            <a
              href='https://clinicaltrials.gov/study/NCT06235385'
              target='_blank'
              rel='noopener noreferrer'
              className='whitespace-pre-line text-center px-8 py-6 min-w-[300px]'
            >
              {t('hero.clinicalTrialsButton')}
            </a>
          </Button>
        </div>
      </section>

      {/* Global Network Section */}
      <section className='container mx-auto px-4 py-4'>
        <div className='bg-white rounded-lg shadow-lg p-8 border border-gray-200'>
          <div className='text-center mb-8'>
            <h2 className='text-4xl font-bold mb-4'>
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500'>
                Our Global Network
              </span>
            </h2>
            <div className='text-base text-gray-700 max-w-4xl mx-auto space-y-4 text-center'>
              <p>
                The MMVD Study is powered by the enthusiasm and collaborative spirit of the <strong>Heart Imagers of Tomorrow (HIT)</strong> community of the EACVI society. Young and experienced cardiovascular imagers have joined forces to build the first worldwide registry dedicated to multiple and mixed valvular disease.
              </p>
              <p>
                This shared effort brings together centers from more than 20 countries, each contributing real-world data, diverse clinical perspectives, and unique imaging expertise. Together, we are creating an unprecedented global picture of MMVD — one that reflects how patients are assessed, imaged, and treated across different healthcare systems and cultures.
              </p>
            </div>
          </div>
          <MapStats
            totalCentres={mapData.totalCentres}
            totalPatients={mapData.totalPatients}
            totalCountries={Object.keys(mapData.statsByCountry).length}
          />
          <div className='relative'>
            <WorldMap data={mapData} />
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none' style={{ zIndex: 1000 }}>
              <div className='bg-white text-pink-600 px-6 py-3 rounded-full shadow-2xl animate-bounce border border-pink-500'>
                <p className='text-sm font-semibold flex items-center gap-2'>
                  👆 Click on any marker to discover participating centers!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Study Principle Section */}
      <section id='study-principle' className='container mx-auto px-4 py-16'>
        <Card>
          <CardHeader>
            <CardTitle className='text-3xl'>{t('principle.title')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>{t('principle.description')}</p>
            <div className='grid md:grid-cols-3 gap-6 mt-6'>
              <div className='text-center'>
                <div className='text-4xl font-bold text-pink-600'>150+</div>
                <div className='text-sm text-gray-600'>{t('principle.centres')}</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-pink-600'>5000+</div>
                <div className='text-sm text-gray-600'>{t('principle.patients')}</div>
              </div>
              <div className='text-center'>
                <div className='text-4xl font-bold text-pink-600'>3</div>
                <div className='text-sm text-gray-600'>{t('principle.modalities')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Study Design Section */}
      <section className='container mx-auto px-4 py-16'>
        <Card>
          <CardHeader>
            <CardTitle className='text-3xl'>{t('design.title')}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-gray-700'>{t('design.overview')}</p>
            <ul className='list-disc list-inside space-y-2 text-gray-700'>
              <li>{t('design.feature1')}</li>
              <li>{t('design.feature2')}</li>
              <li>{t('design.feature3')}</li>
              <li>{t('design.feature4')}</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Publications Section */}
      <section className='container mx-auto px-4 py-16'>
        <Card>
          <CardHeader>
            <CardTitle className='text-3xl'>{t('publications.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {[1, 2, 3].map((num) => (
                <div key={num} className='border-l-4 border-pink-600 pl-4 py-2'>
                  <h4 className='font-semibold text-gray-900'>
                    {t(`publications.pub${num}.title`)}
                  </h4>
                  <p className='text-sm text-gray-600'>
                    {t(`publications.pub${num}.journal`)} • {t(`publications.pub${num}.year`)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Investigators Section */}
      <section className='container mx-auto px-4 py-16'>
        <Card>
          <CardHeader>
            <CardTitle className='text-3xl'>{t('investigators.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className='border rounded-lg p-4'>
                  <h4 className='font-semibold text-gray-900'>
                    {t(`investigators.centre${num}.name`)}
                  </h4>
                  <p className='text-sm text-gray-600'>
                    {t(`investigators.centre${num}.city`)}
                  </p>
                  <p className='text-sm text-pink-600'>
                    {t(`investigators.centre${num}.pi`)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contact Section */}
      <section className='container mx-auto px-4 py-16 mb-16'>
        <Card className='bg-gradient-to-r from-purple-600 to-pink-500 text-white'>
          <CardHeader>
            <CardTitle className='text-3xl text-white'>{t('contact.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='mb-4'>{t('contact.description')}</p>
            <Button variant='secondary' asChild>
              <a href={`mailto:${t('contact.email')}`} className='inline-flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                {t('contact.email')}
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className='border-t bg-white py-8'>
        <div className='container mx-auto px-4 text-center'>
          <p className='text-sm text-gray-600'>{t('footer.legal')}</p>
          <p className='text-xs text-gray-500 mt-2'>Logo designed by Andreea and Michael Afana</p>
          <Link href='/login' className='text-sm text-pink-600 hover:underline mt-2 inline-block'>
            {t('footer.piLogin')}
          </Link>
        </div>
      </footer>
    </div>
  );
}