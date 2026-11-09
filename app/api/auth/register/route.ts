import { Prisma } from "../../../../generated/prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthSession, hashPassword, toAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registrationSchema = z.object({
  fullName: z.string().trim().min(1).max(191),
  email: z.string().trim().email().max(191),
  password: z.string().min(12).max(128),
  role: z.enum(["admin", "lecturer", "student"]),
  rank: z.string().trim().max(64).optional(),
  departments: z.array(z.string().trim().min(1).max(128)).max(20).optional(),
  specializations: z.array(z.string().trim().min(1).max(128)).max(50).optional(),
  expertiseRatings: z.record(z.string(), z.number().int().min(0).max(100)).optional(),
  preferenceRatings: z.record(z.string(), z.number().int().min(0).max(100)).optional(),
  minWorkload: z.number().int().min(0).max(100).optional(),
  maxWorkload: z.number().int().min(1).max(200).optional(),
  yearsExperience: z.number().int().min(0).max(100).optional(),
  matricNumber: z.string().trim().min(1).max(64).optional(),
  department: z.string().trim().min(1).max(128).optional(),
  level: z.number().int().min(100).max(1000).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid registration details." }, { status: 400 });
  }

  const input = parsed.data;
  const email = input.email.toLowerCase();
  const passwordHash = await hashPassword(input.password);
  const departments = [...new Set(input.departments ?? [])];
  const specializations = [...new Set(input.specializations ?? [])];

  try {
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        status: input.role === "admin" ? "pending" : "approved",
        rank: input.role === "lecturer" ? input.rank || "Lecturer I" : undefined,
        lecturer:
          input.role === "lecturer"
            ? {
                create: {
                  minWorkload: input.minWorkload ?? 3,
                  maxWorkload: input.maxWorkload ?? 12,
                  yearsExperience: input.yearsExperience,
                  departments: {
                    create: departments.map((department) => ({ department })),
                  },
                  specializations: {
                    create: specializations.map((specialization) => ({
                      specialization,
                      expertiseRating: input.expertiseRatings?.[specialization],
                      preferenceRating: input.preferenceRatings?.[specialization],
                    })),
                  },
                  availability: { create: {} },
                },
              }
            : undefined,
        student:
          input.role === "student"
            ? {
                create: {
                  matricNumber: input.matricNumber,
                  department: input.department ?? departments[0],
                  level: input.level,
                },
              }
            : undefined,
      },
    });

    if (input.role !== "admin") {
      await createAuthSession(user.id);
    }

    return NextResponse.json({
      success: true,
      pendingApproval: input.role === "admin",
      ...(input.role !== "admin" ? { user: toAuthUser(user) } : {}),
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email or student number is already registered." }, { status: 409 });
    }
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Registration could not be completed." }, { status: 500 });
  }
}