"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TransactionDTO } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/format";

export function TransactionsTable({
  transactions,
}: {
  transactions: TransactionDTO[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) router.refresh();
  }

  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No transactions yet. Add your first one above.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((t) => (
          <TableRow key={t.id}>
            <TableCell className="whitespace-nowrap text-muted-foreground">
              {formatDate(t.date)}
            </TableCell>
            <TableCell className="font-medium">{t.category}</TableCell>
            <TableCell className="text-muted-foreground">
              {t.description ?? "—"}
            </TableCell>
            <TableCell
              className={`text-right font-medium tabular-nums ${
                t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {t.type === "INCOME" ? "+" : "−"}
              {formatCurrency(t.amount)}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Delete transaction"
                disabled={deletingId === t.id}
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
