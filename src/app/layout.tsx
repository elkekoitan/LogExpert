import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LogExpert - Advanced Log Management & Monitoring',
  description: 'Professional log management, incident tracking, and application monitoring platform for modern development teams.',
  keywords: ['logs', 'monitoring', 'incidents', 'devops', 'observability'],
  authors: [{ name: 'LogExpert Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#6A5AF9',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'LogExpert - Advanced Log Management & Monitoring',
    description: 'Professional log management, incident tracking, and application monitoring platform for modern development teams.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LogExpert - Advanced Log Management & Monitoring',
    description: 'Professional log management, incident tracking, and application monitoring platform for modern development teams.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div id="root" className="min-h-screen bg-background-primary">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  )
}
