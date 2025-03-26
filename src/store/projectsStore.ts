
import { create } from 'zustand'
import { Project } from '@/lib/types'

interface ProjectsState {
  projects: Project[]
  isLoading: boolean
  error: string | null
  
  // Actions
  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  isLoading: false,
  error: null,
  
  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (id, updatedProject) => set((state) => ({
    projects: state.projects.map((project) => 
      project.id === id 
        ? { ...project, ...updatedProject } 
        : project
    )
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== id)
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}))

export default useProjectsStore
