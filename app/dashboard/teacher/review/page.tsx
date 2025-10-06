import { Metadata } from "next"

import { requireTeacherUser } from "@/lib/auth/session"

import { getTeacherReviewData } from "./queries"
import { TeacherReviewDashboard } from "./_components/teacher-review-dashboard"

export const metadata: Metadata = {
  title: "Review Penilaian • JejakBelajar",
}

export default async function TeacherReviewPage() {
  const session = await requireTeacherUser()
  const data = await getTeacherReviewData(session.user)

  return <TeacherReviewDashboard teacher={session.user} data={data} />
}
