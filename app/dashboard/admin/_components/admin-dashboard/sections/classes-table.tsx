import type { ParticipantOption } from "./classes-dialogs/types";

export type Kelas = {
  id: string;
  name: string;
  academicTermId: string;
  termLabel: string;
  termStatus: string;
  createdAt: string;
  teacherIds: string[];
  studentIds: string[];
  teachers: ParticipantOption[];
  students: ParticipantOption[];
};
