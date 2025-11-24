import createMiddleware from 'next-intl/middleware';
import {routing} from './src/i18n/routing';

// This middleware enables internationalization support in Next.js
export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',

    // Also match the root and locale-prefixed paths
    '/',
    '/(en|fr)/:path*',
  ],
};
