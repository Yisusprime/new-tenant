"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useBranch } from "@/lib/hooks/use-branch"
import { useRouter } from "next/navigation"

export const NoBranchSelectedAlert = () => {
  const { selectedBranch } = useBranch()
  const router = useRouter()

  if (selectedBranch) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No branch selected</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>You need to select a branch to continue.</p>
        <Button variant="outline" size="sm" onClick={() => router.push("./branches")} className="w-fit">
          Go to Branches
        </Button>
      </AlertDescription>
    </Alert>
  )
}

export default NoBranchSelectedAlert
