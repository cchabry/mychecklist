
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { validateTokenFormat, NotionTokenType } from '@/services/notion/security/tokenValidation';
import { Key, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NotionApiKeyFieldProps {
  apiKey: string;
  onChange: (value: string) => void;
  showValidation?: boolean;
}

const NotionApiKeyField: React.FC<NotionApiKeyFieldProps> = ({ 
  apiKey, 
  onChange,
  showValidation = true
}) => {
  const [isValid, setIsValid] = useState(false);
  const [tokenType, setTokenType] = useState<NotionTokenType>(NotionTokenType.UNKNOWN);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Valider le token lors des changements
  useEffect(() => {
    // Ne pas valider si le champ est vide ou trop court
    if (!apiKey || apiKey.length < 5) {
      setIsValid(false);
      setTokenType(NotionTokenType.UNKNOWN);
      setErrorMessage(null);
      return;
    }
    
    // Vérifier le format du token
    const validation = validateTokenFormat(apiKey);
    setIsValid(validation.isValid);
    setTokenType(validation.type);
    setErrorMessage(validation.error || null);
  }, [apiKey]);
  
  // Déterminer la couleur et l'icône selon la validité et le type
  const getValidationColor = () => {
    if (!apiKey) return 'text-gray-400';
    if (!isValid) return 'text-red-500';
    
    if (tokenType === NotionTokenType.INTEGRATION) {
      return 'text-blue-500';
    } else if (tokenType === NotionTokenType.OAUTH) {
      return 'text-purple-500';
    } else {
      return 'text-green-500';
    }
  };
  
  // Obtenir le label du type de token
  const getTokenTypeLabel = () => {
    if (!apiKey) return '';
    if (!isValid) return errorMessage || 'Format non valide';
    
    if (tokenType === NotionTokenType.INTEGRATION) {
      return "Token d'intégration";
    } else if (tokenType === NotionTokenType.OAUTH) {
      return "Token OAuth";
    } else {
      return "Token valide";
    }
  };
  
  return (
    <div className="space-y-2">
      <label htmlFor="apiKey" className="text-sm font-medium">
        Clé d'API Notion
      </label>
      
      <div className="relative">
        <Input
          id="apiKey"
          type="password"
          placeholder="secret_xxxx..."
          value={apiKey}
          onChange={(e) => onChange(e.target.value)}
          className={`font-mono text-sm pl-9 ${isValid ? 'pr-10' : ''}`}
        />
        <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        
        {showValidation && apiKey && (
          <div className="absolute right-3 top-2.5">
            {isValid ? (
              <CheckCircle2 className={`h-4 w-4 ${getValidationColor()}`} />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
          </div>
        )}
      </div>
      
      {showValidation && apiKey && (
        <p className={`text-xs ${getValidationColor()}`}>
          {getTokenTypeLabel()}
        </p>
      )}
      
      <p className="text-xs text-muted-foreground">
        Clé d'intégration de votre application Notion ou token OAuth
      </p>
    </div>
  );
};

export default NotionApiKeyField;
