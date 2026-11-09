import { NextResponse } from "next/server";
import { destroyAuthSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  await destroyAuthSession();
  return NextResponse.json({ success: true });
}