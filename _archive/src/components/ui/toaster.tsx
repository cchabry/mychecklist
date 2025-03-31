
"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        duration: 5000,
        className: "sonner-toast",
        descriptionClassName: "sonner-description",
      }}
    />
  )
}
