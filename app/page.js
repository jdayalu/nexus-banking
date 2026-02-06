'use client'
import { useBanking } from '@/contexts/BankingContext'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import Dashboard from '@/components/Dashboard'
import CustomerList from '@/components/CustomerList'
import Customer360 from '@/components/Customer360'
import AccountDetails from '@/components/AccountDetails'
import Payments from '@/components/Payments'
import Chatbot from '@/components/Chatbot'

export default function Home() {
    const { view } = useBanking()

    const renderContent = () => {
        switch (view) {
            case 'dashboard': return <Dashboard />
            case 'retail': return <CustomerList type="Retail" />
            case 'corporate': return <CustomerList type="Corporate" />
            case 'sme': return <CustomerList type="SME" />
            case 'wealth': return <CustomerList type="Wealth" />
            case 'customer360': return <Customer360 />
            case 'accountDetails': return <AccountDetails />
            case 'payments': return <Payments />
            // Add placeholders for others
            case 'loans':
            case 'lending':
            case 'trade':
            case 'treasury':
            case 'branch':
            case 'backoffice':
            case 'risk':
            case 'reporting':
            case 'admin':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center text-secondary" style={{ minHeight: '60vh' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.2 }}>🚧</div>
                        <h1>{view.charAt(0).toUpperCase() + view.slice(1)} Module</h1>
                        <p style={{ maxWidth: 400, marginTop: '0.5rem' }}>This module is part of the comprehensive suite but not fully hydrated in this demo.</p>
                    </div>
                )
            default: return <Dashboard />
        }
    }

    return (
        <main className="app-container">
            <Sidebar />
            <div className="main-wrapper">
                <TopNav />
                <div className="content-area">
                    {renderContent()}
                </div>
            </div>
            <Chatbot />
        </main>
    )
}
