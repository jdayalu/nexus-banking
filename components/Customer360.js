'use client'
import { useBanking } from '@/contexts/BankingContext'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

export default function Customer360() {
    const { data, selectedCustomerId, setView, setSelectedAccountId } = useBanking();
    const c = data.customers.find(x => x.id === selectedCustomerId);
    const accounts = data.accounts.filter(a => a.customerId === c?.id);
    const loans = data.loans.filter(l => l.customerId === c?.id);
    const [tab, setTab] = useState('Overview');

    if (!c) return <div className="p-6">Customer not found. <button onClick={() => setView('dashboard')}>Go Home</button></div>;

    const handleAccountView = (id) => {
        setSelectedAccountId(id);
        setView('accountDetails');
    };

    return (
        <div>
            <div className="mb-4 cursor-pointer text-secondary flex items-center gap-2" onClick={() => setView('retail')}>
                <ArrowLeft size={16} /> Back to List
            </div>

            <div className="card mb-6">
                <div className="card-body flex gap-6 items-center">
                    <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500">
                        {c.name.charAt(0)}
                    </div>
                    <div>
                        <h1>{c.name}</h1>
                        <div className="flex gap-4 mt-2 text-sm text-secondary">
                            <span>ID: {c.id}</span>
                            <span>• {c.email}</span>
                            <span>• {c.phone}</span>
                        </div>
                    </div>
                    <div className="ml-auto text-right">
                        <span className={`badge ${c.risk === 'Low' ? 'badge-success' : 'badge-warning'}`}>Risk: {c.risk}</span>
                        <div className="mt-2 font-bold text-lg">Net Worth: ${c.netWorth.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            <div className="tabs">
                {['Overview', 'Accounts', 'Loans', 'Documents', 'KYC/AML'].map(t => (
                    <div key={t}
                        className={`tab-item ${tab === t ? 'active' : ''}`}
                        onClick={() => setTab(t)}>
                        {t} {(t === 'Accounts' && accounts.length > 0) ? `(${accounts.length})` : ''}
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Holdings Summary</h3>
                </div>
                <div className="card-body">
                    <div className="table-container">
                        <table>
                            <thead><tr><th>Account Number</th><th>Type</th><th>Currency</th><th>Balance</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {accounts.map(a => (
                                    <tr key={a.id}>
                                        <td className="font-mono">{a.id}</td>
                                        <td>{a.type}</td>
                                        <td>{a.currency}</td>
                                        <td className="font-semibold">${a.balance.toLocaleString()}</td>
                                        <td><span className="badge badge-success">{a.status}</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-secondary" onClick={() => handleAccountView(a.id)}>
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {loans.map(l => (
                                    <tr key={l.id}>
                                        <td className="font-mono">{l.id}</td>
                                        <td>{l.type}</td>
                                        <td>USD</td>
                                        <td className="text-danger">-${l.remaining.toLocaleString()} (Loan)</td>
                                        <td><span className="badge badge-warning">{l.status}</span></td>
                                        <td><button className="btn btn-sm btn-secondary">Details</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
