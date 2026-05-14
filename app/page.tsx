"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Award,
  ClipboardCheck,
  FileText,
  Star,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
      <span className="w-1.5 h-1.5 bg-white rounded-full" />
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Nav */}
      <nav className="border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Image src="/jejak-belajar-logo.svg" alt="" width={28} height={28} className="rounded-md" />
            <span className="font-semibold">JejakBelajar</span>
          </div>
          <div className="flex items-center gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-purple-50/30 to-transparent dark:from-blue-950/20 dark:via-purple-950/10 dark:to-transparent pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 py-20 sm:py-28 text-center">
          <div className="flex justify-center mb-6">
            <Pill>Platform Asesmen Interaktif</Pill>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1] text-blue-600">
            Jejak Belajar
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Platform asesmen yang membantu guru dan siswa untuk merefleksikan tiap langkah pembelajaran,
            karena asesmen bukan sekedar angka, ada jejak belajar yang sarat makna.
          </p>
          <HeroAuthButtons />
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6">
        {/* Fitur Utama */}
        <section className="py-20 sm:py-24 border-t border-slate-200/60 dark:border-slate-800">
          <div className="max-w-3xl mb-12">
            <div className="mb-5">
              <Pill>Fitur Utama</Pill>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-[1.15]">
              Didesain khusus untuk
              <br />
              project-based learning
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              Mendukung pembelajaran khususnya project-based learning — dengan instrumen yang
              terintegrasi dan alur kerja yang jelas untuk guru dan siswa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Untuk Guru */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold mb-3">Untuk Guru</h3>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Buat proyek pembelajaran dengan template yang sudah tersedia</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Monitor progres siswa secara real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <ClipboardCheck className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Berikan penilaian dan feedback yang komprehensif</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Lihat analitik performa kelas</span>
                </li>
              </ul>
            </Card>

            {/* Untuk Siswa */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-3">Untuk Siswa</h3>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Refleksikan proses belajar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Lakukan penilaian diri dan penilaian teman sebaya</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Dapatkan feedback dari guru maupun teman</span>
                </li>
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Gunakan feedback untuk perbaikan</span>
                </li>
              </ul>
            </Card>

            {/* Instrumen Penilaian */}
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950 rounded-lg flex items-center justify-center mb-4">
                <ClipboardCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold mb-3">Instrumen Penilaian</h3>
              <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-900 dark:text-slate-100">Jurnal Reflektif</strong> — Refleksi pembelajaran</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-900 dark:text-slate-100">Peer Assessment</strong> — Penilaian antar siswa</span>
                </li>
                <li className="flex items-start gap-2">
                  <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-900 dark:text-slate-100">Self Assessment</strong> — Evaluasi diri</span>
                </li>
                <li className="flex items-start gap-2">
                  <Award className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <span><strong className="text-slate-900 dark:text-slate-100">Lembar Observasi</strong> — Penilaian langsung guru</span>
                </li>
              </ul>
            </Card>
          </div>
        </section>

        {/* Cara Kerja */}
        <section className="py-20 sm:py-24 border-t border-slate-200/60 dark:border-slate-800">
          <div className="max-w-3xl mb-12">
            <div className="mb-5">
              <Pill>Cara Kerja</Pill>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-[1.15]">
              Asesmen yang menyatu
              <br />
              dengan pembelajaran
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed">
              Asesmen terintegrasi dalam aktivitas pembelajaran dan bersifat <em>on going</em>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800">
              <div className="text-sm font-mono text-slate-400 mb-3">01</div>
              <h3 className="font-semibold mb-2">Rancang Proyek dan Kriteria</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Guru menyiapkan proyek, tujuan, kriteria keberhasilan, instrumen penilaian yang jelas.
              </p>
            </Card>
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800">
              <div className="text-sm font-mono text-slate-400 mb-3">02</div>
              <h3 className="font-semibold mb-2">Belajar, Menilai & Merefleksi</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Siswa mengerjakan proyek, melakukan penilaian diri dan teman, serta merefleksikan
                proses belajarnya.
              </p>
            </Card>
            <Card className="p-6 border border-slate-200/80 dark:border-slate-800">
              <div className="text-sm font-mono text-slate-400 mb-3">03</div>
              <h3 className="font-semibold mb-2">Terima Feedback & Perbaiki</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Siswa menggunakan feedback dari guru dan teman untuk melakukan perbaikan
                secara berkelanjutan.
              </p>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-24 border-t border-slate-200/60 dark:border-slate-800">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl px-8 sm:px-12 py-14 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-5 leading-[1.15]">
              Mulai Perjalanan
              <br />
              Belajar Anda
            </h2>
            <p className="text-blue-100 text-base sm:text-lg max-w-xl mx-auto mb-8">
              Bergabunglah dengan Jejak Belajar dan rasakan pengalaman yang membantu Anda melihat
              perkembangan diri dan memahami hal yang perlu diperbaiki.
            </p>
            <HeroAuthButtons />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/60 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Image src="/jejak-belajar-logo.svg" alt="" width={20} height={20} className="rounded" />
            <span>© {new Date().getFullYear()} JejakBelajar</span>
          </div>
          <p>Platform asesmen untuk project-based learning.</p>
        </div>
      </footer>
    </div>
  );
}
