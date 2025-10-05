/**
 * Qualitative Score Conversion Utilities
 *
 * Module ini berisi fungsi-fungsi untuk konversi skor numerik ke kualitatif
 * sesuai dengan rumus µ dan 𝝈 dari PRD V6.
 */

/**
 * Interface untuk hasil konversi skor kualitatif
 */
export interface QualitativeScoreResult {
  numericScore: number
  qualitativeScore: string
  qualitativeLabel: string
  qualitativeCode: string
  idealMean: number
  idealStdDev: number
  thresholds: {
    sbThreshold: number
    bMinThreshold: number
    cMinThreshold: number
  }
}

/**
 * Konversi skor kualitatif menggunakan rumus µ dan 𝝈 dari PRD
 *
 * Rumus:
 * µ = ½(ideal minimum + ideal maximum)
 * 𝝈 = ½(ideal maximum - ideal minimum)
 *
 * Kategori:
 * - Sangat Baik (SB): μ + ⅔σ ≤ x ≤ 4
 * - Baik (B): μ − ⅔σ ≤ x < μ + ⅔σ
 * - Cukup (C): μ − 4/3σ ≤ x < μ − ⅔σ
 * - Perlu Pemulihan (P): 0 ≤ x < μ − 4/3σ
 *
 * @param numericScore - Skor numerik yang akan dikonversi (0-4)
 * @param idealMin - Nilai minimum ideal (default: 1)
 * @param idealMax - Nilai maximum ideal (default: 4)
 * @returns QualitativeScoreResult - Hasil konversi lengkap
 */
export function convertToQualitativeScore(
  numericScore: number,
  idealMin: number = 1,
  idealMax: number = 4
): QualitativeScoreResult {
  // Validate input
  if (numericScore < 0 || numericScore > idealMax) {
    throw new Error(`Numeric score ${numericScore} must be between 0 and ${idealMax}`)
  }

  // Calculate μ (Ideal Mean) and σ (Ideal Standard Deviation)
  const idealMean = (idealMin + idealMax) / 2 // µ = ½(1 + 4) = 2.5
  const idealStdDev = (idealMax - idealMin) / 2 // 𝝈 = ½(4 - 1) = 1.5

  // Calculate thresholds
  const sbThreshold = idealMean + (2/3) * idealStdDev // 2.5 + 1.0 = 3.5
  const bMinThreshold = idealMean - (2/3) * idealStdDev // 2.5 - 1.0 = 1.5
  const cMinThreshold = idealMean - (4/3) * idealStdDev // 2.5 - 2.0 = 0.5

  // Determine qualitative category
  let qualitativeScore: string
  let qualitativeLabel: string
  let qualitativeCode: string

  if (numericScore >= sbThreshold && numericScore <= idealMax) {
    qualitativeScore = "Sangat Baik (SB)"
    qualitativeLabel = "Sangat Baik"
    qualitativeCode = "SB"
  } else if (numericScore >= bMinThreshold && numericScore < sbThreshold) {
    qualitativeScore = "Baik (B)"
    qualitativeLabel = "Baik"
    qualitativeCode = "B"
  } else if (numericScore >= cMinThreshold && numericScore < bMinThreshold) {
    qualitativeScore = "Cukup (C)"
    qualitativeLabel = "Cukup"
    qualitativeCode = "C"
  } else if (numericScore >= 0 && numericScore < cMinThreshold) {
    qualitativeScore = "Perlu Pemulihan (P)"
    qualitativeLabel = "Perlu Pemulihan"
    qualitativeCode = "P"
  } else {
    qualitativeScore = "Tidak Valid"
    qualitativeLabel = "Tidak Valid"
    qualitativeCode = "TV"
  }

  return {
    numericScore,
    qualitativeScore,
    qualitativeLabel,
    qualitativeCode,
    idealMean,
    idealStdDev,
    thresholds: {
      sbThreshold,
      bMinThreshold,
      cMinThreshold,
    }
  }
}

/**
 * Menghitung nilai rata-rata dan konversi kualitatif untuk array skor
 */
export function calculateAverageQualitativeScore(
  scores: number[],
  idealMin: number = 1,
  idealMax: number = 4
): QualitativeScoreResult {
  if (scores.length === 0) {
    throw new Error("Cannot calculate average of empty scores array")
  }

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
  return convertToQualitativeScore(average, idealMin, idealMax)
}

/**
 * Menghitung nilai weighted average dan konversi kualitatif
 */
