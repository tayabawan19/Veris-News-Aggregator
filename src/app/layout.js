import { Newsreader, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata = {
  title: 'Veris — AI-Powered Regional Newsroom',
  description: 'Real-time regional news aggregation powered by Express, Supabase caching, and Google Gemini AI.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FAFAF8] text-[#1A1A1A] font-sans selection:bg-[#2456C9] selection:text-white">
        {children}
      </body>
    </html>
  );
}
