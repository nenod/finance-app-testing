import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // Wipe existing data so the seed is idempotent.
  await prisma.transaction.deleteMany();
  await prisma.stockHolding.deleteMany();

  const now = new Date();
  const thisMonth = (day: number) =>
    new Date(now.getFullYear(), now.getMonth(), day);

  await prisma.transaction.createMany({
    data: [
      {
        type: "INCOME",
        amount: 5200,
        category: "Salary",
        description: "Monthly salary",
        date: thisMonth(1),
      },
      {
        type: "EXPENSE",
        amount: 1800,
        category: "Rent",
        description: "Apartment rent",
        date: thisMonth(2),
        isSubscription: true,
      },
      {
        type: "EXPENSE",
        amount: 420,
        category: "Food",
        description: "Groceries",
        date: thisMonth(5),
      },
      {
        type: "EXPENSE",
        amount: 65,
        category: "Subscriptions",
        description: "Streaming services",
        date: thisMonth(6),
        isSubscription: true,
      },
      {
        type: "EXPENSE",
        amount: 140,
        category: "Utilities",
        description: "Electricity & internet",
        date: thisMonth(8),
      },
      {
        type: "EXPENSE",
        amount: 95,
        category: "Food",
        description: "Restaurants",
        date: thisMonth(12),
      },
      {
        type: "INCOME",
        amount: 600,
        category: "Other",
        description: "Freelance project",
        date: thisMonth(15),
      },
    ],
  });

  await prisma.stockHolding.createMany({
    data: [
      { ticker: "AAPL", shares: 10 },
      { ticker: "MSFT", shares: 5 },
      { ticker: "GOOGL", shares: 3 },
    ],
  });

  console.log("Seed data inserted.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
