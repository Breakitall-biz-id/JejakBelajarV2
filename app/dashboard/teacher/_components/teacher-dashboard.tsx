"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Edit,
  ListChecks,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash,
  Users,
  BarChart3,
  ClipboardCheck,
  CheckCircle2,
  Archive,
  Target,
  Clock,
  FileText,
} from "lucide-react"

import type { CurrentUser } from "@/lib/auth/session"
import type { TeacherDashboardData } from "../queries"
import type { ProjectTemplate } from "../actions"
import { getProjectTemplates } from "../actions"
import {
  createGroup,
  createProject,
  createProjectStage,
  deleteGroup,
  deleteProject,
  deleteProjectStage,
  reorderProjectStages,
  setStageInstruments,
  updateGroup,
  updateGroupMembers,
  updateProject,
  updateProjectStage,
  updateProjectStatus,
} from "../actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

type TeacherDashboardProps = {
  teacher: CurrentUser
  data: TeacherDashboardData
  projectStatusOptions: readonly string[]
  instrumentOptions: readonly string[]
}

// Empty State Component
function EmptyState({ title, description, icon }: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-muted-foreground mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">{description}</p>
    </div>
  )
}

export function TeacherDashboard({
  teacher,
  data,
  projectStatusOptions,
  instrumentOptions,
}: TeacherDashboardProps) {
  const router = useRouter()

  const projectsByClass = useMemo(() => {
    const map = new Map<string, TeacherDashboardData["projects"]>()

    for (const project of data.projects) {
      if (!map.has(project.classId)) {
        map.set(project.classId, [])
      }
      map.get(project.classId)!.push(project)
    }

    return map
  }, [data.projects])

  const activeProjects = data.projects.filter(p => p.status === 'PUBLISHED').length
  const totalStudents = Object.values(data.studentsByClass).reduce((acc, students) => acc + students.length, 0)
  const totalClasses = data.classes.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {teacher.name ?? teacher.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/teacher/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/teacher/review">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Review
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Classes</p>
                <p className="text-2xl font-bold text-foreground">{totalClasses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold text-foreground">{activeProjects}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-foreground">12</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {data.classes.length === 0 ? (
          <EmptyState
            title="No Classes Assigned"
            description="You are not assigned to any classes yet. Contact your school administrator to get started."
            icon={<Users className="h-12 w-12" />}
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {data.classes.map((classInfo) => (
              <ClassProjectsCard
                key={classInfo.id}
                classInfo={classInfo}
                projects={projectsByClass.get(classInfo.id) ?? []}
                students={data.studentsByClass[classInfo.id] ?? []}
                projectStatusOptions={projectStatusOptions}
                instrumentOptions={instrumentOptions}
                router={router}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

type ClassStudent = {
  studentId: string
  name: string | null
  email: string
}

type ClassProjectsCardProps = {
  classInfo: TeacherDashboardData["classes"][number]
  projects: TeacherDashboardData["projects"]
  students: ClassStudent[]
  projectStatusOptions: readonly string[]
  instrumentOptions: readonly string[]
  router: ReturnType<typeof useRouter>
}

function ClassProjectsCard({
  classInfo,
  projects,
  students,
  projectStatusOptions,
  instrumentOptions,
  router,
}: ClassProjectsCardProps) {
  const activeProjects = projects.filter(p => p.status === 'PUBLISHED')

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      {/* Class Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{classInfo.name}</h3>
            <p className="text-sm text-muted-foreground">
              {classInfo.academicYear} • {classInfo.semester === "ODD" ? "Ganjil" : "Genap"}
            </p>
          </div>
          <Badge
            variant={classInfo.termStatus === "ACTIVE" ? "default" : "secondary"}
            className="px-3 py-1"
          >
            {classInfo.termStatus === "ACTIVE" ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{projects.length}</p>
              <p className="text-xs text-muted-foreground">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{activeProjects.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{students.length}</p>
              <p className="text-xs text-muted-foreground">Students</p>
            </div>
          </div>
          <CreateProjectDialog classId={classInfo.id} router={router} />
        </div>
      </div>

      {/* Projects List */}
      <div className="p-6">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">No Projects Yet</h4>
            <p className="text-muted-foreground text-sm">
              Create your first project to start managing PjBL activities
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                classId={classInfo.id}
                students={students}
                projectStatusOptions={projectStatusOptions}
                router={router}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Group Card Component
function GroupCard({ group, projectId, students, router }: {
  group: TeacherDashboardData['projects'][number]['groups'][number]
  projectId: string
  students: ClassStudent[]
  router: ReturnType<typeof useRouter>
}) {
  return (
    <div className="border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-muted rounded-lg">
              <Users className="h-4 w-4 text-foreground" />
            </div>
            <h4 className="font-semibold text-foreground">{group.name}</h4>
            <Badge variant="secondary" className="ml-2">
              {group.members.length} members
            </Badge>
          </div>

          {group.members.length > 0 ? (
            <div className="ml-11">
              <div className="flex flex-wrap gap-2">
                {group.members.slice(0, 3).map((member) => (
                  <Badge key={member.studentId} variant="outline" className="text-xs">
                    {member.studentName ?? member.studentId.slice(0, 8)}
                  </Badge>
                ))}
                {group.members.length > 3 && (
                  <Badge variant="outline" className="text-xs bg-muted">
                    +{group.members.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground ml-11">No members assigned</p>
          )}
        </div>

        <div className="flex gap-1 ml-4">
          <EditGroupDialog
            group={group}
            projectId={projectId}
            router={router}
          />
          <EditGroupMembersDialog
            group={group}
            projectId={projectId}
            students={students}
            router={router}
          />
          <DeleteGroupButton groupId={group.id} router={router} />
        </div>
      </div>
    </div>
  )
}

function CreateProjectDialog({ classId, router }: { classId: string; router: ReturnType<typeof useRouter> }) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [templates, setTemplates] = useState<ProjectTemplate[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false)

  // Load templates when dialog opens
  useEffect(() => {
    if (open) {
      loadTemplates()
    }
  }, [open])

  const loadTemplates = async () => {
    setIsLoadingTemplates(true)
    try {
      const templateData = await getProjectTemplates()
      setTemplates(templateData)
    } catch (error) {
      console.error("Failed to load templates:", error)
      setFormError("Failed to load project templates")
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const formSchema = useMemo(
    () =>
      z.object({
        templateId: z.string().min(1, "Please select a project template"),
        title: z.string().trim().min(1, "Project title is required").max(255),
        theme: z.string().trim().optional(),
        description: z.string().trim().optional(),
      }),
    [],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      templateId: "",
      title: "",
      theme: "",
      description: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setFormError(null)
    startTransition(async () => {
      const result = await createProject({
        classId,
        templateId: values.templateId,
        title: values.title,
        theme: values.theme?.trim() || undefined,
        description: values.description?.trim() || undefined,
      })

      if (!result.success) {
        setFormError(result.error)
        return
      }

      toast.success("Project created with template.")
      form.reset()
      setTemplates([])
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          form.reset()
        }
        setOpen(newOpen)
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Pilih template untuk memulai proyek.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="templateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Proyek</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value)
                      }}
                      value={field.value}
                      className="space-y-3"
                    >
                      {isLoadingTemplates ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                          <span className="text-sm text-muted-foreground">Memuat template...</span>
                        </div>
                      ) : templates.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-muted-foreground/30 rounded-xl bg-background">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <h3 className="text-base font-medium text-foreground mb-1">Tidak ada template</h3>
                          <p className="text-sm text-muted-foreground">Hubungi admin untuk menambahkan template proyek</p>
                        </div>
                      ) : (
                        <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                          {templates.map((template) => {
                            const totalStages = new Set(template.stageConfigs.map((c) => c.stageName)).size
                            const instruments = Array.from(new Set(template.stageConfigs.map((c) => c.instrumentType)))
                            const duration = template.stageConfigs.length > 0
                              ? `${Math.ceil(template.stageConfigs.length / 2)} weeks`
                              : "Flexible"

                            return (
                              <div key={template.id} className="flex items-start space-x-3 p-1">
                                <RadioGroupItem
                                  value={template.id}
                                  id={template.id}
                                  className="mt-3"
                                />
                                <label
                                  htmlFor={template.id}
                                  className="flex flex-1 cursor-pointer rounded-xl border border-border hover:border-primary/50 hover:shadow-sm transition-all duration-200 p-4 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5 [&:has([data-state=checked])]:shadow-md"
                                >
                                  <div className="flex flex-col w-full gap-3">
                                    <div className="flex items-center justify-between">
                                      <div className="font-semibold text-foreground">{template.templateName}</div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="bg-muted px-2 py-1 rounded-md">{totalStages} stages</span>
                                        <span className="bg-muted px-2 py-1 rounded-md">{duration}</span>
                                      </div>
                                    </div>
                                    {template.description && (
                                      <p className="text-sm text-muted-foreground leading-relaxed">{template.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                      {instruments.map((instrument: string) => (
                                        <Badge
                                          key={instrument}
                                          variant="outline"
                                          className="text-xs px-2 py-1 border-muted-foreground/50"
                                        >
                                          {instrument.replace(/_/g, " ").toLowerCase()}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </label>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Proyek</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Proyek Kebun Sekolah"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tema (Opsional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hidup Hijau"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Tujuan proyek"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Membuat...
                  </>
                ) : (
                  "Buat Proyek"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

type ProjectCardProps = {
  project: TeacherDashboardData["projects"][number]
  classId: string
  students: TeacherDashboardData["studentsByClass"][string] | []
  projectStatusOptions: readonly string[]
  router: ReturnType<typeof useRouter>
}

function ProjectCard({
  project,
  classId,
  students,
  projectStatusOptions,
  router,
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isStatusPending, startStatusTransition] = useTransition()

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-muted text-foreground',
    PUBLISHED: 'bg-muted text-foreground',
    ARCHIVED: 'bg-muted text-foreground',
  }

  const statusIcons: Record<string, React.ReactNode> = {
    DRAFT: <Edit className="h-4 w-4" />,
    PUBLISHED: <CheckCircle2 className="h-4 w-4" />,
    ARCHIVED: <Archive className="h-4 w-4" />,
  }

  const handleStatusChange = (status: string) => {
    if (status === project.status) return

    startStatusTransition(async () => {
      const result = await updateProjectStatus({
        projectId: project.id,
        status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Project status updated.")
      router.refresh()
    })
  }

  const displayStages = isExpanded ? project.stages : project.stages.slice(0, 2)
  const hasMoreStages = !isExpanded && project.stages.length > 2

  return (
    <div className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 bg-card">
      {/* Project Header */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground text-sm truncate">{project.title}</h4>
              {project.theme && (
                <Badge variant="secondary" className="text-xs">
                  {project.theme}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {project.description ?? "No description provided."}
            </p>
          </div>

          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            <Badge className={`${statusColors[project.status]} text-xs px-2 py-1`}>
              {statusIcons[project.status]}
              <span className="ml-1">{project.status}</span>
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isStatusPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-3 w-3" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {projectStatusOptions.map((statusOption) => (
                  <DropdownMenuItem
                    key={statusOption}
                    onClick={() => handleStatusChange(statusOption)}
                    className="cursor-pointer"
                  >
                    {statusOption.charAt(0) + statusOption.slice(1).toLowerCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <ListChecks className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.stages.length} stages</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.groups.length} groups</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {project.groups.reduce((acc, group) => acc + group.members.length, 0)} students
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/dashboard/teacher/projects/${project.id}`}>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                View Details
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

        {/* Stages List */}
        {displayStages.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-medium text-muted-foreground">
                {isExpanded ? "All Stages" : "Early Stages"}
                {isExpanded && (
                  <span className="text-xs text-muted-foreground ml-1">({project.stages.length})</span>
                )}
              </h5>
              {hasMoreStages && (
                <Badge variant="outline" className="text-xs">
                  +{project.stages.length - 2} more
                </Badge>
              )}
            </div>
            <div className={`space-y-1 ${isExpanded ? "max-h-64 overflow-y-auto pr-2" : ""}`}>
              {displayStages.map((stage, index) => (
                <div key={stage.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                  <Badge variant="secondary" className="text-xs h-5 px-2 flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-foreground truncate">{stage.name}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {stage.unlocksAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(stage.unlocksAt).toLocaleDateString()}
                          </span>
                        )}
                        {stage.dueAt && (
                          <span className="text-xs text-muted-foreground">
                            • {new Date(stage.dueAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {stage.instruments.length > 0 && (
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {stage.instruments.length}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30 p-3 space-y-4">
          <div className="flex gap-2">
            <EditProjectDialog project={project} classId={classId} router={router} />
            <DeleteProjectButton projectId={project.id} router={router} />
          </div>

          {/* Compact Groups List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-foreground">Groups ({project.groups.length})</h5>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => router.push(`/dashboard/teacher/projects/${project.id}`)}
              >
                Manage Groups
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {project.groups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-2 bg-background border border-border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate">{group.name}</span>
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {group.members.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <EditGroupDialog
                      group={group}
                      projectId={project.id}
                      router={router}
                    />
                    <EditGroupMembersDialog
                      group={group}
                      projectId={project.id}
                      students={students}
                      router={router}
                    />
                    <DeleteGroupButton groupId={group.id} router={router} />
                  </div>
                </div>
              ))}
            </div>
            {project.groups.length === 0 && (
              <div className="text-center py-4 border border-dashed border-border rounded-md bg-muted/20">
                <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No groups created yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create groups to organize students</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type EditProjectDialogProps = {
  project: TeacherDashboardData["projects"][number]
  classId: string
  router: ReturnType<typeof useRouter>
}

function EditProjectDialog({ project, classId, router }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const formSchema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(1, "Project title is required").max(255),
        theme: z.string().trim().optional(),
        description: z.string().trim().optional(),
      }),
    [],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: project.title,
      theme: project.theme ?? "",
      description: project.description ?? "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setFormError(null)
    startTransition(async () => {
      const result = await updateProject({
        projectId: project.id,
        classId,
        title: values.title,
        theme: values.theme?.trim() || undefined,
        description: values.description?.trim() || undefined,
      })

      if (!result.success) {
        setFormError(result.error)
        return
      }

      toast.success("Project updated.")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" /> Edit project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit project</DialogTitle>
          <DialogDescription>Update the project information for this class.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset()
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteProjectButton({ projectId, router }: { projectId: string; router: ReturnType<typeof useRouter> }) {
  const [isPending, startTransition] = useTransition()

  const onConfirm = () => {
    startTransition(async () => {
      const result = await deleteProject({ projectId })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Project deleted.")
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={isPending}>
          <Trash className="mr-2 h-4 w-4" />
          {isPending ? "Deleting…" : "Delete"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete project?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the project, its stages, and associated student groups. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}



type StageItemProps = {
  stage: TeacherDashboardData["projects"][number]["stages"][number]
  project: TeacherDashboardData["projects"][number]
  index: number
  totalStages: number
  instrumentOptions: readonly string[]
  router: ReturnType<typeof useRouter>
}

function StageItem({
  stage,
  project,
  index,
  totalStages,
  instrumentOptions,
  router,
}: StageItemProps) {
  const [isDeleting, startDelete] = useTransition()
  const [isReordering, startReorder] = useTransition()

  const moveStage = (direction: "up" | "down") => {
    const stageOrder = project.stages.map((item) => item.id)
    const currentIndex = stageOrder.indexOf(stage.id)
    const delta = direction === "up" ? -1 : 1
    const targetIndex = currentIndex + delta

    if (targetIndex < 0 || targetIndex >= stageOrder.length) {
      return
    }

    const newOrder = [...stageOrder]
    const temp = newOrder[targetIndex]
    newOrder[targetIndex] = newOrder[currentIndex]
    newOrder[currentIndex] = temp

    startReorder(async () => {
      const result = await reorderProjectStages({
        projectId: project.id,
        stageOrder: newOrder,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      router.refresh()
    })
  }

  const deleteStage = () => {
    startDelete(async () => {
      const result = await deleteProjectStage({ stageId: stage.id })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Stage deleted.")
      router.refresh()
    })
  }

  return (
    <div className="rounded-lg border bg-muted/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Stage {index + 1}</Badge>
            <h4 className="font-semibold">{stage.name}</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {stage.description || "No description provided."}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {stage.unlocksAt && <span>Unlocks: {formatDate(stage.unlocksAt)}</span>}
            {stage.dueAt && <span>Due: {formatDate(stage.dueAt)}</span>}
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled={isReordering || index === 0}
            onClick={() => moveStage("up")}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={isReordering || index === totalStages - 1}
            onClick={() => moveStage("down")}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <EditStageDialog stage={stage} project={project} router={router} />
          <StageInstrumentsDialog
            stage={stage}
            instrumentOptions={instrumentOptions}
            router={router}
          />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete stage?</AlertDialogTitle>
                <AlertDialogDescription>
                  Students will lose access to any submissions tied to this stage.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteStage} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {stage.instruments.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {stage.instruments.map((instrument) => (
            <Badge key={instrument.id} variant="outline">
              {instrument.instrumentType.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          No assessment instruments linked. Students will not be able to submit evidence yet.
        </p>
      )}
    </div>
  )
}

function formatDate(value: string | null) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value))
  } catch (error) {
    console.warn("Unable to format date", value, error)
    return value
  }
}

function CreateStageDialog({ projectId, router }: { projectId: string; router: ReturnType<typeof useRouter> }) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, "Stage name is required"),
        description: z.string().trim().optional(),
        unlocksAt: z.string().optional(),
        dueAt: z.string().optional(),
      }),
    [],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      unlocksAt: "",
      dueAt: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setFormError(null)
    startTransition(async () => {
      const result = await createProjectStage({
        projectId,
        name: values.name,
        description: values.description?.trim() || undefined,
        unlocksAt: values.unlocksAt || undefined,
        dueAt: values.dueAt || undefined,
      })

      if (!result.success) {
        setFormError(result.error)
        return
      }

      toast.success("Stage created.")
      form.reset()
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add stage
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add stage</DialogTitle>
          <DialogDescription>
            Map the PjBL syntax to sequential stages. Students unlock stages in order.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage name</FormLabel>
                  <FormControl>
                    <Input placeholder="Stage 1: Essential Question" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="unlocksAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unlock date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create stage"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

type EditStageDialogProps = {
  stage: TeacherDashboardData["projects"][number]["stages"][number]
  project: TeacherDashboardData["projects"][number]
  router: ReturnType<typeof useRouter>
}

function EditStageDialog({ stage, project, router }: EditStageDialogProps) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, "Stage name is required"),
        description: z.string().trim().optional(),
        unlocksAt: z.string().optional(),
        dueAt: z.string().optional(),
      }),
    [],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: stage.name,
      description: stage.description ?? "",
      unlocksAt: stage.unlocksAt ? stage.unlocksAt.slice(0, 10) : "",
      dueAt: stage.dueAt ? stage.dueAt.slice(0, 10) : "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setFormError(null)
    startTransition(async () => {
      const result = await updateProjectStage({
        stageId: stage.id,
        projectId: project.id,
        name: values.name,
        description: values.description?.trim() || undefined,
        unlocksAt: values.unlocksAt || undefined,
        dueAt: values.dueAt || undefined,
      })

      if (!result.success) {
        setFormError(result.error)
        return
      }

      toast.success("Stage updated.")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit stage</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="unlocksAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unlock date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ?? ""} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function StageInstrumentsDialog({
  stage,
  instrumentOptions,
  router,
}: {
  stage: TeacherDashboardData["projects"][number]["stages"][number]
  instrumentOptions: readonly string[]
  router: ReturnType<typeof useRouter>
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set(stage.instruments.map((i) => i.instrumentType)))
  const [isPending, startTransition] = useTransition()

  const toggleInstrument = (instrument: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(instrument)
      } else {
        next.delete(instrument)
      }
      return next
    })
  }

  const submit = () => {
    startTransition(async () => {
      const result = await setStageInstruments({
        stageId: stage.id,
        instrumentTypes: Array.from(selected) as ("JOURNAL" | "SELF_ASSESSMENT" | "PEER_ASSESSMENT" | "OBSERVATION" | "DAILY_NOTE")[],
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Stage instruments updated.")
      setOpen(false)
      router.refresh()
    })
  }

  const resetSelection = () => {
    setSelected(new Set(stage.instruments.map((i) => i.instrumentType)))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (value) {
          resetSelection()
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Stage instruments</DialogTitle>
          <DialogDescription>
            Select the assessment instruments students must complete during this stage.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {instrumentOptions.map((instrument) => {
            const checked = selected.has(instrument)
            return (
              <div key={instrument} className="flex items-center space-x-3 rounded-md border px-3 py-2">
                <Checkbox
                  id={`instrument-${instrument}`}
                  checked={checked}
                  onCheckedChange={(value) => toggleInstrument(instrument, Boolean(value))}
                />
                <div className="space-y-1">
                  <Label htmlFor={`instrument-${instrument}`} className="cursor-pointer">
                    {instrument.replace(/_/g, " ")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {instrumentDescription(instrument)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save instruments"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function instrumentDescription(instrument: string) {
  switch (instrument) {
    case "JOURNAL":
      return "Student reflection journal entries for qualitative feedback."
    case "SELF_ASSESSMENT":
      return "Self-evaluation aligned to P5 dimensions."
    case "PEER_ASSESSMENT":
      return "Peer review within the project group."
    case "OBSERVATION":
      return "Teacher observation and notes."
    case "DAILY_NOTE":
      return "Quick daily notes capturing student progress."
    default:
      return "Assessment instrument."
  }
}


function CreateGroupDialog({ projectId, router }: { projectId: string; router: ReturnType<typeof useRouter> }) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formSchema = useMemo(() => z.object({ name: z.string().trim().min(1, "Group name is required") }), [])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setFormError(null)
    startTransition(async () => {
      const result = await createGroup({ projectId, name: values.name })

      if (!result.success) {
        setFormError(result.error)
        return
      }

      toast.success("Group created.")
      form.reset({ name: "" })
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Create group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group name</FormLabel>
                  <FormControl>
                    <Input placeholder="Group A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

type EditGroupDialogProps = {
  group: TeacherDashboardData["projects"][number]["groups"][number]
  projectId: string
  router: ReturnType<typeof useRouter>
}

function EditGroupDialog({ group, projectId, router }: EditGroupDialogProps) {
  const [open, setOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formSchema = useMemo(() => z.object({ name: z.string().trim().min(1, "Group name is required") }), [])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: group.name },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setFormError(null)
    startTransition(async () => {
      const result = await updateGroup({
        groupId: group.id,
        projectId,
        name: values.name,
      })

      if (!result.success) {
        setFormError(result.error)
        return
      }

      toast.success("Group updated.")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Rename group">
          <Edit className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit group</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset({ name: group.name })
                  setOpen(false)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function EditGroupMembersDialog({
  group,
  projectId,
  students,
  router,
}: {
  group: TeacherDashboardData["projects"][number]["groups"][number]
  projectId: string
  students: ClassStudent[]
  router: ReturnType<typeof useRouter>
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set(group.members.map((member) => member.studentId)))
  const [isPending, startTransition] = useTransition()

  const toggleStudent = (studentId: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(studentId)
      } else {
        next.delete(studentId)
      }
      return next
    })
  }

  const onSubmit = () => {
    startTransition(async () => {
      const result = await updateGroupMembers({
        groupId: group.id,
        projectId,
        studentIds: Array.from(selected),
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Group members updated.")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (value) {
          setSelected(new Set(group.members.map((member) => member.studentId)))
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Manage members">
          <Users className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign students</DialogTitle>
          <DialogDescription>
            Select which students are part of this group. Students must belong to the active class.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students assigned to this class yet. Ask the administrator to enrol students.
            </p>
          ) : (
            students.map((student) => {
              const checked = selected.has(student.studentId)
              return (
                <div
                  key={student.studentId}
                  className="flex items-center space-x-3 rounded-md border px-3 py-2"
                >
                  <Checkbox
                    id={`student-${student.studentId}`}
                    checked={checked}
                    onCheckedChange={(value) => toggleStudent(student.studentId, Boolean(value))}
                  />
                  <div className="space-y-1">
                    <Label htmlFor={`student-${student.studentId}`} className="cursor-pointer">
                      {student.name ?? student.email}
                    </Label>
                    <p className="text-xs text-muted-foreground">{student.email}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isPending || students.length === 0}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save members"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DeleteGroupButton({ groupId, router }: { groupId: string; router: ReturnType<typeof useRouter> }) {
  const [isPending, startTransition] = useTransition()

  const onConfirm = () => {
    startTransition(async () => {
      const result = await deleteGroup({ groupId })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Group deleted.")
      router.refresh()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" disabled={isPending} title="Delete group">
          {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash className="h-3 w-3" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete group?</AlertDialogTitle>
          <AlertDialogDescription>
            Students will be released from this group and any peer assessments linked to it may be
            affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
