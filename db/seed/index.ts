import { seedDimensions } from "./dimensions"

export async function seedDatabase() {
  console.log("🚀 Starting database seeding...")

  try {
    // Seed dimensions first (core data needed by other tables)
    await seedDimensions()

    console.log("✅ Database seeding completed successfully!")
    return true
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    return false
  }
}

// Export individual seeding functions for specific needs
export { seedDimensions }