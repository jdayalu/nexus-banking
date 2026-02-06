import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// --- TOOLS ---
// These are functions the AI can "call" (or we simulate it calling)
const TOOLS = {
    get_customers: (data, args) => {
        let type = args.type;
        const filtered = data.customers.filter(c => !type || c.type.toLowerCase() === type.toLowerCase());
        if (!filtered.length) return `No ${type || ''} customers found.`;
        return `Found ${filtered.length} customers: ` + filtered.map(c => `${c.name} (${c.id})`).join(', ');
    },
    get_balance: (data, args) => {
        const customerId = args.customerId?.toUpperCase();
        const accounts = data.accounts.filter(a => a.customerId === customerId);
        if (!accounts.length) return `No accounts found for customer ${customerId}.`;
        return accounts.map(a => `${a.id} (${a.type}): ${a.currency} ${a.balance.toLocaleString()}`).join(', ');
    },
    get_transactions: (data, args) => {
        const accountId = args.accountId?.toUpperCase();
        const txns = data.transactions.filter(t => t.accountId === accountId).slice(0, 5);
        if (!txns.length) return `No transactions found for account ${accountId}.`;
        return txns.map(t => `${t.date}: ${t.desc} ($${Math.abs(t.amount)})`).join('\n');
    }
};

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
You are Nexus AI, a banking assistant. You have access to the user's banking data.
Your job is to identify what the user wants and output a JSON object representing the tool to call.

Available Tools:
1. get_customers(type?: string) - List customers. Type can be 'Retail', 'Corporate', 'SME', 'Wealth'.
2. get_balance(customerId: string) - Get account balances for a specific customer ID (e.g. C001).
3. get_transactions(accountId: string) - Get recent transactions for a specific account ID (e.g. A101001).

If the user asks something general (e.g. "Hi", "Help"), return { "intent": "chat", "reply": "..." }.
If the user asks for data, return { "intent": "tool_call", "tool": "tool_name", "args": { ... } }.

Example 1: "Show retail customers" -> { "intent": "tool_call", "tool": "get_customers", "args": { "type": "Retail" } }
Example 2: "Balance for C001" -> { "intent": "tool_call", "tool": "get_balance", "args": { "customerId": "C001" } }
Example 3: "What did I spend in A101001?" -> { "intent": "tool_call", "tool": "get_transactions", "args": { "accountId": "A101001" } }

IMPORTANT: Output ONLY valid JSON.
`;

export async function POST(req) {
    try {
        const { message, data } = await req.json();

        // 1. If key is missing, fall back to regex logic (Hybrid Mode)
        if (!genAI) {
            console.log("Gemini API Key missing, falling back to regex.");
            const analysis = fallbackIntentParser(message);
            if (analysis.intent !== 'unknown' && TOOLS[analysis.intent]) {
                return NextResponse.json({ response: TOOLS[analysis.intent](data, analysis.params) });
            }
            return NextResponse.json({ response: "I'm a demo bot (Gemini Key missing). Try asking 'Balance for C001'." });
        }

        // 2. Use Gemini to parse intent
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
            history: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }]
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();

        // Clean JSON formatting (sometimes LLMs add markdown code blocks)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        let aiDecision;
        try {
            aiDecision = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", text);
            return NextResponse.json({ response: "I understood, but had trouble processing the response." });
        }

        // 3. Execute Decision
        if (aiDecision.intent === 'chat') {
            return NextResponse.json({ response: aiDecision.reply });
        }

        if (aiDecision.intent === 'tool_call' && TOOLS[aiDecision.tool]) {
            const toolResult = TOOLS[aiDecision.tool](data, aiDecision.args);
            // Optional: Feed result back to Gemini to summarize? 
            // For latency speed, we return the raw data summary directly.
            return NextResponse.json({ response: toolResult });
        }

        return NextResponse.json({ response: "I'm not sure how to help with that specific request." });

    } catch (error) {
        console.error("Gemini Error:", error);
        return NextResponse.json({ response: "System Error: Unable to contact AI Core." }, { status: 500 });
    }
}

// Keep the regex parser as a sturdy backup
function fallbackIntentParser(message) {
    const lower = message.toLowerCase();
    const customerId = (message.match(/C\d{3,4}/i) || [])[0]?.toUpperCase();
    const accountId = (message.match(/A\d{6}/i) || [])[0]?.toUpperCase();

    if (lower.includes('customer') || lower.includes('list')) {
        let type = null;
        if (lower.includes('retail')) type = 'Retail';
        if (lower.includes('corporate')) type = 'Corporate';
        return { intent: 'get_customers', params: { type } };
    }
    if ((lower.includes('balance') || lower.includes('money')) && customerId) {
        return { intent: 'get_balance', params: { customerId } };
    }
    if (lower.includes('transaction') && accountId) {
        return { intent: 'get_transactions', params: { accountId } };
    }
    return { intent: 'unknown' };
}
