import { Inbox } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="flex flex-col items-center justify-center text-center space-y-6 max-w-md">
        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
          <Inbox className="h-8 w-8 text-slate-300" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
        </div>
        {actionLabel && onAction && (
          <Button variant="outline" onClick={onAction} className="mt-4">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