export function calculateWeightedAverageQualitativeScore(
  scoreValues: { score: number; weight: number }[],
  idealMin: number = 1,
  idealMax: number = 4
): QualitativeScoreResult {
  if (scoreValues.length === 0) {
    throw new Error("Cannot calculate weighted average of empty scores array")
  }

  const totalWeight = scoreValues.reduce((sum, item) => sum + item.weight, 0)
  const weightedSum = scoreValues.reduce((sum, item) => sum + (item.score * item.weight), 0)
  const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 0

  return convertToQualitativeScore(weightedAverage, idealMin, idealMax)
}

/**
 * Mengkonversi array skor numerik menjadi array hasil konversi kualitatif
 */
export function convertMultipleScoresToQualitative(
  scores: number[],
  idealMin: number = 1,
  idealMax: number = 4
): QualitativeScoreResult[] {
  return scores.map(score => convertToQualitativeScore(score, idealMin, idealMax))
}

/**
 * Menghitung persentase skor per kategori kualitatif
 */
export function calculateQualitativeDistribution(
  scores: number[],
  idealMin: number = 1,
  idealMax: number = 4
): {
  sangatBaik: number
  baik: number
  cukup: number
  perluPemulihan: number
  tidakValid: number
} {
  if (scores.length === 0) {
    return { sangatBaik: 0, baik: 0, cukup: 0, perluPemulihan: 0, tidakValid: 0 }
  }

  const results = convertMultipleScoresToQualitative(scores, idealMin, idealMax)
  const total = results.length

  const distribution = {
    sangatBaik: 0,
    baik: 0,
    cukup: 0,
    perluPemulihan: 0,
    tidakValid: 0,
  }

  results.forEach(result => {
    switch (result.qualitativeCode) {
      case "SB":
        distribution.sangatBaik++
        break
      case "B":
        distribution.baik++
        break
      case "C":
        distribution.cukup++
        break
      case "P":
        distribution.perluPemulihan++
        break
      default:
        distribution.tidakValid++
    }
  })

  // Convert to percentages
  return {
    sangatBaik: Math.round((distribution.sangatBaik / total) * 100),
    baik: Math.round((distribution.baik / total) * 100),
    cukup: Math.round((distribution.cukup / total) * 100),
    perluPemulihan: Math.round((distribution.perluPemulihan / total) * 100),
    tidakValid: Math.round((distribution.tidakValid / total) * 100),
  }
}

/**
 * Menghasilkan deskripsi performa berdasarkan kategori kualitatif
 */
export function getPerformanceDescription(qualitativeCode: string): string {
  switch (qualitativeCode) {
    case "SB":
      return "Pencapaian sangat baik, melebihi harapan dengan konsistensi tinggi"
    case "B":
      return "Pencapaian baik, memenuhi harapan dengan performa stabil"
    case "C":
      return "Pencapaian cukup, memerlukan perhatian untuk peningkatan"
    case "P":
      return "Memerlukan pemulihan dan bimbingan intensif"
    default:
      return "Tidak dapat dievaluasi"
  }
}

/**
 * Menghasilkan rekomendasi pengembangan berdasarkan kategori kualitatif
 */
export function getDevelopmentRecommendations(qualitativeCode: string): string[] {
  switch (qualitativeCode) {
    case "SB":
      return [
        "Berikan tantangan lebih lanjut untuk mengoptimalkan potensi",
        "Libatkan sebagai mentor atau contoh bagi yang lain",
        "Kembangkan proyek pengembangan diri yang lebih kompleks"
      ]
    case "B":
      return [
        "Berikan umpan balik positif dan dukungan untuk maintain performa",
        "Tawarkan kesempatan untuk mengembangkan keahlian tambahan",
        "Pantau perkembangan secara berkala"
      ]
    case "C":
      return [
        "Berikan bimbingan intensif dan dukungan individual",
        "Identifikasi area yang memerlukan perbaikan khusus",
        "Buat rencana pengembangan dengan target yang jelas"
      ]
    case "P":
      return [
        "Segera lakukan intervensi dan pendampingan personal",
        "Kaji ulang metode pembelajaran dan pendekatan",
        "Koordinasikan dengan pihak terkait untuk dukungan komprehensif"
      ]
    default:
      return ["Lakukan evaluasi ulang untuk menentukan langkah selanjutnya"]
  }
}

/**
 * Utilitas untuk debugging dan validasi konversi skor
 */
export function validateConversionParameters(
  numericScore: number,
  idealMin: number = 1,
  idealMax: number = 4
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (typeof numericScore !== 'number' || isNaN(numericScore)) {
    errors.push("Numeric score must be a valid number")
  }

  if (numericScore < 0 || numericScore > idealMax) {
    errors.push(`Numeric score must be between 0 and ${idealMax}`)
  }

  if (idealMin >= idealMax) {
    errors.push("Ideal minimum must be less than ideal maximum")
  }

  if (idealMin < 0) {
    errors.push("Ideal minimum cannot be negative")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}