import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export function Search() {
  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-purple-500 dark:text-purple-300" />
      <Input
        placeholder="Search inventory..."
        className="pl-8 border-purple-200 bg-purple-50 focus-visible:ring-purple-500 dark:border-purple-800 dark:bg-purple-900 dark:text-purple-50"
      />
    </div>
  )
}

