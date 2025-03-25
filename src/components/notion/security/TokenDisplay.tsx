
import React, { useState } from 'react';
import { Eye, EyeOff, Copy, Check, RotateCw, AlertTriangle } from 'lucide-react';
import { obfuscateToken, identifyTokenType, NotionTokenType } from '@/services/notion/security/tokenValidation';
import { Button } from '@/components/ui/button';

interface TokenDisplayProps {
  token: string;
  allowCopy?: boolean;
  allowReveal?: boolean;
  allowRefresh?: boolean;
  label?: string;
  obfuscated?: boolean;
  expiresAt?: Date | null;
  onRefresh?: () => Promise<void>;
}

/**
 * Composant amélioré pour afficher un token de manière sécurisée avec gestion d'expiration
 */
const TokenDisplay: React.FC<TokenDisplayProps> = ({
  token,
  allowCopy = true,
  allowReveal = true,
  allowRefresh = false,
  label = "Token",
  obfuscated = true,
  expiresAt = null,
  onRefresh
}) => {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
  
  // Gérer le rafraîchissement du token
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
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
  
  // Vérifier si le token est expiré ou expire bientôt
  const isExpired = expiresAt && new Date() > expiresAt;
  const expiresSoon = expiresAt && !isExpired && 
    ((expiresAt.getTime() - new Date().getTime()) < 24 * 60 * 60 * 1000); // Moins de 24h
  
  // Formatter le temps restant avant expiration
  const formatTimeRemaining = () => {
    if (!expiresAt) return '';
    
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff < 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Expire dans ${days} jour${days > 1 ? 's' : ''}`;
    }
    
    return `Expire dans ${hours}h${minutes < 10 ? '0' : ''}${minutes}`;
  };
  
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{label}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${getTokenColor()}`}>
          {getTokenTypeLabel()}
        </span>
        
        {expiresAt && (
          <span className={`text-xs px-2 py-0.5 rounded ${
            isExpired ? 'text-red-600 bg-red-50' : 
            expiresSoon ? 'text-amber-600 bg-amber-50' : 
            'text-green-600 bg-green-50'
          }`}>
            {formatTimeRemaining()}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <code className={`flex-grow font-mono text-sm p-2 rounded ${
          isExpired ? 'bg-red-50 text-red-800' : 'bg-gray-100'
        } truncate`}>
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
          
          {allowRefresh && onRefresh && (tokenType === NotionTokenType.OAUTH) && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Rafraîchir le token"
            >
              <RotateCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </Button>
          )}
          
          {isExpired && (
            <span className="flex items-center text-xs text-red-600">
              <AlertTriangle size={14} className="mr-1" />
              Token expiré
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenDisplay;
