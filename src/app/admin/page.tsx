import type { Metadata } from "next";
import type { Reservation } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import AdminLogin from "@/components/AdminLogin";
import AdminBook, { type Row } from "@/components/AdminBook";

export const metadata: Metadata = { title: "The book", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) return <AdminLogin />;

  const reservations = await prisma.reservation.findMany({
    orderBy: [{ eventDate: "asc" }, { createdAt: "asc" }],
  });

  const rows: Row[] = reservations.map((r: Reservation) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return <AdminBook rows={rows} />;
}
