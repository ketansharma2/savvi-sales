import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import bcrypt from "bcryptjs";
import { connectDB } from "../lib/mongodb";
import User from "../models/User";

const users = [
  {
    email: "user@example.com",
    password: "User@123",
    role: "User" as const,
  },
  {
    email: "admin@example.com",
    password: "Admin@123",
    role: "Admin" as const,
  },
];

async function seed() {
  try {
    console.log("Starting database seeder...");

    await connectDB();

    for (const userData of users) {
      const existingUser = await User.findOne({
        email: userData.email,
      });

      if (existingUser) {
        console.log(
          `${userData.role} already exists: ${userData.email}`
        );
        continue;
      }

      const passwordHash = await bcrypt.hash(
        userData.password,
        12
      );

      await User.create({
        email: userData.email,
        passwordHash,
        role: userData.role,
      });

      console.log(
        `Created ${userData.role}: ${userData.email}`
      );
    }

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Seeder failed:", error);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

seed();