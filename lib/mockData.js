export const SEED_DATA = {
    currentUser: { name: "Alex Admin", role: "Administrator", avatar: "AA" },
    customers: [
        { id: "C001", name: "John Doe", type: "Retail", email: "john@example.com", phone: "+1-555-0101", risk: "Low", kycStatus: "Verified", netWorth: 154000 },
        { id: "C002", name: "Acme Corp International", type: "Corporate", email: "contact@acme.com", phone: "+1-555-0999", risk: "Medium", kycStatus: "Review Needed", netWorth: 5400000 },
        { id: "C003", name: "Sarah Smith", type: "Retail", email: "sarah@example.com", phone: "+1-555-0102", risk: "Low", kycStatus: "Verified", netWorth: 85000 },
        { id: "C004", name: "TechStart Inc", type: "SME", email: "info@techstart.io", phone: "+1-555-0888", risk: "High", kycStatus: "Verified", netWorth: 1200000 },
    ],
    accounts: [
        { id: "A101001", customerId: "C001", type: "Checking", currency: "USD", balance: 5420.50, status: "Active" },
        { id: "A101002", customerId: "C001", type: "Savings", currency: "USD", balance: 25000.00, status: "Active" },
        { id: "A202001", customerId: "C002", type: "Corporate Operating", currency: "USD", balance: 1250000.00, status: "Active" },
        { id: "A202002", customerId: "C002", type: "Trade Finance", currency: "EUR", balance: 450000.00, status: "Active" },
        { id: "A303001", customerId: "C003", type: "Checking", currency: "USD", balance: 1200.00, status: "Active" },
    ],
    loans: [
        { id: "L9001", customerId: "C001", type: "Mortgage", amount: 350000, remaining: 342000, status: "Active", nextPayment: "2024-03-01" },
        { id: "L9002", customerId: "C004", type: "Business Loan", amount: 100000, remaining: 95000, status: "Active", nextPayment: "2024-02-28" }
    ],
    transactions: [
        { id: "T5510", accountId: "A101001", date: "2024-02-24", desc: "Grocery Store", amount: -150.00, type: "Debit", status: "Posted" },
        { id: "T5511", accountId: "A101001", date: "2024-02-23", desc: "Payroll Deposit", amount: 3200.00, type: "Credit", status: "Posted" },
        { id: "T5512", accountId: "A202001", date: "2024-02-24", desc: "Vendor Payment #442", amount: -12500.00, type: "Debit", status: "Pending Auth" },
    ],
    alerts: [
        { id: "AL-991", severity: "High", type: "AML Watchlist", entity: "C004", description: "Name match on new sanction list", date: "2024-02-25", status: "Open" },
        { id: "AL-992", severity: "Medium", type: "Structuring", entity: "A101001", description: "Multiple deposits just under $10k", date: "2024-02-20", status: "Investigating" }
    ],
    auditLog: [
        { time: "2024-02-25 09:00:00", user: "System", action: "Daily Batch", details: "EOD Processing Complete" }
    ]
};
