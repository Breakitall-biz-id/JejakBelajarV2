import { TemplateList } from "./templates/template-list"
import type { ProjectTemplate } from "../../../queries"

type TemplatesSectionProps = {
  templates: ProjectTemplate[]
}

export function TemplatesSection({ templates }: TemplatesSectionProps) {
  return (
    <section id="templates" className="space-y-6">
      <TemplateList templates={templates} />
    </section>
  )
}