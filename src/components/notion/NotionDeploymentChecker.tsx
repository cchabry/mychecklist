
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getDeploymentType } from '@/lib/notionProxy/config';
import DeploymentDebugger from './DeploymentDebugger';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

const NotionDeploymentChecker: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [deploymentType, setDeploymentType] = useState<string>('');
  
  useEffect(() => {
    setDeploymentType(getDeploymentType());
  }, []);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <div className="flex items-center justify-between space-x-4 px-4 mb-2">
        <h2 className="text-sm font-semibold">
          Informations de déploiement ({deploymentType})
        </h2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="space-y-2">
        <DeploymentDebugger />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default NotionDeploymentChecker;
