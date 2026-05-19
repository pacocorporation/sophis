import type {Metadata} from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Sophis Cloud | O SaaS da sua Farmácia',
  description: 'CRM + Omnichannel + IA Nanda + Automação para farmácias.',
  icons: {
    icon: '/logo_max.png',
    apple: '/logo_max.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${outfit.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
