# Task: Perbaiki Sistem Scoring Sesuai Dokumentasi penilaian.md

## 🎯 **Overview**
Memperbaiki implementasi sistem scoring agar sesuai dengan formula yang didefinisikan dalam `docs/tasks/penilaian.md`.

## 📋 **Current Issues**

### ❌ **Issue 1: Formula Perhitungan Skor Tidak Sesuai**
- **Current**: Menggunakan rata-rata langsung skala 0-4
- **Required**: Formula `X = ((jumlah skor pada seluruh item) / (jumlah item x 4)) x 100`

### ❌ **Issue 2: Skala Output Salah**
- **Current**: Skala 0-4
- **Required**: Skala 0-100 (persentase)

### ❌ **Issue 3: Kategori Kualitatif Tidak Sesuai**
- **Current**: Menggunakan µ ± ⅔σ, µ ± 4/3σ (4 kategori)
- **Required**: Menggunakan µ ± 1.5σ, µ ± 0.5σ (5 kategori)

### ❌ **Issue 4: Parameter Deviasi Salah**
- **Current**: ⅔σ (0.67σ) dan 4/3σ (1.33σ)
- **Required**: 1.5σ dan 0.5σ

## 🎯 **Requirements**

### ✅ **Formula Scoring Baru**
```typescript
// Dari penilaian.md
X = ((jumlah skor pada seluruh item) / (jumlah item x 4)) x 100

// Contoh implementasi:
// Skor: 4, 4, 3, 3, 4, 3
// X = (4+4+3+3+4+3)/(6x4) x 100 = 21/24 x 100 = 87.5
```

### ✅ **Kategori Kualitatif Baru**
Berdasarkan Tabel 9 dari dokumentasi:

| Interval Skor | Kategori | Kriteria Capaian |
|---------------|----------|------------------|
| µ + 1.5σ < X | Sangat tinggi | Sangat baik |
| µ + 0.5σ < X ≤ µ + 1.5σ | Tinggi | Baik |
| µ - 0.5σ < X ≤ µ + 0.5σ | Sedang | Cukup |
| µ - 1.5σ < X ≤ µ - 0.5σ | Rendah | Kurang |
| X ≤ µ - 1.5σ | Sangat rendah | - |

### ✅ **Parameter Perhitungan**
```typescript
µ = rerata ideal = ½(skor minimal ideal + skor maksimal ideal)
𝝈 = standar deviasi ideal = ½(skor maksimal ideal - skor minimal ideal)
X = skor yang dicapai murid (dalam skala 0-100)
```

## 🔧 **Files to Modify**

### **Primary Files**
1. **`lib/scoring/dimension-scorer.ts`**
   - ✅ Update formula scoring di semua fungsi
   - ✅ Ubah skala output dari 0-4 menjadi 0-100
   - ✅ Integrasi dengan qualitative converter baru

2. **`lib/scoring/qualitative-converter.ts`**
   - ✅ Update parameter deviasi (1.5σ, 0.5σ)
   - ✅ Tambah kategori "Sangat Rendah"
   - ✅ Update thresholds untuk skala 0-100
   - ✅ Update kode kualitatif (SB, B, C, R, SR)

### **Secondary Files**
3. **`app/api/student/rapor/[projectId]/route.ts`**
   - ✅ Update penanganan skala 0-100
   - ✅ Update konversi ke display format

4. **`app/api/teacher/rapor/[projectId]/[studentId]/route.ts`**
   - ✅ Update penanganan skala 0-100
   - ✅ Update konversi ke display format

5. **`app/dashboard/student/_components/student-rapor.tsx`**
   - ✅ Update display format untuk menampilkan skala 0-100
   - ✅ Update progress bar calculations
   - ✅ Update qualitative score display

### **Test Files**
6. **`__tests__/scoring/assessment-scoring.test.ts`**
   - ✅ Update test cases dengan formula baru
   - ✅ Update expected outputs

## 📝 **Implementation Steps**

