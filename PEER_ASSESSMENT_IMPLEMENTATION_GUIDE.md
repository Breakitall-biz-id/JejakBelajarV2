# Guide Implementasi Peer Assessment di Teacher Report

## **Overview**
Dokumen ini menjelaskan bagaimana peer assessment bekerja di student dashboard dan bagaimana mengimplementasikannya di teacher report.

## **1. Cara Kerja Peer Assessment pada Student**

### **A. Struktur Data**
```typescript
// Database Schema untuk Peer Assessment
type PeerAssessmentSubmission = {
  id: string
  studentId: string              // ID siswa yang memberi penilaian
  targetStudentId: string        // ID siswa yang dinilai
  projectId: string
  stageId: string
  instrumentType: "PEER_ASSESSMENT"
  content: { answers: number[] } // Rating scale 1-4
  submittedAt: Date
}

// Rating Scale yang digunakan
const SCALE = [
  { value: 4, label: "Selalu" },
  { value: 3, label: "Sering" }, 
  { value: 2, label: "Kadang-kadang" },
  { value: 1, label: "Tidak Pernah" },
]
```

### **B. Proses Submit Peer Assessment**
```typescript
// Filter anggota grup (menghindari self-assessment)
const filteredMembers = members.filter((m) => m.id !== currentUserId)

// Submit individual untuk setiap peer
for (let i = 0; i < filteredMembers.length; i++) {
  const member = filteredMembers[i]
  const answer = answers[i] // Rating 1-4
  
  await submitStageInstrument({
    projectId,
    stageId,
    instrumentType: "PEER_ASSESSMENT",
    content: { answers: [answer] },
    targetStudentId: member.id  // Kunci utama: yang dinilai
  })
}
```

### **C. UI Component Structure**
- **Dialog**: Modal untuk peer assessment
- **Radio Group**: Pilihan rating 1-4 untuk setiap peer
- **Validation**: Semua peer harus dinilai sebelum submit
- **Individual Submission**: Setiap peer mendapat submission terpisah

## **2. Implementasi di Teacher Report**

### **A. Update Database Query**
```typescript
// Tambah PEER_ASSESSMENT ke instrumen yang di-grade teacher
const TEACHER_GRADED_INSTRUMENTS = [
  "OBSERVATION", 
  "JOURNAL", 
  "DAILY_NOTE", 
  "PEER_ASSESSMENT"  // TAMBAHAN
] as const

// Update MetricsAccumulator type
type MetricsAccumulator = {
  // ... existing fields
  scoreSums: {
    observation: number
    journal: number
    dailyNote: number
    peerAssessment: number  // TAMBAHAN
  }
  scoreCounts: {
    observation: number
    journal: number
    dailyNote: number
    peerAssessment: number  // TAMBAHAN
  }
}
```

### **B. Update Switch Case Handler**
```typescript
switch (instrument) {
  case "OBSERVATION":
    metrics.scoreSums.observation += row.score
    metrics.scoreCounts.observation += 1
    break
  case "JOURNAL":
    metrics.scoreSums.journal += row.score
    metrics.scoreCounts.journal += 1
    break
  case "DAILY_NOTE":
    metrics.scoreSums.dailyNote += row.score
    metrics.scoreCounts.dailyNote += 1
    break
  case "PEER_ASSESSMENT":  // TAMBAHAN
    metrics.scoreSums.peerAssessment += row.score
    metrics.scoreCounts.peerAssessment += 1
    break
}
```

### **C. Update Average Score Calculation**
```typescript
const averageScores = {
  observation: metrics.scoreCounts.observation > 0
    ? Number((metrics.scoreSums.observation / metrics.scoreCounts.observation).toFixed(2))
    : null,
  journal: metrics.scoreCounts.journal > 0
    ? Number((metrics.scoreSums.journal / metrics.scoreCounts.journal).toFixed(2))
    : null,
  dailyNote: metrics.scoreCounts.dailyNote > 0
    ? Number((metrics.scoreSums.dailyNote / metrics.scoreCounts.dailyNote).toFixed(2))
    : null,
  peerAssessment: metrics.scoreCounts.peerAssessment > 0  // TAMBAHAN
    ? Number((metrics.scoreSums.peerAssessment / metrics.scoreCounts.peerAssessment).toFixed(2))
    : null,
}
```

