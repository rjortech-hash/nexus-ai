import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NEXUS AI - Your Personal Board of Advisors',
  description: 'AI-powered experts who know your story, guide your decisions, and evolve with you.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="w-full min-h-screen">
        <div className="w-full min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}