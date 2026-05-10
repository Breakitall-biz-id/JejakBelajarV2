# Persiapan Demo Jejak Belajar

## Informasi Umum

- **URL Aplikasi**: http://localhost:3000
- **Proyek Demo**: Produk Minyak Atsiri
- **Kelas**: Emina 2 (Tahun Ajaran 2026/2027 Semester Ganjil)
- **Kelompok**: 2 kelompok × 5 siswa

---

## Akun Demo

### Admin

| Nama | Email | Password |
|------|-------|----------|
| ihsan | ihsansyafiul@gmail.com | *(password existing)* |

### Guru

| Nama | Email | Password |
|------|-------|----------|
| Andry | andry@breakitall.biz.id | *(password existing)* |

### Siswa — Kelompok Sereh

| Nama | Email | Password | Status |
|------|-------|----------|--------|
| Aldi Pratama | aldi@siswa.sch.id | siswa123 | ✅ Semua stage selesai |
| Budi Santoso | budi@siswa.sch.id | siswa123 | Belum mengerjakan |
| Citra Dewi | citra@siswa.sch.id | siswa123 | Belum mengerjakan |
| Dina Rahayu | dina@siswa.sch.id | siswa123 | Belum mengerjakan |
| Eko Wijaya | eko@siswa.sch.id | siswa123 | Belum mengerjakan |

### Siswa — Kelompok Lavender

| Nama | Email | Password | Status |
|------|-------|----------|--------|
| Farah Aulia | farah@siswa.sch.id | siswa123 | Belum mengerjakan |
| Gilang Ramadan | gilang@siswa.sch.id | siswa123 | Belum mengerjakan |
| Hana Pertiwi | hana@siswa.sch.id | siswa123 | Belum mengerjakan |
| Irfan Maulana | irfan@siswa.sch.id | siswa123 | Belum mengerjakan |
| Jasmine Putri | jasmine@siswa.sch.id | siswa123 | Belum mengerjakan |

---

## Kondisi Data Awal (Pre-filled)

Hal-hal berikut sudah ada di database sehingga tidak perlu dilakukan ulang saat demo:

| Data | Kondisi |
|------|---------|
| Tahun ajaran, kelas, template | ✅ Sudah ada |
| Project "Produk Minyak Atsiri" | ✅ Sudah PUBLISHED |
| 2 kelompok + anggota | ✅ Sudah terbentuk |
| Semua submission Aldi (semua stage) | ✅ Sudah ada |
| Observasi guru untuk Aldi (stage 2, 4, 5) | ✅ Sudah ada |
| Teacher feedback untuk Aldi | ✅ Sudah ada |

---

## Alur Demo

### Urutan yang Disarankan

```
1. [ADMIN]   Tunjukkan setup yang sudah ada (singkat, bukan live setup)
2. [GURU]    Tunjukkan project & kelompok yang sudah dibuat
3. [SISWA]   Budi mengerjakan submission live (stage 1 → 2 → dst)
4. [GURU]    Isi observasi & feedback untuk Budi setelah Budi submit
5. [SISWA]   Aldi login → tunjukkan rapor lengkap sebagai hasil akhir
```

---

### 1. ADMIN — Tur Singkat Setup

**Login**: ihsansyafiul@gmail.com

Tujuan: tunjukkan bahwa admin sudah menyiapkan infrastruktur sebelum demo dimulai.

- `/dashboard/admin/academic-terms` → tunjukkan tahun ajaran 2026/2027 Ganjil
- `/dashboard/admin/classes` → tunjukkan kelas Emina 2
- `/dashboard/admin/students` → tunjukkan 10 siswa terdaftar
- `/dashboard/admin/templates` → tunjukkan template Default dengan 13 stage config dan pertanyaan per instrumen
- Selesai — tidak perlu buat apapun, cukup tunjukkan

---

### 2. GURU — Tunjukkan Project & Kelompok

**Login**: andry@breakitall.biz.id

Tujuan: tunjukkan bahwa guru sudah membuat project dan membagi kelompok.

