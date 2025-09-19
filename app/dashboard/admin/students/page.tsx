
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
    <div className="p-4 lg:p-6">
      <StudentsSection students={students} />
    </div>
  );
}
