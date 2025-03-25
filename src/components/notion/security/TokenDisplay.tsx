
import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { obfuscateToken, identifyTokenType, NotionTokenType } from '@/services/notion/security/tokenValidation';
import { Button } from '@/components/ui/button';

interface TokenDisplayProps {
  token: string;
  allowCopy?: boolean;
  allowReveal?: boolean;
  label?: string;
  obfuscated?: boolean;
}

/**
 * Composant pour afficher un token de manière sécurisée
 */
const TokenDisplay: React.FC<TokenDisplayProps> = ({
  token,
  allowCopy = true,
  allowReveal = true,
  label = "Token",
  obfuscated = true
}) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Ne rien afficher si pas de token
  if (!token) {
    return null;
  }
  
  // Type de token pour stylisation
  const tokenType = identifyTokenType(token);
  const displayValue = (revealed || !obfuscated) ? token : obfuscateToken(token);
  
  // Gérer la copie du token
  const handleCopy = () => {
    navigator.clipboard.writeText(token).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Déterminer la couleur selon le type de token
  const getTokenColor = () => {
    switch (tokenType) {
      case NotionTokenType.INTEGRATION:
        return 'text-blue-600 bg-blue-50';
      case NotionTokenType.OAUTH:
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  // Déterminer le label du type de token
  const getTokenTypeLabel = () => {
    switch (tokenType) {
      case NotionTokenType.INTEGRATION:
        return 'Intégration';
      case NotionTokenType.OAUTH:
        return 'OAuth';
      default:
        return 'Inconnu';
    }
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${getTokenColor()}`}>
          {getTokenTypeLabel()}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <code className="flex-grow font-mono text-sm p-2 rounded bg-gray-100 truncate">
          {displayValue}
        </code>
        
        <div className="flex space-x-1">
          {allowReveal && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setRevealed(!revealed)}
              title={revealed ? "Masquer le token" : "Révéler le token"}
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          )}
          
          {allowCopy && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleCopy}
              title="Copier le token"
            >
              {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDisplay;
