
import React from 'react';
import { Input } from '@/components/ui/input';

interface NotionDatabaseFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  required?: boolean;
}

const NotionDatabaseField: React.FC<NotionDatabaseFieldProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder = "https://www.notion.so/workspace/xxxxxxxx?v=yyyy ou juste l'ID",
  description = "URL ou ID de votre base de données Notion",
  required = false
}) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-sm"
        required={required}
      />
      <p className="text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default NotionDatabaseField;
