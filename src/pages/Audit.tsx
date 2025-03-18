
import React, { Suspense } from 'react';
import { AuditContainer } from './audit/AuditContainer';

// Wrapper avec un fallback loading state
const Audit = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-t-transparent border-tmw-teal rounded-full animate-spin"></div>
      </div>
    }>
      <AuditContainer />
    </Suspense>
  );
};

export default Audit;
