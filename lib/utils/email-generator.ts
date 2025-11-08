import { db } from '@/db'
import { user } from '@/db/schema/auth'
import { eq } from 'drizzle-orm'

/**
 * Generate email dari nama siswa
 * Format: {nama-sanitized}.{random-number}@jejakbelajar.online
 */
export function generateEmailFromName(name: string): string {
  // Sanitize nama: lowercase, remove special chars, replace spaces with dots
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Hanya huruf dan spasi
    .replace(/\s+/g, '.')     // Ganti spasi dengan dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .replace(/\.+/g, '.')      // Multiple dots jadi single dot

  // Jika hasil kosong, gunakan default
  const baseEmail = sanitized || 'siswa'

  // Generate random number untuk uniqueness
  const randomNum = Math.floor(Math.random() * 9999) + 1

  return `${baseEmail}.${randomNum}@jejakbelajar.online`
}

/**
 * Check jika email sudah ada di database
 * Jika ada, generate email baru dengan suffix
 */
export async function generateUniqueEmail(name: string): Promise<string> {
  let email = generateEmailFromName(name)
  let attempts = 0
  const maxAttempts = 10

  while (attempts < maxAttempts) {
    // Check if email exists
    const existingUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    if (existingUser.length === 0) {
      return email
    }

    // Generate new email with suffix
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .replace(/\.+/g, '.')

    const baseEmail = sanitized || 'siswa'
    const randomNum = Math.floor(Math.random() * 9999) + 1
    email = `${baseEmail}.${randomNum}.${attempts + 1}@jejakbelajar.online`

    attempts++
  }

  // If still exists after max attempts, use timestamp
  const timestamp = Date.now()
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .replace(/\s+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/\.+/g, '.')

  const baseEmail = sanitized || 'siswa'
  return `${baseEmail}.${timestamp}@jejakbelajar.online`
}

/**
 * Generate default password untuk siswa
 */
export function generateDefaultPassword(): string {
  return 'jejakbelajar123'
}

/**
 * Generate secure random password (opsional)
 */
export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}