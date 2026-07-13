import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

const ALLOWED = ["PENDING", "CONFIRMED", "DECLINED", "CANCELLED"];

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Not you." }, { status: 401 });
  }

  const { id, status } = await req.json().catch(() => ({}));
  if (!id || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ ok: true, status: updated.status });
}
