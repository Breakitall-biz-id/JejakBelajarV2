"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Target,
  TrendingUp,
  Award,
  ClipboardCheck,
  GraduationCap,
  FileText,
  Star,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthButtons, HeroAuthButtons } from "@/components/auth-buttons";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="text-center py-16 sm:py-24 relative px-4">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <AuthButtons />
            <ThemeToggle />
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              Platform Pembelajaran Interaktif
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-6">
              Jejak Belajar
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Platform pembelajaran yang membantu guru dan murid melacak progres pembelajaran
              dengan sistem penilaian yang komprehensif dan transparan.
            </p>

            <HeroAuthButtons />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-24 max-w-6xl">
        {/* Features Overview */}
        <div className="text-center mb-16">
          <div className="text-5xl sm:text-6xl mb-4">📚</div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Fitur Utama</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Didesain khusus untuk mendukung proses belajar mengajar yang modern dan efektif
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {/* Untuk Guru */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-xl">Untuk Guru</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Buat proyek pembelajaran dengan template yang sudah tersedia</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Monitor progres murid secara real-time</span>
              </li>
              <li className="flex items-start gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Berikan penilaian dan feedback yang komprehensif</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Lihat analitik performa kelas</span>
              </li>
            </ul>
          </Card>

          {/* Untuk Murid */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-700/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <GraduationCap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-xl">Untuk Murid</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Kerjakan tugas dengan instruksi yang jelas</span>
              </li>
              <li className="flex items-start gap-2">
                <Award className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Lihat progres pembelajaran secara visual</span>
              </li>
              <li className="flex items-start gap-2">
                <Star className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Dapatkan feedback langsung dari guru</span>
              </li>
              <li className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Belajar dengan tempo yang sesuai</span>
              </li>
            </ul>
          </Card>

          {/* Instrumen Penilaian */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200/50 dark:border-purple-700/30 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <ClipboardCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-xl">Instrumen Penilaian</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Jurnal Harian</strong> - Refleksi pembelajaran</span>
              </li>
              <li className="flex items-start gap-2">
                <Users className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Peer Assessment</strong> - Penilaian antar murid</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Self Assessment</strong> - Evaluasi diri</span>
              </li>
              <li className="flex items-start gap-2">
                <Award className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm"><strong>Observasi</strong> - Penilaian langsung guru</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Cara Kerja</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proses pembelajaran yang terstruktur dan mudah diikuti
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Guru Membuat Proyek</h3>
            <p className="text-muted-foreground text-sm">
              Guru membuat proyek pembelajaran dengan tahapan dan instrumen penilaian yang jelas
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Murid Mengerjakan</h3>
            <p className="text-muted-foreground text-sm">
              Murid mengerjakan tugas sesuai tahapan yang ditentukan dengan instrumen yang bervariasi
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Monitor & Evaluasi</h3>
            <p className="text-muted-foreground text-sm">
              Guru memantau progres dan memberikan penilaian serta feedback yang konstruktif
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="p-8 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Mulai Perjalanan Belajar Anda</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Bergabunglah dengan Jejak Belajar dan rasakan pengalaman pembelajaran yang lebih terstruktur dan menyenangkan.
          </p>
          <HeroAuthButtons />
        </Card>
      </main>
    </div>
  );
}
