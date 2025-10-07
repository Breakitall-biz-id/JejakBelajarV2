CREATE TABLE IF NOT EXISTS teacher_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  CONSTRAINT teacher_feedbacks_teacher_student_project_idx UNIQUE (teacher_id, student_id, project_id)
);

CREATE INDEX IF NOT EXISTS teacher_feedbacks_teacher_idx ON teacher_feedbacks(teacher_id);
CREATE INDEX IF NOT EXISTS teacher_feedbacks_student_idx ON teacher_feedbacks(student_id);
CREATE INDEX IF NOT EXISTS teacher_feedbacks_project_idx ON teacher_feedbacks(project_id);