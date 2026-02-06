'use client'
import { useBanking } from '@/contexts/BankingContext'

export default function CustomerList({ type }) {
    const { data, setView, setSelectedCustomerId } = useBanking();
    // Default to 'Retail' if type is filtered, but if type is null show all? 
    // The prototype had explicit filters.

    // Logic: type "Retail" matches "Retail"
    // Logic: type "Corporate" matches "Corporate" or "SME"? The prompt separates them.

    const filtered = data.customers.filter(c => !type || c.type === type || (type === 'Corporate' && c.type === 'SME')); // Simple logic adjustment

    const handleView = (id) => {
        setSelectedCustomerId(id);
        setView('customer360');
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1>{type || 'All'} Customers</h1>
                <button className="btn btn-primary">+ New Customer</button>
            </div>
            <div className="card">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th><th>Name</th><th>Type</th><th>KYC Status</th><th>Risk</th><th>Net Worth</th><th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map(c => (
                                <tr key={c.id}>
                                    <td className="font-mono text-sm">{c.id}</td>
                                    <td className="font-medium">{c.name}</td>
                                    <td>{c.type}</td>
                                    <td>
                                        <span className={`badge ${c.kycStatus === 'Verified' ? 'badge-success' : 'badge-warning'}`}>
                                            {c.kycStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${c.risk === 'Low' ? 'badge-success' : (c.risk === 'High' ? 'badge-danger' : 'badge-warning')}`}>
                                            {c.risk}
                                        </span>
                                    </td>
                                    <td>${c.netWorth.toLocaleString()}</td>
                                    <td>
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleView(c.id)}>
                                            View 360
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="text-center p-6 text-secondary">No customers found for this sector.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
