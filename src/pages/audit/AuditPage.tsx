
import React from 'react';
import { useParams } from 'react-router-dom';
import { AuditContainer } from './AuditContainer';

const AuditPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  return <AuditContainer projectId={projectId} />;
};

export default AuditPage;