### **Step 1: Update Qualitative Converter**
1. Ubah parameter deviasi dari ⅔σ/4/3σ menjadi 1.5σ/0.5σ
2. Tambah kategori "Sangat Rendah"
3. Update thresholds untuk skala 0-100
4. Update kode kualitatif: SB, B, C, R, SR

### **Step 2: Update Dimension Scorer**
1. Ubah formula scoring di `calculateJournalDimensionScores()`
2. Ubah formula scoring di `calculateAssessmentDimensionScores()`
3. Ubah formula scoring di `calculateObservationDimensionScores()`
4. Update skala output ke 0-100

### **Step 3: Update API Responses**
1. Update student rapor API
2. Update teacher rapor API
3. Update dimension scores API

### **Step 4: Update Frontend Display**
1. Update student rapor component
2. Update teacher rapor components
3. Update progress calculations
4. Update score formatting

### **Step 5: Update Tests**
1. Update existing test cases
2. Add new test cases for edge scenarios
3. Validate dengan contoh dari dokumentasi

## 🧪 **Test Cases**

### **Contoh dari Dokumentasi**
```typescript
// Input: 4 item self assessment dengan skor 4, 4, 3, 3
// Input: 2 item journal dengan skor 4, 3
// Total items: 6
// Expected: X = (4+4+3+3+4+3)/(6x4) x 100 = 87.5
```

### **Edge Cases**
1. Single item (1 item dengan skor 4)
2. All minimum scores (6 items dengan skor 1)
3. Mixed scores (berbagai kombinasi)
4. Empty submissions
5. Invalid scores

## 📊 **Impact Analysis**

### **Affected Components**
- ✅ Student Rapor display
- ✅ Teacher Rapor display
- ✅ Dimension scores calculation
- ✅ Performance insights
- ✅ Qualitative score conversion
- ✅ Progress indicators

### **Data Migration**
- Existing scores akan dihitung ulang dengan formula baru
- Qualitative codes akan berubah (4 kategori → 5 kategori)
- Scale berubah (0-4 → 0-100)

## ⚠️ **Breaking Changes**

### **API Response Changes**
```typescript
// Before
{ averageScore: 3.5, maxScore: 4 }

// After
{ averageScore: 87.5, maxScore: 100 }
```

### **Frontend Display Changes**
- Score display format: `3.5/4.0` → `87.5/100`
- Progress bar calculations
- Qualitative badges
- Performance insights

## ✅ **Acceptance Criteria**

1. **Formula Scoring**: ✅ Menggunakan `X = ((jumlah skor)/(jumlah item x 4)) x 100`
2. **Skala Output**: ✅ 0-100 (persentase)
3. **Kategori Kualitatif**: ✅ 5 kategori (SB, B, C, R, SR)
4. **Parameter Deviasi**: ✅ 1.5σ dan 0.5σ
5. **Documentation Compliance**: ✅ Sesuai `penilaian.md`
6. **Test Coverage**: ✅ Semua test cases pass
7. **Frontend Compatibility**: ✅ Display tetap user-friendly
8. **Backward Compatibility**: ✅ Handle existing data properly

## 🚀 **Dependencies**

- **Required**: Database schema validation
- **Required**: Test data preparation
- **Optional**: Data migration script for existing scores
- **Optional**: A/B testing framework

## 📅 **Estimated Timeline**

- **Step 1-2** (Backend Logic): 2-3 hours
- **Step 3** (API Updates): 1-2 hours
- **Step 4** (Frontend Updates): 2-3 hours
- **Step 5** (Testing): 1-2 hours
- **Total**: 6-10 hours

## 🔄 **Rollback Plan**

Jika terjadi issues:
1. Revert ke previous scoring logic
2. Restore backup of existing scores
3. Deploy hotfix dengan formula lama
4. Communicate changes to stakeholders

## 📚 **References**

- [Dokumentasi Scoring](../penilaian.md)
- [PRD V6](../PRD-V6.md)
- [Database Schema](../../../db/schema/jejak.ts)
- [Existing Tests](../../../__tests__/scoring/assessment-scoring.test.ts)