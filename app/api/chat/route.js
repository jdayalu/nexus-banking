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
        // Allow querying ALL accounts if no ID is specific
        const accounts = customerId
            ? data.accounts.filter(a => a.customerId === customerId)
            : data.accounts; // Return all if no ID

        if (!accounts.length) return `No accounts found.`;

        // Limit to 10 to avoid token overflow
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

Example 1: "Show retail customers" -> { "intent": "tool_call", "tool": "get_customers", "args": { "type": "Retail" } }
Example 2: "Balance for C001" -> { "intent": "tool_call", "tool": "get_balance", "args": { "customerId": "C001" } }
Example 3: "All balances" -> { "intent": "tool_call", "tool": "get_balance", "args": {} }

IMPORTANT: Output ONLY valid JSON.
`;

export async function POST(req) {
    try {
        const { message, data } = await req.json();

        // 1. Fallback if no key (or empty string key)
        if (!process.env.GEMINI_API_KEY) {
            return runFallback(message, data, "Gemini Key Not Configured");
        }

        try {
            // 2. Use Gemini to parse intent
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const chat = model.startChat({
                history: [{ role: "user", parts: [{ text: SYSTEM_PROMPT }] }]
            });

            const result = await chat.sendMessage(message);
            const text = result.response.text();

            // Clean JSON logic
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiDecision = JSON.parse(jsonStr);

            // 3. Execute Decision
            if (aiDecision.intent === 'chat') {
                return NextResponse.json({ response: aiDecision.reply });
            }

            if (aiDecision.intent === 'tool_call' && TOOLS[aiDecision.tool]) {
                const toolResult = TOOLS[aiDecision.tool](data, aiDecision.args || {});
                return NextResponse.json({ response: toolResult });
            }
        } catch (innerError) {
            console.error("Gemini Logic Failed:", innerError);
            // If Gemini fails (Quota, Key, JSON Parse), fall back to Regex
            return runFallback(message, data, `AI Error: ${innerError.message}`);
        }

        return NextResponse.json({ response: "I'm not sure how to help with that specific request." });

    } catch (error) {
        console.error("Critical Error:", error);
        return NextResponse.json({ response: "System Error: " + error.message }, { status: 500 });
    }
}

// Robust Backup Parser
function runFallback(message, data, debugInfo) {
    console.log("Running fallback. Reason:", debugInfo);
    const analysis = fallbackIntentParser(message);

    if (analysis.intent !== 'unknown' && TOOLS[analysis.intent]) {
        return NextResponse.json({
            response: TOOLS[analysis.intent](data, analysis.params) + (debugInfo ? ` [Fallback Mode]` : "")
        });
    }

    return NextResponse.json({
        response: `I couldn't process that request with the AI Core (${debugInfo}). Try simpler queries like 'Balance for C001'.`
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
    // Updated fallback to handle "all balances" loosely if no ID
    if ((lower.includes('balance') || lower.includes('money'))) {
        return { intent: 'get_balance', params: { customerId } };
    }
    if (lower.includes('transaction') && accountId) {
        return { intent: 'get_transactions', params: { accountId } };
    }
    return { intent: 'unknown' };
}
