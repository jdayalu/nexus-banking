'use client'
import { useBanking } from '@/contexts/BankingContext'
import { Search, Bell, RotateCcw } from 'lucide-react'

export default function TopNav() {
    const { userRole, setUserRole, resetData, data } = useBanking();

    const toggleRole = () => {
        const roles = ['admin', 'teller', 'manager'];
        const currentIdx = roles.indexOf(userRole);
        const next = roles[(currentIdx + 1) % roles.length];
        setUserRole(next);
    };

    return (
        <div className="top-nav">
            <div className="search-bar">
                <Search className="search-icon" size={16} />
                <input type="text" className="search-input" placeholder="Global search..." />
            </div>
            <div className="nav-actions">
                <div className="role-badge" onClick={toggleRole}>
                    <span>👤 {data.currentUser?.name || 'User'}</span>
                    <span style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px' }}>
                        {userRole.toUpperCase()}
                    </span>
                </div>
                <button className="btn btn-sm btn-secondary" onClick={resetData}>
                    <RotateCcw size={14} /> Reset
                </button>
                <div style={{ position: 'relative', cursor: 'pointer' }}>
                    <Bell size={20} />
                    <span style={{ position: 'absolute', top: -2, right: -2, background: 'red', width: 8, height: 8, borderRadius: '50%' }}></span>
                </div>
            </div>
        </div>
    )
}