### **D. Update UI Table Header**
```tsx
<TableRow>
  <TableHead>Class</TableHead>
  <TableHead>Students</TableHead>
  <TableHead>Projects</TableHead>
  <TableHead>Stages</TableHead>
  <TableHead>Completion</TableHead>
  <TableHead>Observation avg.</TableHead>
  <TableHead>Reflection avg.</TableHead>
  <TableHead>Daily note avg.</TableHead>
  <TableHead>Peer assessment avg.</TableHead>  {/* TAMBAHAN */}
  <TableHead className="text-right">Actions</TableHead>
</TableRow>
```

### **E. Update Table Data Cell**
```tsx
<TableCell>{formatScore(item.averageScores?.observation)}</TableCell>
<TableCell>{formatScore(item.averageScores?.journal)}</TableCell>
<TableCell>{formatScore(item.averageScores?.dailyNote)}</TableCell>
<TableCell>{formatScore(item.averageScores?.peerAssessment)}</TableCell>  {/* TAMBAHAN */}
```

### **F. Update CSV Export**
```typescript
// Header CSV
const rows: CsvRow[] = [
  [
    "Class",
    "Students", 
    "Projects",
    "Stages",
    "Completed assignments",
    "Completion rate (%)",
    "Observation avg",
    "Reflection avg", 
    "Daily note avg",
    "Peer assessment avg",  // TAMBAHAN
    "Last submission",
  ],
]

// Data CSV
rows.push([
  item.name,
  item.totalStudents,
  item.totalProjects,
  item.totalStages,
  item.completedAssignments,
  item.completionRate,
  formatCsvNumber(item.averageScores.observation),
  formatCsvNumber(item.averageScores.journal),
  formatCsvNumber(item.averageScores.dailyNote),
  formatCsvNumber(item.averageScores.peerAssessment),  // TAMBAHAN
  item.lastSubmissionAt ?? "",
])
```

## **3. Karakteristik Khusus Peer Assessment**

### **A. Multiple Target Students**
- Satu siswa bisa menilai multiple peers dalam satu stage
- Setiap penilaian disimpan sebagai submission terpisah dengan `targetStudentId` berbeda
- Rata-rata dihitung dari semua penilaian yang diterima siswa

### **B. Scoring System**
- Scale 1-4 (Tidak Pernah → Kadang-kadang → Sering → Selalu)
- Teacher bisa memberikan feedback tambahan pada submission
- Teacher bisa memberikan score manual jika diperlukan

### **C. Group Dynamics**
- Hanya anggota grup yang bisa saling menilai
- Self-assessment tidak diperbolehkan (filtered out)
- Progress stage tergantung pada completion peer assessment

## **4. Files yang Telah Dimodifikasi**

1. **`/app/dashboard/teacher/reports/queries.ts`**
   - Update `TeacherReportData` type
   - Update `MetricsAccumulator` type  
   - Update `TEACHER_GRADED_INSTRUMENTS`
   - Update switch case handler
   - Update average score calculation

2. **`/app/dashboard/teacher/reports/_components/teacher-reports-dashboard.tsx`**
   - Update table header
   - Update table data cells

3. **`/app/api/teacher/reports/route.ts`**
   - Update CSV headers
   - Update CSV data rows

## **5. Testing Checklist**

- [ ] Peer assessment submissions ditampilkan di teacher report
- [ ] Average score peer assessment dihitung dengan benar
- [ ] CSV export include kolom peer assessment
- [ ] Table responsive dengan kolom tambahan
- [ ] Handling null values untuk kelas tanpa peer assessment

## **6. Langkah Selanjutnya (Optional Enhancement)**

1. **Detail Breakdown**: Tampilkan siapa menilai siapa
2. **Peer Assessment Matrix**: Visualisasi heatmap penilaian
3. **Outlier Detection**: Identifikasi penilaian yang tidak konsisten
4. **Group Performance**: Rata-rata penilaian per grup
5. **Individual Peer Rating**: Rating yang diterima vs yang diberikan

---

Implementasi ini memungkinkan teacher untuk:
- Melihat rata-rata peer assessment per kelas
- Export data peer assessment ke CSV
- Memantau progress peer assessment dalam grup
- Menganalisis performa kolaborasi antar siswa