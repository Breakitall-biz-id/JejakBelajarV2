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
    rMinThreshold: number
  }
}

/**
 * Konversi skor kualitatif menggunakan rumus µ dan 𝝈 dari penilaian.md
 *
 * Rumus:
 * µ = ½(ideal minimum + ideal maximum)
 * 𝝈 = ½(ideal maximum - ideal minimum)
 *
 * Kategori (5 tingkatan):
 * - Sangat Baik (SB): µ + 1.5σ < X
 * - Baik (B): µ + 0.5σ < X ≤ µ + 1.5σ
 * - Cukup (C): µ - 0.5σ < X ≤ µ + 0.5σ
 * - Kurang (R): µ - 1.5σ < X ≤ µ - 0.5σ
 * - Sangat Rendah (SR): X ≤ µ - 1.5σ
 *
 * @param numericScore - Skor numerik yang akan dikonversi (0-100)
 * @param idealMin - Nilai minimum ideal (default: 1)
 * @param idealMax - Nilai maximum ideal (default: 4)
 * @returns QualitativeScoreResult - Hasil konversi lengkap
 */
export function convertToQualitativeScore(
  numericScore: number,
  idealMin: number = 1,
  idealMax: number = 4
): QualitativeScoreResult {
  // Validate input - now expects 0-100 scale
  if (numericScore < 0 || numericScore > 100) {
    throw new Error(`Numeric score ${numericScore} must be between 0 and 100`)
  }

  // Calculate μ (Ideal Mean) and σ (Ideal Standard Deviation) based on penilaian.md
  // First convert to 0-4 scale for calculation, then back to 0-100
  const idealMean_0to4 = (idealMin + idealMax) / 2 // µ = ½(1 + 4) = 2.5
  const idealStdDev_0to4 = (idealMax - idealMin) / 2 // 𝝈 = ½(4 - 1) = 1.5

  // Convert to 0-100 scale for thresholds
  const idealMean = (idealMean_0to4 / 4) * 100 // 2.5/4 * 100 = 62.5
  const idealStdDev = (idealStdDev_0to4 / 4) * 100 // 1.5/4 * 100 = 37.5

  // Calculate thresholds using 1.5σ and 0.5σ (per penilaian.md)
  const sbThreshold = idealMean + 1.5 * idealStdDev // 62.5 + 56.25 = 118.75 → cap at 100
  const bMinThreshold = idealMean + 0.5 * idealStdDev // 62.5 + 18.75 = 81.25
  const cMinThreshold = idealMean - 0.5 * idealStdDev // 62.5 - 18.75 = 43.75
  const rMinThreshold = idealMean - 1.5 * idealStdDev // 62.5 - 56.25 = 6.25

  // Determine qualitative category (5 categories per penilaian.md)
  let qualitativeScore: string
  let qualitativeLabel: string
  let qualitativeCode: string

  if (numericScore > bMinThreshold && numericScore <= 100) {
    qualitativeScore = "Sangat Baik (SB)"
    qualitativeLabel = "Sangat Baik"
    qualitativeCode = "SB"
  } else if (numericScore > cMinThreshold && numericScore <= bMinThreshold) {
    qualitativeScore = "Baik (B)"
    qualitativeLabel = "Baik"
    qualitativeCode = "B"
  } else if (numericScore > rMinThreshold && numericScore <= cMinThreshold) {
    qualitativeScore = "Cukup (C)"
    qualitativeLabel = "Cukup"
    qualitativeCode = "C"
  } else if (numericScore > 0 && numericScore <= rMinThreshold) {
    qualitativeScore = "Kurang (R)"
    qualitativeLabel = "Kurang"
    qualitativeCode = "R"
  } else if (numericScore >= 0 && numericScore <= 0) {
    qualitativeScore = "Sangat Rendah (SR)"
    qualitativeLabel = "Sangat Rendah"
    qualitativeCode = "SR"
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
      sbThreshold: Math.min(sbThreshold, 100),
      bMinThreshold,
      cMinThreshold,
      rMinThreshold,
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
  kurang: number
  sangatRendah: number
  tidakValid: number
} {
  if (scores.length === 0) {
    return { sangatBaik: 0, baik: 0, cukup: 0, kurang: 0, sangatRendah: 0, tidakValid: 0 }
  }

  const results = convertMultipleScoresToQualitative(scores, idealMin, idealMax)
  const total = results.length

  const distribution = {
    sangatBaik: 0,
    baik: 0,
    cukup: 0,
    kurang: 0,
    sangatRendah: 0,
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
      case "R":
        distribution.kurang++
        break
      case "SR":
        distribution.sangatRendah++
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
    kurang: Math.round((distribution.kurang / total) * 100),
    sangatRendah: Math.round((distribution.sangatRendah / total) * 100),
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
    case "R":
      return "Pencapaian kurang, perlu bimbingan dan dukungan tambahan"
    case "SR":
      return "Pencapaian sangat rendah, memerlukan intervensi intensif"
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
    case "R":
      return [
        "Berikan perhatian khusus dan bimbingan terstruktur",
        "Tingkatkan frekuensi evaluasi dan umpan balik",
        "Koordinasikan dengan orang tua untuk dukungan tambahan"
      ]
    case "SR":
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

  // Update validation for 0-100 scale
  if (numericScore < 0 || numericScore > 100) {
    errors.push(`Numeric score must be between 0 and 100`)
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