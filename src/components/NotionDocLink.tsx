
import React from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotionDocLink = () => {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className="gap-2 flex items-center" 
      asChild
    >
      <a 
        href="/scriptsNotion.md" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-gray-600 hover:text-gray-900"
      >
        <FileText size={16} />
        Guide Notion
      </a>
    </Button>
  );
};

export default NotionDocLink;
