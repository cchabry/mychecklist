
// Stub temporaire pour résoudre les erreurs de build
import { useState } from 'react';

export const useChecklistAndExigences = () => {
  const [loading, setLoading] = useState(false);
  
  // Cette fonction sera implémentée plus tard
  return {
    loading,
    checklist: [],
    exigences: [],
    loadChecklist: () => Promise.resolve([]),
    loadExigences: () => Promise.resolve([]),
    error: null
  };
};
