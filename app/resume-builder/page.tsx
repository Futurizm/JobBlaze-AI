import { ResumeBuilderNew } from "@/components/resume-builder-new"

export default function ResumeBuilderPage() {
  return (
    <div className="w-full min-h-screen p-4 max-w-none">
      <h1 className="text-3xl font-bold mb-6 text-primary">Resume Builder</h1>
      <ResumeBuilderNew />
    </div>
  )
}