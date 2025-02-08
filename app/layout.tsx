import './globals.css';

import { Viewport } from 'next';

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' translate='no' suppressHydrationWarning>
      <body
        className='c_darkmode bg-white dark:bg-black text-color-primary overscroll-none'
      >
        {children}
      </body>
    </html>
  );
}
