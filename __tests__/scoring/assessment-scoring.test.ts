import { describe, it, expect, vi, beforeEach } from 'vitest'
import { calculateAssessmentDimensionScores, calculateObservationDimensionScores } from '@/lib/scoring/dimension-scorer'

// Mock the database and dependencies
vi.mock('@/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            orderBy: vi.fn(() => Promise.resolve(mockQuestions))
          }))
        }))
      }))
    }))
  }
}))

vi.mock('@/lib/scoring/qualitative-converter', () => ({
  convertToQualitativeScore: vi.fn((score) => ({
    qualitativeScore: score >= 81.25 ? 'Sangat Baik (SB)' : score >= 43.75 ? 'Baik (B)' : score >= 6.25 ? 'Cukup (C)' : 'Kurang (R)'
  }))
}))

// Mock data
const mockQuestions = [
  {
    id: 'q1',
    questionText: 'Question 1',
    dimensionId: 'dim1',
    dimensionName: 'Kolaborasi',
    createdAt: new Date('2025-01-01')
  },
  {
    id: 'q2',
    questionText: 'Question 2',
    dimensionId: 'dim1',
    dimensionName: 'Kolaborasi',
    createdAt: new Date('2025-01-02')
  },
  {
    id: 'q3',
    questionText: 'Question 3',
    dimensionId: 'dim2',
    dimensionName: 'Komunikasi',
    createdAt: new Date('2025-01-03')
  }
]

