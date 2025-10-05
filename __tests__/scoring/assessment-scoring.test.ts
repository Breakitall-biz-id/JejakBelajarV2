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
    qualitativeScore: score >= 3.5 ? 'Sangat Baik' : score >= 2.5 ? 'Baik' : 'Cukup'
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
    it('should correctly map answers to questions and calculate dimension scores', async () => {
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
      const kolaborasi = result.find(r => r.dimensionId === 'dim1')
      expect(kolaborasi).toBeDefined()
      expect(kolaborasi!.dimensionName).toBe('Kolaborasi')
      expect(kolaborasi!.averageScore).toBe(3.5) // (4+3)/2
      expect(kolaborasi!.totalSubmissions).toBe(2)
      expect(kolaborasi!.maxScore).toBe(4)

      // Check Komunikasi dimension (q3=2)
      const komunikasi = result.find(r => r.dimensionId === 'dim2')
      expect(komunikasi).toBeDefined()
      expect(komunikasi!.dimensionName).toBe('Komunikasi')
      expect(komunikasi!.averageScore).toBe(2)
      expect(komunikasi!.totalSubmissions).toBe(1)
      expect(komunikasi!.maxScore).toBe(4)
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
      const kolaborasi = result.find(r => r.dimensionId === 'dim1')
      expect(kolaborasi!.averageScore).toBe(4) // Only q1 counted
      expect(kolaborasi!.totalSubmissions).toBe(1)

      // Komunikasi should count q3 (2)
      const komunikasi = result.find(r => r.dimensionId === 'dim2')
      expect(komunikasi!.averageScore).toBe(2)
      expect(komunikasi!.totalSubmissions).toBe(1)
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
      expect(defaultDimension!.averageScore).toBe(1)
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
      expect(kolaborasi!.averageScore).toBe(3.5)
      expect(kolaborasi!.totalSubmissions).toBe(2)

      const komunikasi = result.find(r => r.dimensionId === 'dim2')
      expect(komunikasi!.averageScore).toBe(2)
      expect(komunikasi!.totalSubmissions).toBe(1)
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