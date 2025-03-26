
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag, Bookmark, Flag, Info } from 'lucide-react';

interface ChecklistItemTagsProps {
  metaRefs?: string;
  criteria?: string;
  profile?: string;
  phase?: string;
  effort?: string;
  priority?: string;
  requirementLevel?: string;
  scope?: string;
}

const ChecklistItemTags: React.FC<ChecklistItemTagsProps> = ({
  metaRefs,
  criteria,
  profile,
  phase,
  effort,
  priority,
  requirementLevel,
  scope
}) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {metaRefs && (
        <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
          <Bookmark size={12} />
          {metaRefs}
        </Badge>
      )}
      
      {criteria && (
        <Badge variant="outline" className="flex items-center gap-1 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">
          <Tag size={12} />
          {criteria}
        </Badge>
      )}
      
      {profile && (
        <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
          <Info size={12} />
          {profile}
        </Badge>
      )}
      
      {phase && (
        <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">
          <Flag size={12} />
          {phase}
        </Badge>
      )}
      
      {priority && priority.toLowerCase() === "haute" && (
        <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
          <Flag size={12} />
          Priorité: {priority}
        </Badge>
      )}
      
      {priority && priority.toLowerCase() !== "haute" && (
        <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
          <Flag size={12} />
          Priorité: {priority}
        </Badge>
      )}
      
      {effort && (
        <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
          <Info size={12} />
          Effort: {effort}
        </Badge>
      )}
      
      {requirementLevel && (
        <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
          <Info size={12} />
          {requirementLevel}
        </Badge>
      )}
      
      {scope && (
        <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
          <Info size={12} />
          {scope}
        </Badge>
      )}
    </div>
  );
};

export default ChecklistItemTags;
