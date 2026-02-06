'use client'
import { useBanking } from '@/contexts/BankingContext'
import { ArrowLeft, Download } from 'lucide-react'

export default function AccountDetails() {
    const { data, selectedAccountId, setView, setSelectedCustomerId } = useBanking();
    const acc = data.accounts.find(a => a.id === selectedAccountId);
    const txns = data.transactions.filter(t => t.accountId === acc?.id);

    if (!acc) return <div>Account not found</div>;

    return (
        <div>
            <div className="mb-4 cursor-pointer text-primary flex items-center gap-2" onClick={() => {
                setSelectedCustomerId(acc.customerId);
                setView('customer360');
            }}>
                <ArrowLeft size={16} /> Back to Customer
            </div>

            <div className="card mb-6">
                <div className="card-body">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-secondary text-base font-medium uppercase">{acc.type} Account</h2>
                            <h1 className="text-4xl font-bold my-2">${acc.balance.toLocaleString()} <span className="text-base text-secondary">{acc.currency}</span></h1>
                            <div className="font-mono text-sm text-secondary">{acc.id}</div>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-secondary">Statement</button>
                            <button className="btn btn-secondary">Settings</button>
                            <button className="btn btn-primary" onClick={() => setView('payments')}>Transfer Funds</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Transactions</h3>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Filter..." className="form-control" style={{ width: 200, padding: '0.25rem 0.5rem' }} />
                        <button className="btn btn-sm btn-secondary" onClick={() => alert('Exporting CSV...')}>
                            <Download size={14} /> Export
                        </button>
                    </div>
                </div>
                <div className="table-container">
                    <table>
                        <thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Status</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
                        <tbody>
                            {txns.map(t => (
                                <tr key={t.id}>
                                    <td>{t.date}</td>
                                    <td>
                                        {t.desc}
                                        <div className="text-xs text-secondary">Ref: {t.id}</div>
                                    </td>
                                    <td>{t.type}</td>
                                    <td><span className={`badge ${t.status === 'Posted' ? 'badge-neutral' : 'badge-warning'}`}>{t.status}</span></td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: t.amount > 0 ? 'var(--success)' : 'var(--text-main)' }}>
                                        {t.amount > 0 ? '+' : ''}${Math.abs(t.amount).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
