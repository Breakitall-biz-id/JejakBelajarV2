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
  ChevronLeft,
  ChevronRight,
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
  MessageSquare,
  Eye,
  Search,
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
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
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
  const totalStudents = data.studentsByClass ? Object.values(data.studentsByClass).reduce((acc, students) => acc + students.length, 0) : 0
  const totalClasses = data.classes.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl font-semibold">Dashboard Guru</h1>
              <p className="text-muted-foreground mt-1">
                Selamat datang kembali, {teacher.name ?? teacher.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/teacher/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Laporan
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/teacher/review">
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Tinjau
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
                <p className="text-sm text-muted-foreground">Total Kelas</p>
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
                <p className="text-sm text-muted-foreground">Proyek Aktif</p>
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
                <p className="text-sm text-muted-foreground">Total Siswa</p>
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
                <p className="text-sm text-muted-foreground">Peninjauan Tertunda</p>
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
            title="Belum Ada Kelas Ditugaskan"
            description="Anda belum ditugaskan ke kelas manapun. Hubungi administrator sekolah untuk memulai."
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
            className={`px-3 py-1 ${classInfo.termStatus === "ACTIVE" ? "bg-green-600 text-white hover:bg-green-700" : ""}`}
          >
            {classInfo.termStatus === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
          </Badge>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{projects.length}</p>
              <p className="text-xs text-muted-foreground">Proyek</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{activeProjects.length}</p>
              <p className="text-xs text-muted-foreground">Aktif</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{students.length}</p>
              <p className="text-xs text-muted-foreground">Siswa</p>
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
            <h4 className="text-lg font-semibold text-foreground mb-2">Belum Ada Proyek</h4>
            <p className="text-muted-foreground text-sm">
              Buat proyek pertama Anda untuk mulai mengelola aktivitas Kokurikuler
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
              {group.members.length} anggota
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
                    +{group.members.length - 3} lainnya
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground ml-11">Belum ada anggota</p>
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
      // Error logging removed for production
      setFormError("Gagal memuat template proyek")
    } finally {
      setIsLoadingTemplates(false)
    }
  }

  const formSchema = useMemo(
    () =>
      z.object({
        templateId: z.string().min(1, "Silakan pilih template proyek"),
        title: z.string().trim().min(1, "Judul proyek wajib diisi").max(255),
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
          Proyek Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buat Proyek Baru</DialogTitle>
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
                              ? `${Math.ceil(template.stageConfigs.length / 2)} minggu`
                              : "Fleksibel"

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
                                        <span className="bg-muted px-2 py-1 rounded-md">{totalStages} tahapan</span>
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
  const [showDetailDialog, setShowDetailDialog] = useState(false)
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
              {project.description ?? "Tidak ada deskripsi."}
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
                <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
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
              <span className="text-muted-foreground">{project.stages.length} tahapan</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{project.groups.length} grup</span>
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {project.groups.reduce((acc, group) => acc + group.members.length, 0)} siswa
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setShowDetailDialog(true)}
            >
              Lihat Detail
            </Button>
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
                {isExpanded ? "Semua Tahapan" : "Tahapan Awal"}
                {isExpanded && (
                  <span className="text-xs text-muted-foreground ml-1">({project.stages.length})</span>
                )}
              </h5>
              {hasMoreStages && (
                <Badge variant="outline" className="text-xs">
                  +{project.stages.length - 2} lainnya
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
                            {new Date(stage.unlocksAt).toLocaleDateString('id-ID')}
                          </span>
                        )}
                        {stage.dueAt && (
                          <span className="text-xs text-muted-foreground">
                            • {new Date(stage.dueAt).toLocaleDateString('id-ID')}
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
              <h5 className="text-sm font-medium text-foreground">Grup ({project.groups.length})</h5>
               <CreateGroupDialog projectId={project.id} router={router} />
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
                <p className="text-sm text-muted-foreground">Belum ada grup dibuat</p>
                <p className="text-xs text-muted-foreground mt-1">Buat grup untuk mengorganisir siswa</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showDetailDialog && (
        <ProjectDetailDialog
          project={project}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
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
  const [showCreateStageDialog, setShowCreateStageDialog] = useState(false)
  const [showEditStageDialog, setShowEditStageDialog] = useState(false)
  const [selectedStage, setSelectedStage] = useState<typeof project.stages[number] | null>(null)

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

  const handleCreateStageSuccess = () => {
    setShowCreateStageDialog(false)
    router.refresh()
  }

  const handleEditStageSuccess = () => {
    setShowEditStageDialog(false)
    setSelectedStage(null)
    router.refresh()
  }

  const handleEditStage = (stage: typeof project.stages[number]) => {
    setSelectedStage(stage)
    setShowEditStageDialog(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" /> Edit proyek
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit proyek</DialogTitle>
          <DialogDescription>Perbarui informasi proyek dan tahapan untuk kelas ini.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Tahapan Proyek</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateStageDialog(true)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Tambah Tahapan
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {project.stages.length === 0 ? (
                  <div className="text-center py-4 text-sm text-muted-foreground border border-dashed border-border rounded">
                    Belum ada tahapan. Klik &quot;Tambah Tahapan&quot; untuk membuat satu.
                  </div>
                ) : (
                  project.stages.map((stage, index) => (
                    <StageItem
                      key={stage.id}
                      stage={stage}
                      project={project}
                      index={index}
                      totalStages={project.stages.length}
                      instrumentOptions={["SELF_ASSESSMENT", "PEER_ASSESSMENT", "JOURNAL", "OBSERVATION"]}
                      router={router}
                      isCompact={true}
                      onEdit={() => handleEditStage(stage)}
                    />
                  ))
                )}
              </div>
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  form.reset()
                  setOpen(false)
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      {showCreateStageDialog && (
        <CreateStageDialog
          projectId={project.id}
          router={router}
          open={showCreateStageDialog}
          onOpenChange={setShowCreateStageDialog}
          onSuccess={handleCreateStageSuccess}
        />
      )}

      {showEditStageDialog && selectedStage && (
        <EditStageDialog
          stage={selectedStage}
          project={project}
          router={router}
          open={showEditStageDialog}
          onOpenChange={setShowEditStageDialog}
          onSuccess={handleEditStageSuccess}
        />
      )}
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
          {isPending ? "Menghapus..." : "Hapus"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus proyek?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan menghapus proyek, tahapan, dan grup siswa terkait. Tindakan ini
            tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            Konfirmasi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ProjectDetailDialog({
  project,
  open,
  onOpenChange
}: {
  project: TeacherDashboardData["projects"][number]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [showStageDetailDialog, setShowStageDetailDialog] = useState(false)
  const [selectedStage, setSelectedStage] = useState<typeof project.stages[number] | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED": return "text-green-600"
      case "DRAFT": return "text-blue-600"
      case "ARCHIVED": return "text-gray-600"
      default: return "text-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PUBLISHED": return <CheckCircle2 className="h-4 w-4" />
      case "DRAFT": return <Edit className="h-4 w-4" />
      case "ARCHIVED": return <Archive className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return "—"
    try {
      return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(date))
    } catch {
      return date
    }
  }

  const handleStageClick = (stage: typeof project.stages[number]) => {
    setSelectedStage(stage)
    setShowStageDetailDialog(true)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0" showCloseButton={false}>
          <VisuallyHidden>
            <DialogTitle>Detail Proyek</DialogTitle>
          </VisuallyHidden>
          {/* Header */}
          <div className="sticky top-0 bg-background border-b p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(project.status)} border-current bg-transparent`}
                  >
                    {getStatusIcon(project.status)}
                    <span className="ml-1">{project.status}</span>
                  </Badge>
                </div>
                {project.theme && (
                  <p className="text-sm text-muted-foreground">Theme: {project.theme}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-6 w-6 p-0"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            {project.description && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Deskripsi</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              </div>
            )}

            {/* Stages */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Tahapan Proyek ({project.stages.length})</h3>
              <div className="space-y-2">
                {project.stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="bg-background border border-border rounded-lg p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleStageClick(stage)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">Tahapan {index + 1}</Badge>
                          <h4 className="font-medium text-sm">{stage.name}</h4>
                          <div className="ml-auto text-xs text-muted-foreground">
                            Klik untuk detail →
                          </div>
                        </div>
                        {stage.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{stage.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {stage.unlocksAt && (
                            <span>Buka: {formatDate(stage.unlocksAt)}</span>
                          )}
                          {stage.dueAt && (
                            <span>Tenggat: {formatDate(stage.dueAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Instruments */}
                    {stage.instruments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex flex-wrap gap-1">
                          {stage.instruments.map((instrument) => (
                            <Badge
                              key={instrument.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {instrument.instrumentType.replace(/_/g, " ").toLowerCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Groups */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-foreground">Grup Siswa ({project.groups.length})</h3>
                <Badge variant="outline" className="text-xs">
                  {project.groups.reduce((total, group) => total + group.members.length, 0)} siswa
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.groups.map((group) => (
                  <div key={group.id} className="bg-background border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{group.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {group.members.length} anggota
                      </Badge>
                    </div>
                    {group.members.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {group.members.slice(0, 3).map(member => member.studentName).join(", ")}
                        {group.members.length > 3 && ` +${group.members.length - 3} lainnya`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showStageDetailDialog && selectedStage && (
        <StageDetailDialog
          stage={selectedStage}
          stageNumber={project.stages.findIndex(s => s.id === selectedStage.id) + 1}
          open={showStageDetailDialog}
          onOpenChange={setShowStageDetailDialog}
        />
      )}
    </>
  )
}

function StageDetailDialog({
  stage,
  stageNumber,
  open,
  onOpenChange
}: {
  stage: TeacherDashboardData["projects"][number]["stages"][number]
  stageNumber: number
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const formatDate = (date: string | null) => {
    if (!date) return "—"
    try {
      return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(date))
    } catch {
      return date
    }
  }

  const getInstrumentDescription = (instrumentType: string) => {
    switch (instrumentType) {
      case "JOURNAL":
        return "Entri jurnal refleksi siswa untuk masukan kualitatif"
      case "SELF_ASSESSMENT":
        return "Evaluasi diri yang selaras dengan dimensi Kokurikuler"
      case "PEER_ASSESSMENT":
        return "Review teman sebaya dalam grup proyek"
      case "OBSERVATION":
        return "Observasi dan catatan guru"
      case "DAILY_NOTE":
        return "Catatan harian cepat untuk memantau kemajuan siswa"
      default:
        return "Instrumen penilaian"
    }
  }

  const getInstrumentIcon = (instrumentType: string) => {
    switch (instrumentType) {
      case "JOURNAL":
        return <FileText className="h-4 w-4" />
      case "SELF_ASSESSMENT":
        return <MessageSquare className="h-4 w-4" />
      case "PEER_ASSESSMENT":
        return <Users className="h-4 w-4" />
      case "OBSERVATION":
        return <Eye className="h-4 w-4" />
      case "DAILY_NOTE":
        return <Clock className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0" showCloseButton={false}>
        <VisuallyHidden>
          <DialogTitle>Stage Details</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">Stage {stageNumber}</Badge>
                <h2 className="text-lg font-semibold">{stage.name}</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {stage.unlocksAt && (
                  <span>Unlocks: {formatDate(stage.unlocksAt)}</span>
                )}
                {stage.dueAt && (
                  <span>Due: {formatDate(stage.dueAt)}</span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Description */}
          {stage.description && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2">Deskripsi</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{stage.description}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Tanggal Buka</div>
              <div className="text-sm font-medium">
                {stage.unlocksAt ? formatDate(stage.unlocksAt) : "Segera"}
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground mb-1">Tanggal Tenggat</div>
              <div className="text-sm font-medium">
                {stage.dueAt ? formatDate(stage.dueAt) : "Tenggat tidak ada"}
              </div>
            </div>
          </div>

          {/* Assessment Instruments */}
          {stage.instruments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">
                Assessment Instruments ({stage.instruments.length})
              </h3>
              <div className="space-y-3">
                {stage.instruments.map((instrument) => (
                  <div key={instrument.id} className="bg-background border border-border rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        {getInstrumentIcon(instrument.instrumentType)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-foreground capitalize">
                          {instrument.instrumentType.replace(/_/g, " ").toLowerCase()}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getInstrumentDescription(instrument.instrumentType)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for instruments */}
          {stage.instruments.length === 0 && (
            <div className="text-center py-4 border border-dashed border-border rounded-lg bg-muted/20">
              <MessageSquare className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No assessment instruments assigned</p>
              <p className="text-xs text-muted-foreground mt-1">Students will not be able to submit evidence</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

type StageItemProps = {
  stage: TeacherDashboardData["projects"][number]["stages"][number]
  project: TeacherDashboardData["projects"][number]
  index: number
  totalStages: number
  instrumentOptions: readonly string[]
  router: ReturnType<typeof useRouter>
  isCompact?: boolean
  onEdit?: () => void
}

function StageItem({
  stage,
  project,
  index,
  totalStages,
  instrumentOptions,
  router,
  isCompact = false,
  onEdit,
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

  if (isCompact) {
    return (
      <div className="rounded-lg border bg-muted/10 p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Stage {index + 1}</Badge>
              <h4 className="font-semibold text-sm">{stage.name}</h4>
            </div>
            {stage.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {stage.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onEdit ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="h-7 w-7 p-0"
              >
                <Edit className="h-3 w-3" />
              </Button>
            ) : (
              <EditStageDialog stage={stage} project={project} router={router} />
            )}
          </div>
        </div>
      </div>
    )
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
          {onEdit ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <EditStageDialog stage={stage} project={project} router={router} />
          )}
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
    // Date formatting error removed for production
    return value
  }
}

function CreateStageDialog({
  projectId,
  router,
  open,
  onOpenChange,
  onSuccess
}: {
  projectId: string;
  router: ReturnType<typeof useRouter>
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen
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
      setDialogOpen(false)
      onSuccess?.()
      router.refresh()
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Add stage
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add stage</DialogTitle>
          <DialogDescription>
            Map the Kokurikuler syntax to sequential stages. Students unlock stages in order.
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
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat Tahapan"}
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
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

function EditStageDialog({
  stage,
  project,
  router,
  open,
  onOpenChange,
  onSuccess
}: EditStageDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = isControlled ? onOpenChange! : setInternalOpen
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
      setDialogOpen(false)
      onSuccess?.()
      router.refresh()
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
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
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
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
            Batal
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Instrumen"}
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
      return "Self-evaluation aligned to Kokurikuler dimensions."
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
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat"}
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
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
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
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectAll, setSelectAll] = useState(false)
  const itemsPerPage = 20

  // Filter students based on search
  const filteredStudents = students.filter((student) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      (student.name?.toLowerCase().includes(query) ||
       student.email?.toLowerCase().includes(query))
    )
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage)

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1)
    setSelectAll(false)
  }, [searchQuery])

  // Calculate selected stats
  const selectedCount = selected.size
  const totalCount = filteredStudents.length
  const availableCount = totalCount - selectedCount

  // Toggle individual student
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

  // Select all visible students
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelected(new Set())
      setSelectAll(false)
    } else {
      // Select all filtered students
      const newSelected = new Set(paginatedStudents.map(s => s.studentId))
      setSelected(newSelected)
      setSelectAll(true)
    }
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
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign students to group</DialogTitle>
          <DialogDescription>
            Select which students are part of this group. Students must belong to the active class.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex gap-4 items-center border-b pb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari nama atau email siswa..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1) // Reset to first page when searching
              }}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            {filteredStudents.length} dari {students.length} siswa
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>
                {searchQuery ? "Tidak ada siswa yang cocok dengan pencarian" :
                 students.length === 0 ? "No students assigned to this class yet. Ask the administrator to enrol students." :
                 "Semua siswa sudah ditugaskan ke kelompok"}
              </p>
            </div>
          ) : (
            <>
              {/* Selection Controls */}
              <div className="sticky top-0 bg-background border-b p-3 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="select-all-current"
                      checked={paginatedStudents.length > 0 && paginatedStudents.every(student => selected.has(student.studentId))}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all-current" className="text-sm cursor-pointer">
                      Pilih semua ({paginatedStudents.length} siswa di halaman ini)
                    </Label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selected.size} siswa dipilih total
                  </div>
                </div>
              </div>

              {/* Student List */}
              <div className="p-3 pt-0">
                <div className="grid gap-1">
                  {paginatedStudents.map((student) => (
                    <div
                      key={student.studentId}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer border border-transparent hover:border-border transition-colors"
                      onClick={() => toggleStudent(student.studentId, !selected.has(student.studentId))}
                    >
                      <Checkbox
                        id={`student-${student.studentId}`}
                        checked={selected.has(student.studentId)}
                        onCheckedChange={(value) => toggleStudent(student.studentId, Boolean(value))}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name ?? student.email}</p>
                        <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {selected.has(student.studentId) && (
                          <span className="text-green-600 font-medium">✓ Dipilih</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="sticky bottom-0 bg-background border-t p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredStudents.length)} dari {filteredStudents.length} siswa
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Sebelumnya
                      </Button>
                      <span className="text-sm px-3 py-1">
                        Halaman {currentPage} dari {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Selanjutnya
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <div className="flex-1">
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected(new Set())}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Hapus Pilihan
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selected.size} siswa dipilih
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={onSubmit} disabled={isPending || filteredStudents.length === 0}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Anggota"}
            </Button>
          </div>
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