import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'
import { InitData } from '@/components/init/init-data'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BrewMaster Cafe | Premium Coffee Experience',
  description: 'Experience the finest artisan coffee and gourmet breakfast at BrewMaster Cafe. Order online, manage tables, and enjoy premium service.',
  keywords: ['coffee shop', 'cafe', 'artisan coffee', 'breakfast', 'espresso', 'latte'],
}

export const viewport: Viewport = {
  themeColor: '#2d1810',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
        <InitData />
        {children}
        <Toaster 
          position="top-right" 
          richColors 
          theme="dark"
          toastOptions={{
            style: {
              background: 'oklch(0.16 0.02 50)',
              border: '1px solid oklch(0.28 0.03 50)',
              color: 'oklch(0.95 0.01 80)',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
