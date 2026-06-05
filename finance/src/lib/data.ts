import { prisma } from "@/lib/prisma";
import yahooFinance from "@/lib/yahoo";

export interface TransactionDTO {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  isSubscription: boolean;
}

export interface PortfolioPosition {
  id: string;
  ticker: string;
  shares: number;
  price: number;
  value: number;
  currency: string;
}

export interface Portfolio {
  positions: PortfolioPosition[];
  totalValue: number;
}

// All transactions, newest first, serialized for the client.
export async function getTransactions(): Promise<TransactionDTO[]> {
  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
  });
  return transactions.map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date.toISOString(),
    isSubscription: t.isSubscription,
  }));
}

// Holdings enriched with the latest closing price + computed value.
export async function getPortfolio(): Promise<Portfolio> {
  const holdings = await prisma.stockHolding.findMany({
    orderBy: { ticker: "asc" },
  });

  const positions: PortfolioPosition[] = await Promise.all(
    holdings.map(async (holding) => {
      let price = 0;
      let currency = "USD";
      try {
        const quote = await yahooFinance.quote(holding.ticker);
        // Latest daily close (per spec / user choice), falling back to the
        // live price only if a previous close isn't available.
        price = quote.regularMarketPreviousClose ?? quote.regularMarketPrice ?? 0;
        currency = quote.currency ?? "USD";
      } catch (error) {
        console.warn(
          `Failed to fetch quote for ${holding.ticker}; using price 0.`,
          error,
        );
      }

      return {
        id: holding.id,
        ticker: holding.ticker,
        shares: holding.shares,
        price,
        value: price * holding.shares,
        currency,
      };
    }),
  );

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  return { positions, totalValue };
}

// Net fiat balance = income - expense.
export function computeFiatBalance(transactions: TransactionDTO[]): number {
  return transactions.reduce((balance, t) => {
    return t.type === "INCOME" ? balance + t.amount : balance - t.amount;
  }, 0);
}

// Current-month expenses grouped by category (for the pie chart).
export function expensesByCategoryThisMonth(
  transactions: TransactionDTO[],
): { category: string; total: number }[] {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "EXPENSE") continue;
    const d = new Date(t.date);
    if (d.getMonth() !== month || d.getFullYear() !== year) continue;
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }

  return Array.from(totals.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}
