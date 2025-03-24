
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NotionApiKeyFieldProps {
  apiKey: string;
  onChange: (value: string) => void;
  className?: string;
}

const NotionApiKeyField: React.FC<NotionApiKeyFieldProps> = ({ 
  apiKey, 
  onChange,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="apiKey" className="text-sm font-medium">
        Clé d'API Notion
      </Label>
      <Input
        id="apiKey"
        type="password"
        placeholder="secret_xxxx..."
        value={apiKey}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        Clé d'intégration de votre application Notion ou token OAuth
      </p>
    </div>
  );
};

export default NotionApiKeyField;
