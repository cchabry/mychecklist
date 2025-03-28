
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Création d'une instance QueryClient pour React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Ne pas réessayer en cas d'échec en développement pour faciliter le débogage
      retry: process.env.NODE_ENV === 'production',
      // Garder les données en cache pendant 5 minutes
      staleTime: 5 * 60 * 1000,
    },
  },
})

// Point d'entrée de l'application
// Rendu de l'application dans l'élément racine
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
