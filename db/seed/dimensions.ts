import { db } from "@/db"
import { dimensions } from "@/db/schema/jejak"

const defaultDimensions = [
  {
    name: "Kreativitas",
    description: "Kemampuan berpikir kreatif dan inovatif dalam menghasilkan ide-ide baru"
  },
  {
    name: "Kolaborasi",
    description: "Kemampuan bekerja sama secara efektif dalam tim dan berkontribusi pada tujuan bersama"
  },
  {
    name: "Komunikasi",
    description: "Kemampuan menyampaikan ide dengan jelas dan mendengarkan secara aktif"
  },
  {
    name: "Berpikir Kritis",
    description: "Kemampuan menganalisis informasi secara logis dan membuat keputusan yang bijaksana"
  },
  {
    name: "Sosial Emosional",
    description: "Kemampuan mengelola emosi dan membangun hubungan sosial yang positif"
  },
  {
    name: "Pembelajaran Mandiri",
    description: "Kemampuan mengatur pembelajaran sendiri dan bertanggung jawab atas perkembangan diri"
  },
  {
    name: "Problem Solving",
    description: "Kemampuan mengidentifikasi masalah dan menemukan solusi yang efektif"
  },
  {
    name: "Literasi Digital",
    description: "Kemampuan menggunakan teknologi secara bertanggung jawab dan efektif"
  },
]

export async function seedDimensions() {
  console.log("🌱 Seeding default P5 dimensions...")

  try {
    // Check if dimensions already exist
    const existingDimensions = await db.select({ name: dimensions.name }).from(dimensions)
    const existingNames = existingDimensions.map(d => d.name)

    // Insert only dimensions that don't exist yet
    const newDimensions = defaultDimensions.filter(d => !existingNames.includes(d.name))

    if (newDimensions.length > 0) {
      await db.insert(dimensions).values(newDimensions)
      console.log(`✅ Created ${newDimensions.length} new dimensions:`)
      newDimensions.forEach(d => console.log(`   - ${d.name}`))
    } else {
      console.log("✅ All dimensions already exist")
    }

    console.log("🎉 Dimensions seeding completed!")
    return true
  } catch (error) {
    console.error("❌ Error seeding dimensions:", error)
    return false
  }
}

export async function getAllDimensions() {
  return await db.select().from(dimensions).orderBy(dimensions.name)
}

export async function getDimensionByName(name: string) {
  return await db.select().from(dimensions).where(dimensions.name.eq(name)).limit(1)
}