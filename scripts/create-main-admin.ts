import "dotenv/config";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const databaseUrl = process.env.DATABASE_URL;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const fullName = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

if (!databaseUrl || !email || !fullName || !password || password.length < 12) {
  throw new Error("Set DATABASE_URL and valid BOOTSTRAP_ADMIN_* values in .env; the password must be at least 12 characters.");
}

const database = new URL(databaseUrl);
const adapter = new PrismaMariaDb({
  host: database.hostname,
  port: Number(database.port || 3306),
  user: decodeURIComponent(database.username),
  password: decodeURIComponent(database.password),
  database: decodeURIComponent(database.pathname.slice(1)),
});
const prisma = new PrismaClient({ adapter });

try {
  const existingAdmin = await prisma.user.findFirst({ where: { role: "main_admin" } });
  const existingEmail = await prisma.user.findUnique({ where: { email } });

  if (existingAdmin || existingEmail) {
    throw new Error("A main administrator or account with that email already exists.");
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`;

  await prisma.user.create({
    data: {
      id: randomUUID(),
      email,
      passwordHash,
      fullName,
      role: "main_admin",
      status: "approved",
    },
  });

  console.log("Main administrator created.");
} finally {
  await prisma.$disconnect();
}