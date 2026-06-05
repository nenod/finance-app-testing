import { TrendingUp, Wallet, PiggyBank } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { AddStockDialog } from "@/components/add-stock-dialog";
import { TransactionsTable } from "@/components/transactions-table";
import { PortfolioTable } from "@/components/portfolio-table";
import { ExpensesPieChart } from "@/components/expenses-pie-chart";
import {
  computeFiatBalance,
  expensesByCategoryThisMonth,
  getPortfolio,
  getTransactions,
} from "@/lib/data";
import { formatCurrency } from "@/lib/format";

// Always render fresh data (prices + DB) on each request.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [transactions, portfolio] = await Promise.all([
    getTransactions(),
    getPortfolio(),
  ]);

  const fiatBalance = computeFiatBalance(transactions);
  const netWorth = fiatBalance + portfolio.totalValue;
  const expenseData = expensesByCategoryThisMonth(transactions);
  const latestTransactions = transactions.slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Total Fiat Balance"
          value={formatCurrency(fiatBalance)}
          description="Income minus expenses"
          icon={<Wallet className="h-5 w-5 text-blue-600" />}
          valueClassName={
            fiatBalance >= 0 ? "text-emerald-600" : "text-rose-600"
          }
        />
        <SummaryCard
          title="Total Portfolio Value"
          value={formatCurrency(portfolio.totalValue)}
          description="Latest closing prices"
          icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
        />
        <SummaryCard
          title="Combined Net Worth"
          value={formatCurrency(netWorth)}
          description="Fiat balance + portfolio"
          icon={<PiggyBank className="h-5 w-5 text-emerald-600" />}
          valueClassName="text-foreground"
        />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Cash flow */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Cash Flow</CardTitle>
                <CardDescription>Latest 10 transactions</CardDescription>
              </div>
              <AddTransactionDialog />
            </div>
          </CardHeader>
          <CardContent>
            <TransactionsTable transactions={latestTransactions} />
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>Your stock holdings</CardDescription>
              </div>
              <AddStockDialog />
            </div>
          </CardHeader>
          <CardContent>
            <PortfolioTable positions={portfolio.positions} />
          </CardContent>
        </Card>
      </div>

      {/* Expenses chart */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Current month</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpensesPieChart data={expenseData} />
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  valueClassName,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardDescription>{title}</CardDescription>
          {icon}
        </div>
        <CardTitle
          className={`text-2xl font-bold tabular-nums ${valueClassName ?? ""}`}
        >
          {value}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
    </Card>
  );
}
