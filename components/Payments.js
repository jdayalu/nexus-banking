'use client'
import { useBanking } from '@/contexts/BankingContext'
import { useState } from 'react'

export default function Payments() {
    const { data, addTransaction, addAudit } = useBanking();

    const handlePaymentSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const amount = parseFloat(formData.get('amount'));

        if (amount <= 0) return alert("Invalid amount");

        const txnId = "T" + Math.floor(Math.random() * 10000);
        const txn = {
            id: txnId,
            accountId: formData.get('fromAccount'),
            date: new Date().toISOString().split('T')[0],
            desc: `Transfer to ${formData.get('benName')}`,
            amount: -amount,
            type: formData.get('type'),
            status: amount > 10000 ? "Pending Auth" : "Posted"
        };

        addTransaction(txn);

        if (txn.status !== 'Posted') {
            alert("Payment Large (>10k): Sent for Approval");
        } else {
            alert("Payment Sent Successfully!");
        }

        // Reset form
        e.target.reset();
    }

    const approveTxn = (id) => {
        addAudit("Transaction Approved", `Ref: ${id}`);
    }

    return (
        <div>
            <h1>Payments Hub</h1>
            <p className="mb-4">Initiate and manage domestic and international transfers</p>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                <div className="card">
                    <div className="card-header"><h3>Initiate Transfer</h3></div>
                    <div className="card-body">
                        <form onSubmit={handlePaymentSubmit}>
                            <div className="form-group">
                                <label className="form-label">From Account</label>
                                <select className="form-control" name="fromAccount" required>
                                    {data.accounts.map(a => <option key={a.id} value={a.id}>{a.id} - {a.type} (${a.balance})</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label className="form-label">Beneficiary Name</label>
                                    <input type="text" className="form-control" name="benName" required placeholder="e.g. John Doe" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Beneficiary Account</label>
                                    <input type="text" className="form-control" name="benAccount" required placeholder="Account Number" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Amount (USD)</label>
                                <input type="number" className="form-control" name="amount" required min="1" step="0.01" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Payment Type</label>
                                <div className="flex gap-4 mt-2">
                                    <label className="flex items-center gap-2"><input type="radio" name="type" value="Wire" defaultChecked /> Wire</label>
                                    <label className="flex items-center gap-2"><input type="radio" name="type" value="ACH" /> ACH</label>
                                    <label className="flex items-center gap-2"><input type="radio" name="type" value="RTGS" /> RTGS</label>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-full">Verify & Send</button>
                        </form>
                    </div>
                </div>

                <div>
                    <div className="card">
                        <div className="card-header"><h3>Approval Queue</h3></div>
                        <div className="card-body">
                            {data.transactions.filter(t => t.status === 'Pending Auth').length > 0 ?
                                data.transactions.filter(t => t.status === 'Pending Auth').map(t => (
                                    <div key={t.id} style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '6px', marginBottom: '0.5rem' }}>
                                        <div className="text-sm text-secondary">{t.date}</div>
                                        <div className="fontWeight-600 my-1">${Math.abs(t.amount).toLocaleString()}</div>
                                        <div className="text-sm">{t.desc}</div>
                                        <div className="mt-2 flex gap-2">
                                            <button className="btn btn-sm btn-primary" onClick={() => approveTxn(t.id)}>Approve</button>
                                            <button className="btn btn-sm btn-danger">Reject</button>
                                        </div>
                                    </div>
                                )) : <div className="text-secondary text-sm">No pending approvals</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
