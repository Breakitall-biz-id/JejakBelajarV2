import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { submitStageInstrument } from "../../actions"
import { toast } from "sonner"

const SCALE = [
	{ value: 4, label: "Selalu" },
	{ value: 3, label: "Sering" },
	{ value: 2, label: "Kadang-kadang" },
	{ value: 1, label: "Tidak Pernah" },
]

export function QuestionnaireAssessmentDialog({
	open,
	onOpenChange,
	statements,
	initialValue,
	loading,
	title,
	readOnly,
	stageId,
	projectId,
	instrumentType,
	onSubmitSuccess,
}: {
	open: boolean
	onOpenChange: (open: boolean) => void
	statements: string[]
	initialValue?: number[]
	loading?: boolean
	title?: string
	readOnly?: boolean
	stageId: string
	projectId: string
	instrumentType: "SELF_ASSESSMENT" | "PEER_ASSESSMENT" | "OBSERVATION"
	onSubmitSuccess?: () => void
}) {
	const [answers, setAnswers] = React.useState<number[]>(initialValue || Array(statements.length).fill(0))
	const [currentStep, setCurrentStep] = React.useState(0)
	const [isSubmitting, setIsSubmitting] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	React.useEffect(() => {
		setAnswers(initialValue || Array(statements.length).fill(0))
	}, [initialValue, statements.length, open])

	const allAnswered = answers.every(a => a > 0)
	const totalSteps = statements.length

	const handleNext = () => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1)
		}
	}

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1)
		}
	}

	const handleChange = (value: number) => {
		if (!readOnly) {
			setAnswers(ans =>
				ans.map((a, i) => (i === currentStep ? value : a)),
			)
		}
	}

	const handleSubmit = async () => {
		setError(null)

		// Validate answers
		const unanswered = answers.findIndex((v) => !v)
		if (unanswered !== -1) {
			setError("Harap jawab semua pertanyaan sebelum menyimpan.")
			return
		}

		setIsSubmitting(true)

		try {
			const content = { answers }

			const result = await submitStageInstrument({
				projectId,
				stageId,
				instrumentType,
				content,
			})

			if (!result.success) {
				setError(result.error || "Gagal menyimpan data. Silakan coba lagi.")
				return
			}

			toast.success("Data berhasil disimpan!")
			onOpenChange(false)
			if (onSubmitSuccess) onSubmitSuccess()
		} catch (err) {
			console.error("Submission error:", err)
			setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.")
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
                <div className="px-6 pt-6 pb-2 border-b border-muted/60">
				<DialogHeader className="">
					<div className="flex justify-between items-center">
						<Button variant="ghost" disabled={currentStep === 0} onClick={handlePrevious}>
							<ArrowLeft/>
						</Button>
						<DialogTitle className="text-lg font-medium text-center font-geist-mono">
							{title || "Kuesioner"}
						</DialogTitle>
						<div className="text-sm text-muted-foreground">
							 {currentStep + 1} / {totalSteps}
						</div>
					</div>
				</DialogHeader>
                </div>
				<div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
					<div
						className="h-full bg-primary transition-all"
						style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
					></div>
				</div>
				<div className="flex flex-col gap-6 py-4">
					<div className="flex flex-col gap-4">
						<div
							className="text-lg font-semibold text-foreground text-center"
							dangerouslySetInnerHTML={{ __html: statements[currentStep] }}
						/>
						<div className="grid grid-cols-1 gap-3">
							{SCALE.map(scale => (
								<button
									key={scale.value}
									className={`w-full py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
										answers[currentStep] === scale.value
											? "bg-primary text-background"
											: "bg-background text-foreground hover:bg-muted"
									}`}
									disabled={readOnly}
									onClick={() => handleChange(scale.value)}
								>
									{scale.label}
								</button>
							))}
						</div>
					</div>
				</div>
				{error && <p className="px-6 text-sm text-red-500">{error}</p>}
				<DialogFooter className="flex justify-between">
					<Button variant="outline" disabled={currentStep === 0} onClick={handlePrevious}>
						Previous
					</Button>
					{currentStep < totalSteps - 1 ? (
						<Button onClick={handleNext} disabled={loading || readOnly}>
							Next Question
						</Button>
					) : (
						<Button
							onClick={handleSubmit}
							disabled={loading || !allAnswered || readOnly}
						>
							{isSubmitting ? "Menyimpan..." : "Simpan"}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
