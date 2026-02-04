import './globals.css'

export const metadata = {
  title: 'MassWord - Mass Report System',
  description: 'Telegram Mass Reporting System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
