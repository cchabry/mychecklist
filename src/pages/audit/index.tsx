
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuditContainer } from './AuditContainer';
import { toast } from 'sonner';
import { isNotionConfigured } from '@/lib/notionService';

const AuditPage = () => {
  const [notionReady, setNotionReady] = useState<boolean>(false);
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    // Vérifier si Notion est configuré
    const notionStatus = isNotionConfigured();
    setNotionReady(notionStatus);
    
    if (!notionStatus) {
      toast.warning("Notion n'est pas configuré", {
        description: "Certaines fonctionnalités peuvent ne pas fonctionner correctement.",
        duration: 5000,
      });
    }
  }, []);

  return <AuditContainer />;
};

export default AuditPage;
