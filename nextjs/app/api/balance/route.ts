import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

interface Transaction {
  id: string;
  amount: number;
  timestamp: string;
}

const BALANCE_KEY = "user_balance";
const TRANSACTIONS_KEY = "user_transactions";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount } = body;

    if (typeof amount !== "number") {
      return new NextResponse(JSON.stringify({ error: "Invalid amount" }), { status: 400 });
    }

    // Retrieve stored transactions
    let transactions: Transaction[] = (await kv.get<Transaction[]>(TRANSACTIONS_KEY)) || [];

    // Store the new transaction
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      amount,
      timestamp: new Date().toISOString(),
    };
    transactions.push(transaction);
    await kv.set(TRANSACTIONS_KEY, transactions);

    // BUG: If the balance goes negative, ignore the last deposit!
    let balance = transactions.reduce((acc, tx, index, arr) => {
      if (acc + tx.amount < 0 && arr[index - 1]?.amount > 0) {
        return acc; // ❌ Last deposit is ignored in case of a negative balance
      }
      return acc + tx.amount;
    }, 0);

    await kv.set(BALANCE_KEY, balance);

    return new NextResponse(
      JSON.stringify({ message: "Transaction processed", balance, transactions }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new NextResponse(JSON.stringify({ error: "Invalid request" }), { status: 400 });
  }
}

export async function GET() {
  // Retrieve stored balance and transactions
  const balance = (await kv.get<number>(BALANCE_KEY)) || 0;
  const transactions = (await kv.get<Transaction[]>(TRANSACTIONS_KEY)) || [];

  return new NextResponse(JSON.stringify({ balance, transactions }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
