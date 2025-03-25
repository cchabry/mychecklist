
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { validateTokenFormat, verifyTokenWithAPI, NotionTokenType } from '@/services/notion/security/tokenValidation';
import { Key, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { TokenStorage } from '@/services/notion/security/tokenStorage';

interface NotionApiKeyFieldProps {
  apiKey: string;
  onChange: (value: string) => void;
  showValidation?: boolean;
  allowOAuthFlow?: boolean;
  onOAuthClick?: () => void;
  isOAuthLoading?: boolean;
}

const NotionApiKeyField: React.FC<NotionApiKeyFieldProps> = ({ 
  apiKey, 
  onChange,
  showValidation = true,
  allowOAuthFlow = false,
  onOAuthClick,
  isOAuthLoading = false
}) => {
  const [isValid, setIsValid] = useState(false);
  const [tokenType, setTokenType] = useState<NotionTokenType>(NotionTokenType.UNKNOWN);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
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
  
  // Vérifier le token avec l'API Notion
  const handleVerifyToken = async () => {
    if (!apiKey || !isValid) return;
    
    setIsVerifying(true);
    try {
      const result = await verifyTokenWithAPI(apiKey);
      setIsValid(result.isValid);
      if (!result.isValid && result.error) {
        setErrorMessage(result.error);
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsVerifying(false);
    }
  };
  
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
          placeholder="secret_xxxx... ou ntn_xxxx..."
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
      
      <div className="flex gap-2">
        {allowOAuthFlow && onOAuthClick && (
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={onOAuthClick}
            disabled={isOAuthLoading}
            className="flex items-center gap-1 text-purple-600 border-purple-300 hover:bg-purple-50"
          >
            {isOAuthLoading ? (
              <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
            ) : (
              <Key className="h-3.5 w-3.5 mr-1" />
            )}
            Se connecter avec OAuth
          </Button>
        )}
        
        {apiKey && isValid && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleVerifyToken}
            disabled={isVerifying}
            className="text-xs"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                Vérification...
              </>
            ) : (
              'Vérifier le token'
            )}
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        Clé d'intégration de votre application Notion ou token OAuth
      </p>
    </div>
  );
};

export default NotionApiKeyField;
