'use client'
import { useBanking } from '@/contexts/BankingContext'
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const { data } = useBanking();
    const totalAssets = data.accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const pendingTxns = data.transactions.filter(t => t.status === 'Pending Auth').length;

    // Simple animation for bars
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const chartData = [45, 78, 30, 90, 110, 85, 60, 40];
    const maxVal = Math.max(...chartData);

    return (
        <div>
            <h1 className="mb-2">Executive Dashboard</h1>
            <p className="mb-6 text-secondary">Real-time overview of bank operations</p>

            <div className="grid-dashboard">
                <div className="card stat-card">
                    <div className="stat-label">Total Assets</div>
                    <div className="stat-value">${(totalAssets / 1000000).toFixed(2)}M</div>
                    <div className="stat-trend text-success">▲ 4.5% vs last month</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Active Customers</div>
                    <div className="stat-value">{data.customers.length}</div>
                    <div className="stat-trend text-success">▲ 12 this week</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">Pending Approvals</div>
                    <div className="stat-value">{pendingTxns}</div>
                    <div className={`stat-trend ${pendingTxns > 0 ? 'text-danger' : 'text-success'}`}>
                        {pendingTxns > 2 ? 'Requires Attention' : 'Normal'}
                    </div>
                </div>
                <div className="card stat-card">
                    <div className="stat-label">System Health</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>99.99%</div>
                    <div className="stat-trend">All systems operational</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <div className="card-header">
                        <h3>Transaction Volume (Last 24h)</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            {chartData.map((val, i) => (
                                <div key={i} className="bar" style={{ height: mounted ? `${(val / maxVal) * 100}%` : '0%' }}>
                                    <div className="bar-tooltip">{val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">
                        <h3>Recent Audit Log</h3>
                    </div>
                    <div className="card-body">
                        <div className="timeline">
                            {data.auditLog.slice(0, 5).map((log, i) => (
                                <div key={i} className="timeline-item">
                                    <div className="timeline-date">{log.time.split(' ')[1]}</div>
                                    <div className="font-medium text-sm">{log.action}</div>
                                    <div className="text-xs text-secondary">{log.details}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
