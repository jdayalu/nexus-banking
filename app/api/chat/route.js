import { NextResponse } from 'next/server';

// This acts as the "Tool Implementation" layer. 
// In a real LLM app, the AI would decide to call these functions.
const TOOLS = {
    get_customers: (data, { type }) => {
        const filtered = data.customers.filter(c => !type || c.type.toLowerCase() === type.toLowerCase());
        if (!filtered.length) return `No ${type || ''} customers found.`;
        return `Found ${filtered.length} customers: ` + filtered.map(c => c.name).join(', ');
    },
    get_balance: (data, { customerId }) => {
        const accounts = data.accounts.filter(a => a.customerId === customerId);
        if (!accounts.length) return `No accounts found for ${customerId}.`;
        return accounts.map(a => `${a.type}: ${a.currency} ${a.balance.toLocaleString()}`).join('\n');
    },
    get_transactions: (data, { accountId }) => {
        const txns = data.transactions.filter(t => t.accountId === accountId).slice(0, 5);
        if (!txns.length) return `No transactions found for ${accountId}.`;
        return txns.map(t => `${t.date}: ${t.desc} ($${Math.abs(t.amount)})`).join('\n');
    }
};

// SIMULATED LLM ROUTER
// This replaces the simple regex with a structure that mimics how an AI "thinks"
// Parsing Intent -> Extracting Entities -> Calling Tools
function determineIntent(message) {
    const lower = message.toLowerCase();

    // ENTITY EXTRACTION (Simulated NER)
    const customerId = (message.match(/C\d{3,4}/i) || [])[0]?.toUpperCase();
    const accountId = (message.match(/A\d{6}/i) || [])[0]?.toUpperCase();

    // INTENT RECOGNITION
    if (lower.includes('customer') || lower.includes('list') || lower.includes('show people')) {
        let type = null;
        if (lower.includes('retail')) type = 'Retail';
        if (lower.includes('corporate')) type = 'Corporate';
        return { intent: 'get_customers', params: { type } };
    }

    if ((lower.includes('balance') || lower.includes('money') || lower.includes('how much')) && customerId) {
        return { intent: 'get_balance', params: { customerId } };
    }

    if ((lower.includes('transaction') || lower.includes('spent') || lower.includes('history')) && accountId) {
        return { intent: 'get_transactions', params: { accountId } };
    }

    return { intent: 'unknown' };
}

export async function POST(req) {
    try {
        const { message, context, data } = await req.json(); // client sends current mock data snippet

        // 1. [FUTURE AI INTEGRATION POINT] 
        // Here you would send 'message' + 'context' to OpenAI.
        // const completion = await openai.chat.completions.create({ ... })

        // 2. INTERNAL LOGIC (The "Mock AI")
        const analysis = determineIntent(message);

        let responseText = "";

        if (analysis.intent !== 'unknown' && TOOLS[analysis.intent]) {
            // Execute Tool
            responseText = TOOLS[analysis.intent](data, analysis.params);
        } else {
            // Fallback Logic
            if (message.toLowerCase().includes('help')) {
                responseText = "I can help you list customers (e.g., 'Show retail customers'), check balances (e.g., 'Balance for C001'), or find transactions (e.g., 'Txns for A101001').";
            } else {
                responseText = "I'm not sure how to handle that yet. Try asking for specific customer or account details (include IDs like C001 or A101001).";
            }
        }

        return NextResponse.json({ response: responseText });

    } catch (error) {
        return NextResponse.json({ response: "My brain encountered an error." }, { status: 500 });
    }
}
