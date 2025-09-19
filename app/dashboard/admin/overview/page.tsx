export default function AdminOverviewPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Dummy cards, ganti dengan data dinamis */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-xs text-muted-foreground mb-2">Total Students</div>
          <div className="text-2xl font-bold">1,234</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-xs text-muted-foreground mb-2">Total Teachers</div>
          <div className="text-2xl font-bold">56</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-xs text-muted-foreground mb-2">Active Classes</div>
          <div className="text-2xl font-bold">18</div>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="text-xs text-muted-foreground mb-2">Active Term</div>
          <div className="text-2xl font-bold">2025/2026 - Odd</div>
        </div>
      </div>
      {/* Tambahkan chart, statistik, dsb di sini */}
    </div>
  );
}
