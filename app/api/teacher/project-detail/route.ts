import { NextResponse } from "next/server"
import { requireTeacherUser } from "@/lib/auth/session"
import { getProjectDetail } from "../../../dashboard/teacher/review/queries"

export async function GET(request: Request) {
  try {
    const session = await requireTeacherUser()

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const projectId = searchParams.get("projectId")

    if (!classId || !projectId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const projectDetail = await getProjectDetail(classId, projectId, session.user)

    if (!projectDetail) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json(projectDetail)
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}