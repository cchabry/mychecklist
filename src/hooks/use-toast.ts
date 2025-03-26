
// Import from sonner
import { toast } from "sonner"

// Re-export with a consistent interface
export { toast }

export function useToast() {
  return {
    toast
  }
}
