
import React, { useState } from 'react';
import { useRequestLogStore, NotionRequest } from '@/services/notion/requestLogger';
import { Terminal, X, ChevronDown, ChevronUp, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const RequestRow: React.FC<{ request: NotionRequest }> = ({ request }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  const getStatusColor = (status?: number, success?: boolean) => {
    if (success) return 'bg-green-100 text-green-800 border-green-300';
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-300';
    if (status >= 500) return 'bg-red-100 text-red-800 border-red-300';
    if (status >= 400) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (status >= 300) return 'bg-blue-100 text-blue-800 border-blue-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };
  
  return (
    <div className={cn(
      "border-t border-gray-200 text-xs",
      expanded ? "bg-gray-50" : ""
    )}>
      <div 
        className="flex items-center px-2 py-1 cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-16 text-gray-500">
          {formatTime(request.timestamp)}
        </div>
        
        <div className="w-16 font-medium">
          {request.method}
        </div>
        
        <div className="flex-1 truncate">
          {request.endpoint}
        </div>
        
        <div className="flex items-center gap-2">
          {request.responseTime !== undefined && (
            <span className="text-xs text-gray-500">
              {request.responseTime}ms
            </span>
          )}
          
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-normal h-5",
              getStatusColor(request.status, request.success)
            )}
          >
            {request.status || 'Pending'}
          </Badge>
          
          {request.success ? 
            <Check size={14} className="text-green-500" /> : 
            <AlertTriangle size={14} className="text-amber-500" />
          }
          
          {expanded ? 
            <ChevronUp size={14} className="text-gray-500" /> : 
            <ChevronDown size={14} className="text-gray-500" />
          }
        </div>
      </div>
      
      {expanded && request.error && (
        <div className="p-2 bg-gray-50 text-red-600 whitespace-pre-wrap font-mono text-[10px] leading-tight">
          {request.error}
        </div>
      )}
    </div>
  );
};

const NotionRequestLogger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { requests, clearRequests } = useRequestLogStore();
  
  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-300 bg-white shadow-lg"
    >
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full flex items-center justify-between p-2 h-8 rounded-none"
        >
          <div className="flex items-center gap-2">
            <Terminal size={14} />
            <span className="text-xs font-medium">Journal des requêtes Notion</span>
            <Badge variant="outline" className="bg-gray-100 text-xs">
              {requests.length}
            </Badge>
          </div>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="max-h-64 overflow-y-auto">
          <div className="flex justify-between items-center p-1 bg-gray-100 border-y border-gray-200">
            <div className="text-xs font-medium text-gray-700 px-2">
              {requests.length} requêtes enregistrées
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={clearRequests}
            >
              <X size={12} className="mr-1" /> Effacer
            </Button>
          </div>
          
          <div className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Aucune requête Notion enregistrée pour l'instant
              </div>
            ) : (
              requests.map(request => (
                <RequestRow key={request.id} request={request} />
              ))
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default NotionRequestLogger;
