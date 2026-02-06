import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// --- TOOLS ---
const TOOLS = {
    get_customers: (data, args) => {
        let type = args.type;
        const filtered = data.customers.filter(c => !type || c.type.toLowerCase() === type.toLowerCase());
        if (!filtered.length) return `No ${type || ''} customers found.`;
        return `Found ${filtered.length} customers: ` + filtered.map(c => `${c.name} (${c.id})`).join(', ');
    },
    get_balance: (data, args) => {
        const customerId = args.customerId?.toUpperCase();
        const accounts = customerId
            ? data.accounts.filter(a => a.customerId === customerId)
            : data.accounts;

        if (!accounts.length) return `No accounts found.`;

        return accounts.slice(0, 10).map(a => `${a.id} (${a.type}): ${a.currency} ${a.balance.toLocaleString()}`).join(', ') + (accounts.length > 10 ? "..." : "");
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
2. get_balance(customerId?: string) - Get account balances. If a customer ID (e.g. C001) is mentioned, use it. If "all" or general request, leave arguments empty.
3. get_transactions(accountId: string) - Get recent transactions for a specific account ID (e.g. A101001).

If the user asks something general (e.g. "Hi", "Help"), return { "intent": "chat", "reply": "..." }.
If the user asks for data, return { "intent": "tool_call", "tool": "tool_name", "args": { ... } }.

IMPORTANT: Output ONLY valid JSON.
`;

export async function POST(req) {
    try {
        const { message, data } = await req.json();

        // DEBUG: Specific Check
        if (!process.env.GEMINI_API_KEY) {
            // It is explicitly this check failing
            return runFallback(message, data, "Configuration Error: GEMINI_API_KEY is missing from Vercel Envs");
        }

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const chat = model.startChat({
                history: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }]
            });

            const result = await chat.sendMessage(message);
            const text = result.response.text();

            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiDecision = JSON.parse(jsonStr);

            if (aiDecision.intent === 'chat') {
                return NextResponse.json({ response: aiDecision.reply });
            }

            if (aiDecision.intent === 'tool_call' && TOOLS[aiDecision.tool]) {
                const toolResult = TOOLS[aiDecision.tool](data, aiDecision.args || {});
                return NextResponse.json({ response: toolResult });
            }
        } catch (innerError) {
            console.error("Gemini Logic Failed:", innerError);
            // This catches API errors (like 401 Unauthorized or Quota)
            return runFallback(message, data, `Gemini API Error: ${innerError.message}`);
        }

        return NextResponse.json({ response: "I'm not sure how to help with that specific request." });

    } catch (error) {
        console.error("Critical Error:", error);
        return NextResponse.json({ response: "System Error: " + error.message }, { status: 500 });
    }
}

function runFallback(message, data, debugInfo) {
    console.log("Running fallback. Reason:", debugInfo);
    const analysis = fallbackIntentParser(message);

    if (analysis.intent !== 'unknown' && TOOLS[analysis.intent]) {
        return NextResponse.json({
            response: TOOLS[analysis.intent](data, analysis.params) + `\n\n[DEBUG: ${debugInfo}]`
        });
    }

    return NextResponse.json({
        response: `I couldn't process that request with the AI Core.\nReason: ${debugInfo}`
    });
}

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
    if ((lower.includes('balance') || lower.includes('money'))) {
        return { intent: 'get_balance', params: { customerId } };
    }
    if (lower.includes('transaction') && accountId) {
        return { intent: 'get_transactions', params: { accountId } };
    }
    return { intent: 'unknown' };
}
