import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI_Assistant',
  description: 'Created without love',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
