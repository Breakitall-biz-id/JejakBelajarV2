#!/usr/bin/env tsx

import { seedDatabase } from "../db/seed"

async function main() {
  console.log("🌱 Running dimensions seed script...")

  const success = await seedDatabase()

  if (success) {
    console.log("🎉 Seeding completed successfully!")
    process.exit(0)
  } else {
    console.error("💥 Seeding failed!")
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("💥 Unexpected error:", error)
  process.exit(1)
})