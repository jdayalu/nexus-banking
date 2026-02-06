'use client'
import { useBanking } from '@/contexts/BankingContext'
import { useState } from 'react'
import { X } from 'lucide-react'

export default function CustomerList({ type }) {
    const { data, setView, setSelectedCustomerId, addCustomer } = useBanking();
    const [showModal, setShowModal] = useState(false);

    // Logic: type "Retail" matches "Retail"
    // Logic: type "Corporate" matches "Corporate" or "SME"? The prompt separates them.
    const filtered = data.customers.filter(c => !type || c.type === type || (type === 'Corporate' && c.type === 'SME'));

    const handleView = (id) => {
        setSelectedCustomerId(id);
        setView('customer360');
    }

    const handleAddCustomer = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newCustomer = {
            id: `C${Math.floor(Math.random() * 10000)}`,
            name: formData.get('name'),
            type: formData.get('type'), // Hidden field or select based on current view
            email: formData.get('email'),
            phone: formData.get('phone'),
            risk: 'Low', // Default
            kycStatus: 'Pending',
            netWorth: parseFloat(formData.get('netWorth')) || 0
        };
        addCustomer(newCustomer);
        setShowModal(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1>{type || 'All'} Customers</h1>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Customer</button>
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

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div className="card" style={{ width: 500, margin: 0, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
                        <div className="card-header">
                            <h3>Add New Customer</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleAddCustomer}>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input name="name" required className="form-control" placeholder="e.g. Jane Doe" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input name="email" type="email" required className="form-control" placeholder="jane@example.com" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input name="phone" required className="form-control" placeholder="+1 555..." />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Customer Type</label>
                                    <select name="type" className="form-control" defaultValue={type || 'Retail'}>
                                        <option value="Retail">Retail</option>
                                        <option value="Corporate">Corporate</option>
                                        <option value="SME">SME</option>
                                        <option value="Wealth">Wealth</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Initial Net Worth ($)</label>
                                    <input name="netWorth" type="number" className="form-control" placeholder="0.00" />
                                </div>
                                <div className="flex justify-end gap-2 mt-6">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Create Customer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
