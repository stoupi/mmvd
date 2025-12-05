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
        <div className='flex justify-center mb-8'>
          <Image
            src='/logo.png'
            alt='MMVD Logo'
            width={70}
            height={96}
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
          <Button size='lg' variant='outline' asChild>
            <a
              href='https://clinicaltrials.gov/study/NCT06235385'
              target='_blank'
              rel='noopener noreferrer'
              className='whitespace-pre-line text-center bg-white text-pink-600 border-2 border-pink-600 hover:bg-pink-50 px-8 py-6 min-w-[300px]'
            >
              {t('hero.clinicalTrialsButton')}
            </a>
          </Button>
        </div>
      </section>

      {/* Global Network Section */}
      <section className='container mx-auto px-4 py-16'>
        <div className='text-center mb-8'>
          <h2 className='text-4xl font-bold mb-4'>
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-primary to-pink-500'>
              Our Global Network
            </span>
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            MMVD Study spans multiple countries and medical centres worldwide, creating one of the largest multicohort studies on valvular diseases.
          </p>
        </div>
        <MapStats
          totalCentres={mapData.totalCentres}
          totalPatients={mapData.totalPatients}
          totalCountries={Object.keys(mapData.statsByCountry).length}
        />
        <WorldMap data={mapData} />
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
          <Link href='/login' className='text-sm text-pink-600 hover:underline mt-2 inline-block'>
            {t('footer.piLogin')}
          </Link>
        </div>
      </footer>
    </div>
  );
}