'use client'
import { useBanking } from '@/contexts/BankingContext'
import {
    LayoutDashboard, Users, Building, Wallet, CreditCard, ShieldAlert,
    FileText, Briefcase, Settings, Landmark, PieChart
} from 'lucide-react'

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { category: 'Lines of Business' },
    { id: 'retail', label: 'Retail Banking', icon: Users },
    { id: 'sme', label: 'SME / Business', icon: Building },
    { id: 'corporate', label: 'Corporate', icon: Briefcase },
    { id: 'wealth', label: 'Wealth & Invest', icon: PieChart },
    { id: 'payments', label: 'Payments Hub', icon: Wallet },
    { id: 'trade', label: 'Trade Finance', icon: Landmark },
    { category: 'Operations' },
    { id: 'admin', label: 'Admin / Config', icon: Settings }
];

export default function Sidebar() {
    const { view, setView } = useBanking();

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">N</div>
                <div className="font-bold text-lg select-none">NEXUS CORE</div>
            </div>
            <div className="nav-scroll">
                {NAV_ITEMS.map((item, idx) => {
                    if (item.category) return <div key={idx} className="nav-category">{item.category}</div>;
                    const Icon = item.icon;
                    return (
                        <div key={item.id}
                            className={`nav-item ${view === item.id ? 'active' : ''}`}
                            onClick={() => setView(item.id)}>
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}
