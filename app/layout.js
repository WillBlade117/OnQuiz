import Head from "next/head";
import Header from "./components/Header";
import { Inter } from 'next/font/google';
import "./globals.css";

export const metadata = {
  title: 'OnQuiz - Application de Quiz Interactive | William Sart',
  description: 'OnQuiz est une application web interactive permettant aux utilisateurs de tester leurs connaissances sur divers thèmes.',
  keywords: 'quiz, application quiz, OnQuiz, William Sart',
  authors: [{ name: 'William Sart' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    url: 'https://www.onquiz.william-sart.fr',
    title: 'OnQuiz - Application de Quiz Interactive | William Sart',
    description: 'OnQuiz est une application web interactive permettant aux utilisateurs de tester leurs connaissances sur divers thèmes.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnQuiz - Application de Quiz Interactive | William Sart',
    description: 'OnQuiz est une application web interactive permettant aux utilisateurs de tester leurs connaissances sur divers thèmes.',
  },
};

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${inter.variable}`}>
      <Head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href="https://www.onquiz.william-sart.fr" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.onquiz.william-sart.fr" />
      <meta property="og:title" content="OnQuiz - Application de Quiz Interactive | William Sart" />
      <meta property="og:description" content="OnQuiz est une application web interactive permettant aux utilisateurs de tester leurs connaissances sur divers thèmes." />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="OnQuiz - Application de Quiz Interactive | William Sart" />
      <meta name="twitter:description" content="OnQuiz est une application web interactive permettant aux utilisateurs de tester leurs connaissances sur divers thèmes." />
      </Head>
      <body className="bg-gray-100 text-gray-900">
        <Header />
        {children}
      </body>
    </html>
  );
}