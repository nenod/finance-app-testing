import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTransactions } from "@/lib/data";

// GET /api/transactions — all transactions, newest first.
export async function GET() {
  const transactions = await getTransactions();
  return NextResponse.json(transactions);
}

// POST /api/transactions — create a transaction.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, category, description, date, isSubscription } = body;

    if (!type || amount === undefined || amount === null || !category || !date) {
      return NextResponse.json(
        { error: "type, amount, category and date are required." },
        { status: 400 },
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        type: String(type),
        amount: Number(amount),
        category: String(category),
        description: description ? String(description) : null,
        date: new Date(date),
        isSubscription: Boolean(isSubscription),
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return NextResponse.json(
      { error: "Failed to create transaction." },
      { status: 500 },
    );
  }
}
