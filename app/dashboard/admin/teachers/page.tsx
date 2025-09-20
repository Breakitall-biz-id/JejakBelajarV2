

import { TeachersSection } from "../_components/admin-dashboard/sections/teachers-section"
import { getAdminDashboardData } from "../queries";


export default async function TeachersPage() {
  const data = await getAdminDashboardData();
  const teachers = data.teachers.map((t) => ({
    id: t.id,
    nama: t.name ?? "",
    email: t.email,
    status: "aktif" as "aktif" | "nonaktif",
    dibuatPada: t.createdAt,
  }));
  return (
    <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      <TeachersSection teachers={teachers} />
    </div>
  );
}
