
import { getAdminDashboardData } from "../queries";
import { StudentsSection } from "../_components/admin-dashboard/sections/students-section";

export default async function StudentsPage() {
  const data = await getAdminDashboardData();
  // Map backend data to Student[] shape
  const students = data.students.map((s) => ({
    id: s.id,
    nama: s.name ?? "",
    email: s.email,
    status: "aktif" as "aktif" | "nonaktif",
    dibuatPada: s.createdAt,
  }));
  return (
    <div className="space-y-6 px-4 pb-10 pt-6 lg:px-8">
      <StudentsSection students={students} />
    </div>
  );
}
