
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseItemProps {
  id: string;
  title: string;
  createdTime: string;
}

const DatabaseListItem: React.FC<DatabaseItemProps> = ({ id, title, createdTime }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    
    // Reset copy state after a delay
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    toast.success("ID copié dans le presse-papier");
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-3 flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate" title={title}>
            {title}
          </h3>
          <p className="text-xs text-gray-500 truncate" title={id}>
            {id}
          </p>
          <p className="text-xs text-gray-400">
            Créée le {createdTime}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyId}
          className="shrink-0"
        >
          {copied ? (
            <CheckCheck className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DatabaseListItem;
