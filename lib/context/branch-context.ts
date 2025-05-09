import { createContext } from "react"

interface BranchContextProps {
  selectedBranch: any
  setSelectedBranch: (branch: any) => void
}

export const BranchContext = createContext<BranchContextProps | undefined>(undefined)
