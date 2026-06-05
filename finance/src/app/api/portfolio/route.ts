import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPortfolio } from "@/lib/data";

// GET /api/portfolio — holdings enriched with the latest closing price and
// their computed value, plus a grand total.
export async function GET() {
  const portfolio = await getPortfolio();
  return NextResponse.json(portfolio);
}

// POST /api/portfolio — upsert a holding by ticker.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ticker = String(body.ticker ?? "").trim().toUpperCase();
    const shares = Number(body.shares);

    if (!ticker || !Number.isFinite(shares) || shares <= 0) {
      return NextResponse.json(
        { error: "A valid ticker and a positive share count are required." },
        { status: 400 },
      );
    }

    const holding = await prisma.stockHolding.upsert({
      where: { ticker },
      update: { shares },
      create: { ticker, shares },
    });

    return NextResponse.json(holding, { status: 201 });
  } catch (error) {
    console.error("Failed to upsert holding:", error);
    return NextResponse.json(
      { error: "Failed to save holding." },
      { status: 500 },
    );
  }
}
