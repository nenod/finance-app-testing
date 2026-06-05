import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/portfolio/:id — remove a stock holding.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await prisma.stockHolding.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete holding:", error);
    return NextResponse.json({ error: "Holding not found." }, { status: 404 });
  }
}