describe('Assessment Scoring Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('calculateAssessmentDimensionScores', () => {
    it('should correctly map answers to questions and calculate dimension scores with new formula', async () => {
      const mockSubmission = {
        id: 'sub1',
        templateStageConfigId: 'config1',
        content: {
          answers: [4, 3, 2] // q1=4, q2=3, q3=2
        }
      }

      const result = await calculateAssessmentDimensionScores(mockSubmission)

      expect(result).toHaveLength(2) // 2 dimensions

      // Check Kolaborasi dimension (q1=4, q2=3)
      // Formula: X = ((4+3) / (2 x 4)) x 100 = (7/8) x 100 = 87.5
      const kolaborasi = result.find(r => r.dimensionId === 'dim1')
      expect(kolaborasi).toBeDefined()
      expect(kolaborasi!.dimensionName).toBe('Kolaborasi')
      expect(kolaborasi!.averageScore).toBe(87.5) // New formula: ((4+3)/(2*4))*100 = 87.5
      expect(kolaborasi!.totalSubmissions).toBe(2)
      expect(kolaborasi!.maxScore).toBe(100) // Updated to 100 scale

      // Check Komunikasi dimension (q3=2)
      // Formula: X = ((2) / (1 x 4)) x 100 = (2/4) x 100 = 50
      const komunikasi = result.find(r => r.dimensionId === 'dim2')
      expect(komunikasi).toBeDefined()
      expect(komunikasi!.dimensionName).toBe('Komunikasi')
      expect(komunikasi!.averageScore).toBe(50) // New formula: (2/(1*4))*100 = 50
      expect(komunikasi!.totalSubmissions).toBe(1)
      expect(komunikasi!.maxScore).toBe(100) // Updated to 100 scale
    })

    it('should handle missing answers gracefully', async () => {
      const mockSubmission = {
        id: 'sub2',
        templateStageConfigId: 'config1',
        content: {
          answers: [4, undefined, 2] // q1=4, q2=undefined, q3=2
        }
      }

      const result = await calculateAssessmentDimensionScores(mockSubmission)

      expect(result).toHaveLength(2)

      // Kolaborasi should only count q1 (4), skip q2 (undefined)
      // Formula: X = ((4) / (1 x 4)) x 100 = (4/4) x 100 = 100
      const kolaborasi = result.find(r => r.dimensionId === 'dim1')
      expect(kolaborasi!.averageScore).toBe(100) // Only q1 counted: (4/(1*4))*100 = 100
      expect(kolaborasi!.totalSubmissions).toBe(1)
      expect(kolaborasi!.maxScore).toBe(100)

      // Komunikasi should count q3 (2)
      // Formula: X = ((2) / (1 x 4)) x 100 = (2/4) x 100 = 50
      const komunikasi = result.find(r => r.dimensionId === 'dim2')
      expect(komunikasi!.averageScore).toBe(50) // (2/(1*4))*100 = 50
      expect(komunikasi!.totalSubmissions).toBe(1)
      expect(komunikasi!.maxScore).toBe(100)
    })

    it('should handle dimension mismatch and provide default', async () => {
      const mockQuestionsWithNullDimension = [
        ...mockQuestions,
        {
          id: 'q4',
          questionText: 'Question 4',
          dimensionId: null,
          dimensionName: null,
          createdAt: new Date('2025-01-04')
        }
      ]

      vi.doMock('@/db', () => ({
        db: {
          select: vi.fn(() => ({
            from: vi.fn(() => ({
              leftJoin: vi.fn(() => ({
                where: vi.fn(() => ({
                  orderBy: vi.fn(() => Promise.resolve(mockQuestionsWithNullDimension))
                }))
              }))
            }))
          }))
        }
      }))

      const mockSubmission = {
        id: 'sub3',
        templateStageConfigId: 'config1',
        content: {
          answers: [4, 3, 2, 1]
        }
      }

      const result = await calculateAssessmentDimensionScores(mockSubmission)

      // Should have 3 dimensions (dim1, dim2, default)
      expect(result).toHaveLength(3)

      const defaultDimension = result.find(r => r.dimensionId === 'default')
      expect(defaultDimension).toBeDefined()
      expect(defaultDimension!.dimensionName).toBe('Umum')
      expect(defaultDimension!.averageScore).toBe(25) // New formula: (1/(1*4))*100 = 25
      expect(defaultDimension!.maxScore).toBe(100)
    })

    it('should warn about answer length mismatch', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const mockSubmission = {
        id: 'sub4',
        templateStageConfigId: 'config1',
        content: {
          answers: [4, 3] // Only 2 answers for 3 questions
        }
      }

      await calculateAssessmentDimensionScores(mockSubmission)

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Answer length (2) doesn\'t match question count (3)')
      )

      consoleSpy.mockRestore()
    })
  })

  describe('calculateObservationDimensionScores', () => {
    it('should use same logic as assessment scoring for observations', async () => {
      const mockObservation = {
        id: 'obs1',
        templateStageConfigId: 'config1',
        content: {
          answers: [4, 3, 2] // Same answers as assessment test
        }
      }

      const result = await calculateObservationDimensionScores(mockObservation)

      // Should produce same results as assessment scoring
      expect(result).toHaveLength(2)

      const kolaborasi = result.find(r => r.dimensionId === 'dim1')
      expect(kolaborasi!.averageScore).toBe(87.5) // ((4+3)/(2*4))*100 = 87.5
      expect(kolaborasi!.totalSubmissions).toBe(2)
      expect(kolaborasi!.maxScore).toBe(100)

      const komunikasi = result.find(r => r.dimensionId === 'dim2')
      expect(komunikasi!.averageScore).toBe(50) // (2/(1*4))*100 = 50
      expect(komunikasi!.totalSubmissions).toBe(1)
      expect(komunikasi!.maxScore).toBe(100)
    })

    it('should provide default dimension name for observations', async () => {
      const mockObservation = {
        id: 'obs2',
        templateStageConfigId: 'config1',
        content: {
          answers: [4, 3, 2, 1]
        }
      }

      const mockQuestionsWithNullDimension = [
        ...mockQuestions,
        {
          id: 'q4',
          questionText: 'Question 4',
          dimensionId: null,
          dimensionName: null,
          createdAt: new Date('2025-01-04')
        }
      ]

      vi.doMock('@/db', () => ({
        db: {
          select: vi.fn(() => ({
            from: vi.fn(() => ({
              leftJoin: vi.fn(() => ({
                where: vi.fn(() => ({
                  orderBy: vi.fn(() => Promise.resolve(mockQuestionsWithNullDimension))
                }))
              }))
            }))
          }))
        }
      }))

      const result = await calculateObservationDimensionScores(mockObservation)

      const defaultDimension = result.find(r => r.dimensionId === 'default')
      expect(defaultDimension).toBeDefined()
      expect(defaultDimension!.dimensionName).toBe('Observasi Umum')
    })
  })
})