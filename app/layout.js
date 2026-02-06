import './globals.css'
import { BankingProvider } from '@/contexts/BankingContext'

export const metadata = {
    title: 'Nexus Core Banking',
    description: 'Next.js functionality prototype',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <BankingProvider>
                    {children}
                </BankingProvider>
            </body>
        </html>
    )
}
