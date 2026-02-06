'use client'
import { createContext, useContext, useState } from 'react';
import { SEED_DATA } from '@/lib/mockData';

const BankingContext = createContext();

export function BankingProvider({ children }) {
    // Deep copy seed data to allow mutation without affecting original import
    const [data, setData] = useState(JSON.parse(JSON.stringify(SEED_DATA)));

    // UI State
    const [view, setView] = useState('dashboard');
    const [userRole, setUserRole] = useState('admin');
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [selectedAccountId, setSelectedAccountId] = useState(null);

    const resetData = () => {
        setData(JSON.parse(JSON.stringify(SEED_DATA)));
        console.log("Data reset");
    };

    const addAudit = (action, details) => {
        const newLog = {
            time: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: data.currentUser.name,
            action,
            details
        };
        setData(prev => ({
            ...prev,
            auditLog: [newLog, ...prev.auditLog]
        }));
    };

    const addTransaction = (txn) => {
        setData(prev => {
            const newData = JSON.parse(JSON.stringify(prev));
            newData.transactions.unshift(txn);

            // Update balance if posted
            if (txn.status === 'Posted') {
                const acc = newData.accounts.find(a => a.id === txn.accountId);
                if (acc) acc.balance += txn.amount; // amount is negative for debit
            }
            return newData;
        });
        addAudit("Transaction Created", `Ref: ${txn.id}, Amount: ${txn.amount}`);
    };

    return (
        <BankingContext.Provider value={{
            data, setData,
            view, setView,
            userRole, setUserRole,
            selectedCustomerId, setSelectedCustomerId,
            selectedAccountId, setSelectedAccountId,
            resetData, addAudit, addTransaction
        }}>
            {children}
        </BankingContext.Provider>
    );
}

export const useBanking = () => useContext(BankingContext);
