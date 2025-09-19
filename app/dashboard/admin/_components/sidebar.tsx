import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/admin/overview", label: "Overview" },
  { href: "/dashboard/admin/academic-terms", label: "Tahun Akademik" },
  { href: "/dashboard/admin/classes", label: "Kelas" },
  { href: "/dashboard/admin/teachers", label: "Guru" },
  { href: "/dashboard/admin/students", label: "Siswa" },
  // Tambahkan modul lain jika perlu
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 min-h-screen border-r bg-background p-6 flex flex-col">
      <div className="mb-8">
        <h1 className="text-lg font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-xs text-muted-foreground">JejakBelajar</p>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted",
              pathname === item.href ? "bg-muted text-primary" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {/* Tempatkan menu bawah seperti settings, help, dsb di sini jika perlu */}
    </aside>
  );
}
