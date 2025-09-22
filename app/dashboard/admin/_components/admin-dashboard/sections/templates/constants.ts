export const instrumentTypes = [
  { value: "JOURNAL", label: "Reflection Journal", description: "Text-based reflection entries" },
  { value: "SELF_ASSESSMENT", label: "Self-Assessment", description: "Student self-evaluation questionnaire" },
  { value: "PEER_ASSESSMENT", label: "Peer Assessment", description: "Peer-to-peer evaluation form" },
  { value: "OBSERVATION", label: "Observation", description: "Teacher observation rubric" },
] as const

export const pjblStages = [
  "Start with the essential question",
  "Design a plan for the project",
  "Create a schedule and timeline",
  "Conduct research and gather information",
  "Develop the project solution",
  "Present the project and reflect"
] as const