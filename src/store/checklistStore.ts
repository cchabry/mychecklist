
import { create } from 'zustand'
import { ChecklistItem } from '@/lib/types'

interface ChecklistState {
  items: ChecklistItem[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setItems: (items: ChecklistItem[]) => void
  addItem: (item: ChecklistItem) => void
  updateItem: (id: string, item: Partial<ChecklistItem>) => void
  deleteItem: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

const useChecklistStore = create<ChecklistState>((set) => ({
  items: [],
  isLoading: false,
  error: null,
  
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  updateItem: (id, updatedItem) => set((state) => ({
    items: state.items.map((item) => 
      item.id === id 
        ? { ...item, ...updatedItem } 
        : item
    )
  })),
  deleteItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}))

export default useChecklistStore
