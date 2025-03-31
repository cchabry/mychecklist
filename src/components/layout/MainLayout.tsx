
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { OperationModeIndicator } from '@/components/OperationModeIndicator';

/**
 * Layout principal de l'application
 */
export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto py-3 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Outil d'audit</h1>
            <div className="fixed top-4 right-4 z-50">
              <OperationModeIndicator />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-slate-50">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
};
