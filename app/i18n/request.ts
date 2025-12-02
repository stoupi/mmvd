import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async () => {
  // Since we're using localePrefix: 'never', always use the default locale
  const locale = routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});