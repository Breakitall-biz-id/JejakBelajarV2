export const instrumentTypes = [
  { value: "JOURNAL", label: "Jurnal Refleksi", description: "Catatan refleksi berbasis teks" },
  { value: "SELF_ASSESSMENT", label: "Penilaian Diri", description: "Kuisioner evaluasi diri siswa" },
  { value: "PEER_ASSESSMENT", label: "Penilaian Teman", description: "Form evaluasi antar siswa" },
  { value: "OBSERVATION", label: "Observasi", description: "Rubrik observasi guru" },
] as const

export const pjblStages = [
  "Mulai dengan pertanyaan pokok",
  "Buat rencana proyek",
  "Buat jadwal dan waktu",
  "Lakukan penelitian dan kumpulkan informasi",
  "Kembangkan solusi proyek",
  "Presentasikan proyek dan refleksi"
] as const