import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/lib/LanguageContext'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'JAM OPS',
  description: 'JAM Receipt Tracker — AR and Canvas operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <LanguageProvider>
          <Navigation />
          <main className="pt-14 min-h-screen">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  )
}
