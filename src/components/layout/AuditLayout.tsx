
import { Outlet } from 'react-router-dom';
import { OperationModeIndicator } from '../OperationModeIndicator';

/**
 * Layout spécifique pour les pages d'audit
 */
const AuditLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed top-16 right-4 z-50">
        <OperationModeIndicator />
      </div>
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AuditLayout;