- `/dashboard/teacher` → tunjukkan dashboard, kelas Emina 2 aktif
- `/dashboard/teacher/projects` → buka project **Produk Minyak Atsiri**
- Tunjukkan 6 stage yang terbentuk otomatis dari template
- Tunjukkan tab **Kelompok**:
  - Kelompok Sereh: Aldi, Budi, Citra, Dina, Eko
  - Kelompok Lavender: Farah, Gilang, Hana, Irfan, Jasmine
- Tunjukkan tab **Siswa** → semua masih kosong kecuali Aldi

---

### 3. SISWA — Kerjakan Live

**Login**: budi@siswa.sch.id *(atau siswa lain selain Aldi)*

Tujuan: demo alur pengerjaan siswa dari awal sampai selesai.

#### Stage 1 — Start with the essential question (Jurnal)
- Buka project → klik stage 1
- Baca pertanyaan jurnal, tulis jawaban bebas
- Submit

#### Stage 2 — Design a plan for the project
- **Self-Assessment**: pilih Selalu/Sering/Kadang-kadang/Tidak pernah untuk setiap pernyataan
- **Peer-Assessment**: pilih teman yang dinilai (misal Citra) → isi skor

#### Stage 3 — Create a schedule
- **Self-Assessment**: isi skor
- **Peer-Assessment**: nilai teman

#### Stage 4 — Monitor the students and the progress of the project
- **Self-Assessment**: isi skor
- **Jurnal**: tulis refleksi rasa syukur terhadap alam
- **Jurnal**: tulis cerita kendala dan solusi yang ditemukan

#### Stage 5 — Assess the output
*(Diisi oleh guru via observasi — siswa tidak mengisi stage ini)*

#### Stage 6 — Evaluate the experiences (Jurnal)
- Tulis refleksi dimensi yang berkembang
- Tulis rencana pengembangan diri

---

### 4. GURU — Review & Observasi

**Login**: andry@breakitall.biz.id

Tujuan: tunjukkan alur guru setelah siswa submit.

#### Lihat Submission Budi
- `/dashboard/teacher/review/[classId]/[projectId]`
- Tab **Jurnal** → buka jawaban Budi, tunjukkan isi refleksinya
- Tab **Self-Assessment** → lihat skor yang Budi berikan untuk dirinya
- Tab **Peer-Assessment** → lihat skor yang Budi berikan ke temannya

#### Isi Observasi untuk Budi (Stage 2 & 4)
- Pilih Budi → stage **Design a plan**
- Isi skor observasi per indikator (1–4):
  - Siswa menyampaikan data/fakta yang berkaitan dengan proyek
  - Siswa mengajukan pertanyaan untuk memperjelas informasi
- Simpan

#### Nilai Jurnal Budi
- Buka jurnal Budi → berikan skor per rubrik indikator
- Simpan

#### Berikan Feedback Naratif
- Tulis feedback untuk Budi
- Simpan

---

### 5. SISWA — Lihat Rapor (Aldi sebagai contoh hasil akhir)

**Login**: aldi@siswa.sch.id

Tujuan: tunjukkan tampilan rapor lengkap sebagai hasil akhir proyek.

- Buka menu **Rapor** → project Produk Minyak Atsiri
- Tunjukkan skor per dimensi + kategori (Sangat Baik / Baik / Cukup / Kurang):
  - Keimanan dan Ketakwaan
  - Penalaran Kritis
  - Kolaborasi
  - Kreativitas
  - Kemandirian
  - Komunikasi
- Tunjukkan **feedback dari guru Andry**
- Tunjukkan **rekap peer-assessment** dari teman
- Download PDF rapor

---

### 6. GURU — Export Rekap Kelas

**Login**: andry@breakitall.biz.id

- `/dashboard/teacher/reports/[classId]`
- Tunjukkan tabel nilai semua siswa per dimensi
- Export ke Excel/PDF

---

## Checklist Sebelum Demo

- [ ] Jalankan aplikasi: `npm run dev`
- [ ] Test login admin: ihsansyafiul@gmail.com
- [ ] Test login guru: andry@breakitall.biz.id
- [ ] Test login Aldi: aldi@siswa.sch.id → pastikan rapor muncul
- [ ] Test login Budi: budi@siswa.sch.id → pastikan belum ada submission
- [ ] Siapkan 2 browser berbeda (atau incognito) untuk demo multi-role
- [ ] Pastikan koneksi internet stabil (database di Neon cloud)
