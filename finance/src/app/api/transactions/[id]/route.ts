import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/transactions/:id — remove a transaction.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return NextResponse.json(
      { error: "Transaction not found." },
      { status: 404 },
    );
  }
}
