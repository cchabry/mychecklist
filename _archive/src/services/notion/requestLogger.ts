
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface NotionRequest {
  id: string;
  timestamp: number;
  endpoint: string;
  method: string;
  status?: number;
  success: boolean;
  error?: string;
  responseTime?: number;
}

interface RequestLogState {
  requests: NotionRequest[];
  maxRequests: number;
  addRequest: (request: NotionRequest) => void;
  updateRequest: (id: string, updates: Partial<NotionRequest>) => void;
  clearRequests: () => void;
  setMaxRequests: (count: number) => void;
}

export const useRequestLogStore = create<RequestLogState>()(
  persist(
    (set, get) => ({
      requests: [],
      maxRequests: 20,
      
      addRequest: (request) => set((state) => {
        const updatedRequests = [request, ...state.requests]
          .slice(0, state.maxRequests);
          
        return { requests: updatedRequests };
      }),
      
      updateRequest: (id, updates) => set((state) => ({
        requests: state.requests.map(req => 
          req.id === id ? { ...req, ...updates } : req
        )
      })),
      
      clearRequests: () => set({ requests: [] }),
      
      setMaxRequests: (count) => set({ maxRequests: count })
    }),
    {
      name: 'notion-request-log',
      partialize: (state) => ({ 
        requests: state.requests.slice(0, 10), // Limite le stockage persistant
        maxRequests: state.maxRequests 
      })
    }
  )
);

// Intégration avec le proxy d'API Notion
export const notionRequestLogger = {
  // Enregistre le début d'une requête
  logRequest: (endpoint: string, method: string) => {
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    useRequestLogStore.getState().addRequest({
      id: requestId,
      timestamp: Date.now(),
      endpoint,
      method,
      success: false
    });
    return requestId;
  },
  
  // Met à jour une requête avec le résultat
  logResponse: (id: string, status: number, success: boolean, responseTime: number, error?: string) => {
    useRequestLogStore.getState().updateRequest(id, {
      status,
      success,
      responseTime,
      error
    });
  }
};
