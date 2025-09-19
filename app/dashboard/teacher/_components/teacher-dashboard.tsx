"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChevronDown,
  ChevronUp,
  Edit,
  ListChecks,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash,
  Users,
} from "lucide-react"

import type { CurrentUser } from "@/lib/auth/session"
import type { TeacherDashboardData } from "../queries"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Separator } from "@/components/ui/separator"

type TeacherDashboardProps = {
  teacher: CurrentUser
  data: TeacherDashboardData
  projectStatusOptions: readonly string[]
  instrumentOptions: readonly string[]
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

  return (
    <div className="space-y-8 px-4 pb-8 pt-4 lg:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Teacher Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {teacher.name ?? teacher.email}. Manage your project-based learning cycles,
          stages, and student groups for the active academic terms.
        </p>
      </header>

      {data.classes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            You are not assigned to any classes yet. Contact the school administrator to get
            started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
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
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{classInfo.name}</CardTitle>
            <CardDescription>
              Academic Year {classInfo.academicYear} • Semester {classInfo.semester === "ODD" ? "Ganjil" : "Genap"}
            </CardDescription>
          </div>
          <Badge variant={classInfo.termStatus === "ACTIVE" ? "default" : "outline"}>
            {classInfo.termStatus === "ACTIVE" ? "Active term" : "Inactive"}
          </Badge>
        </div>
        <CreateProjectDialog classId={classInfo.id} router={router} />
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No projects yet. Create a project to plan the stages and student groups for this class.
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                classId={classInfo.id}
                students={students}
                projectStatusOptions={projectStatusOptions}
                instrumentOptions={instrumentOptions}
                router={router}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CreateProjectDialog({ classId, router }: { classId: string; router: ReturnType<typeof useRouter> }) {
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
        title: values.title,
        theme: values.theme?.trim() || null,
        description: values.description?.trim() || null,
      })

      if (!result.success) {
        setFormError(result.error)
        return
      }

      toast.success("Project created.")
      form.reset()
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> New project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create project</DialogTitle>
          <DialogDescription>
            Define the core details of your PjBL project. You can add stages and groups after
            saving.
          </DialogDescription>
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
                    <Input placeholder="Community Garden Project" {...field} />
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
                  <FormLabel>Theme (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Green Living" {...field} />
                  </FormControl>
                  <FormDescription>
                    Helps students understand how the project aligns with the P5 dimensions.
                  </FormDescription>
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
                    <Textarea
                      rows={4}
                      placeholder="High-level objective and expected outcomes."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
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

type ProjectCardProps = {
  project: TeacherDashboardData["projects"][number]
  classId: string
  students: TeacherDashboardData["studentsByClass"][string] | []
  projectStatusOptions: readonly string[]
  instrumentOptions: readonly string[]
  router: ReturnType<typeof useRouter>
}

function ProjectCard({
  project,
  classId,
  students,
  projectStatusOptions,
  instrumentOptions,
  router,
}: ProjectCardProps) {
  const [isStatusPending, startStatusTransition] = useTransition()

  const statusLabel = project.status.charAt(0) + project.status.slice(1).toLowerCase()

  const handleStatusChange = (status: string) => {
    if (status === project.status) return

    startStatusTransition(async () => {
      const result = await updateProjectStatus({
        projectId: project.id,
        status: status as typeof project.status,
      })

      if (!result.success) {
        toast.error(result.error)
        return
      }

      toast.success("Project status updated.")
      router.refresh()
    })
  }

  return (
    <Card className="border-muted">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{project.title}</CardTitle>
            {project.theme && (
              <p className="text-sm text-muted-foreground">Theme: {project.theme}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {isStatusPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span>{statusLabel}</span>
                )}
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Project status</DropdownMenuLabel>
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
        <p className="text-sm text-muted-foreground">
          {project.description ?? "No description provided."}
        </p>
        <div className="flex flex-wrap gap-2">
          <EditProjectDialog project={project} classId={classId} router={router} />
          <DeleteProjectButton projectId={project.id} router={router} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <ProjectStagesSection
          project={project}
          instrumentOptions={instrumentOptions}
          router={router}
        />
        <Separator />
        <ProjectGroupsSection
          project={project}
          students={students}
          router={router}
        />
      </CardContent>
    </Card>
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
        theme: values.theme?.trim() || null,
        description: values.description?.trim() || null,
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

type ProjectStagesSectionProps = {
  project: TeacherDashboardData["projects"][number]
  instrumentOptions: readonly string[]
  router: ReturnType<typeof useRouter>
}

function ProjectStagesSection({ project, instrumentOptions, router }: ProjectStagesSectionProps) {
  const hasStages = project.stages.length > 0

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ListBadge />
          <div>
            <h3 className="font-semibold leading-tight">Project stages</h3>
            <p className="text-sm text-muted-foreground">
              Define the sequential PjBL stages and required assessment instruments.
            </p>
          </div>
        </div>
        <CreateStageDialog projectId={project.id} router={router} />
      </div>

      {hasStages ? (
        <div className="space-y-3">
          {project.stages.map((stage, index) => (
            <StageItem
              key={stage.id}
              stage={stage}
              project={project}
              index={index}
              totalStages={project.stages.length}
              instrumentOptions={instrumentOptions}
              router={router}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No stages yet. Add stages following the PjBL syntax to unlock instruments for students.
        </p>
      )}
    </section>
  )
}

function ListBadge() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
      <ListChecks className="h-4 w-4" />
    </span>
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
          <EditStageDialog stage={stage} router={router} />
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
        description: values.description?.trim() || null,
        unlocksAt: values.unlocksAt || null,
        dueAt: values.dueAt || null,
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
  router: ReturnType<typeof useRouter>
}

function EditStageDialog({ stage, router }: EditStageDialogProps) {
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
        description: values.description?.trim() || null,
        unlocksAt: values.unlocksAt || null,
        dueAt: values.dueAt || null,
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
        instrumentTypes: Array.from(selected),
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

type ProjectGroupsSectionProps = {
  project: TeacherDashboardData["projects"][number]
  students: TeacherDashboardData["studentsByClass"][string] | []
  router: ReturnType<typeof useRouter>
}

function ProjectGroupsSection({ project, students, router }: ProjectGroupsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-semibold leading-tight">Student groups</h3>
            <p className="text-sm text-muted-foreground">
              Organise students into collaborative groups aligned with project deliverables.
            </p>
          </div>
        </div>
        <CreateGroupDialog projectId={project.id} router={router} />
      </div>

      {project.groups.length === 0 ? (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No groups yet. Create groups to begin assigning students.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group</TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>
                  {group.members.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {group.members.map((member) => (
                        <Badge key={member.studentId} variant="outline">
                          {member.studentName ?? "Unnamed student"}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No members assigned.</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
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
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" /> Rename
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
        <Button variant="outline" size="sm">
          Manage members
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
        <Button variant="destructive" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash className="mr-2 h-4 w-4" />}
          Delete
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
