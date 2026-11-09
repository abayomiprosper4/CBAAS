import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthSession, toAuthUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().trim().email().max(191),
  password: z.string().min(1).max(128),
  role: z.enum(["admin", "lecturer", "student"]),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const { email, password, role } = parsed.data;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (user.status === "pending") {
    return NextResponse.json({ code: "PENDING_APPROVAL" }, { status: 403 });
  }

  const roleMatches = user.role === role || (role === "admin" && user.role === "main_admin");
  if (!roleMatches || user.status !== "approved") {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createAuthSession(user.id);
  return NextResponse.json({ user: toAuthUser(user) });
}