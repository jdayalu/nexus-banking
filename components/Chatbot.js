'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Bot } from 'lucide-react'
import { useBanking } from '@/contexts/BankingContext'

export default function Chatbot() {
    const { data } = useBanking();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm Nexus AI. I can check balances, list customers, or find transactions.", sender: 'bot' }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI Response
        setTimeout(() => {
            const botResponse = generateResponse(input);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
            setIsTyping(false);
        }, 1200);
    };

    const generateResponse = (text) => {
        const lower = text.toLowerCase();

        // --- DATA QUERIES ---

        // 1. List Customers by Type (e.g. "Retail customers")
        if (lower.includes('customer')) {
            let type = null;
            if (lower.includes('retail')) type = 'Retail';
            if (lower.includes('corporate')) type = 'Corporate';
            if (lower.includes('sme')) type = 'SME';
            if (lower.includes('wealth')) type = 'Wealth';

            const filtered = data.customers.filter(c => !type || c.type === type || (type === 'Corporate' && c.type === 'SME'));

            if (filtered.length === 0) return `I couldn't find any ${type || ''} customers.`;

            const names = filtered.map(c => c.name).join(', ');
            return `I found ${filtered.length} ${type || ''} customers: ${names}.`;
        }

        // 2. Account Lookup by Customer ID (e.g. "accounts for C001")
        // Regex to catch C followed by numbers
        const idMatch = text.match(/C\d{3,4}/i);
        if ((lower.includes('account') || lower.includes('balance')) && idMatch) {
            const customerId = idMatch[0].toUpperCase();
            const accounts = data.accounts.filter(a => a.customerId === customerId);

            if (accounts.length === 0) return `No accounts found for customer ${customerId}.`;

            const details = accounts.map(a => `${a.type} (${a.currency} ${a.balance.toLocaleString()})`).join('\n');
            return `Customer ${customerId} has ${accounts.length} accounts:\n${details}`;
        }

        // 3. Transactions for Account (e.g. "transactions for A101001")
        const accMatch = text.match(/A\d{6}/i);
        if (lower.includes('transaction') && accMatch) {
            const accId = accMatch[0].toUpperCase();
            const txns = data.transactions.filter(t => t.accountId === accId).slice(0, 5);

            if (txns.length === 0) return `No recent transactions for account ${accId}.`;

            return `Recent transactions for ${accId}:\n` + txns.map(t => `- ${t.date}: ${t.desc} ($${Math.abs(t.amount)})`).join('\n');
        }

        // --- GENERAL QUERIES ---
        if (lower.includes('balance') || lower.includes('money')) return "You can view account balances on the Dashboard. To check a specific customer, ask 'balances for C001'.";
        if (lower.includes('transfer') || lower.includes('pay')) return "To make a transfer, use the 'Payments Hub' in the sidebar.";
        if (lower.includes('loan')) return "We offer Mortgage and Business loans. Ask 'show loans for C001' to see details.";
        if (lower.includes('card') || lower.includes('lost')) return "Call 1-800-NEXUS-HELP for lost cards.";

        return "I can help with checking customers, accounts, and transactions. Try asking 'Show retail customers' or 'Accounts for C001'.";
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    width: '350px',
                    height: '500px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                    border: '1px solid #e2e8f0',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem',
                        backgroundColor: '#2563eb', // primary
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <div style={{ background: 'white', color: '#2563eb', borderRadius: '50%', padding: '4px' }}><Bot size={16} /></div>
                            <span style={{ fontWeight: 600 }}>Nexus Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        backgroundColor: '#f8fafc'
                    }}>
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    maxWidth: '85%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    backgroundColor: msg.sender === 'user' ? '#2563eb' : 'white',
                                    color: msg.sender === 'user' ? 'white' : '#1e293b',
                                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                                    borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                                    borderBottomLeftRadius: msg.sender === 'bot' ? '2px' : '12px',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                <div style={{
                                    backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '0.5rem 1rem', borderRadius: '12px',
                                    fontSize: '0.8rem', color: '#64748b'
                                }}>
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{
                        padding: '1rem',
                        borderTop: '1px solid #e2e8f0',
                        backgroundColor: 'white',
                        display: 'flex',
                        gap: '0.5rem'
                    }}>
                        <input
                            style={{
                                flex: 1,
                                padding: '0.6rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim()} style={{
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0 0.8rem',
                            cursor: 'pointer',
                            opacity: input.trim() ? 1 : 0.5
                        }}>
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </button>
        </div>
    )
}
