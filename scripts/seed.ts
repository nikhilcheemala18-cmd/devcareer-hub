import { config } from "dotenv";

config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";

const SALT_ROUNDS = 12;

async function seedAdminUser() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error(
      "Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD. Set them in .env.local before running the seed script."
    );
  }

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  await User.create({
    name,
    email,
    passwordHash,
    role: "ADMIN",
  });

  console.log(`Created admin user: ${email}`);
}

async function main() {
  await connectToDatabase();
  await seedAdminUser();
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
