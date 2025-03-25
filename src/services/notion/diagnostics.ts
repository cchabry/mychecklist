
/**
 * Service de diagnostic pour l'API Notion
 * Permet de tracer et déboguer les appels API
 */

// Type pour les entrées de journal
export interface NotionLogEntry {
  timestamp: number;
  type: 'request' | 'response' | 'error';
  method?: string;
  endpoint?: string;
  status?: number;
  duration?: number;
  message?: string;
  details?: any;
}

// Nombre maximum d'entrées à conserver
const MAX_LOG_ENTRIES = 100;

// Journal des appels API
let apiLog: NotionLogEntry[] = [];

/**
 * Service de journal pour l'API Notion
 */
export const notionLogger = {
  /**
   * Ajoute une entrée de journal pour une requête
   */
  logRequest(method: string, endpoint: string): string {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const entry: NotionLogEntry = {
      timestamp: Date.now(),
      type: 'request',
      method,
      endpoint,
      message: `${method} ${endpoint}`
    };
    
    this.addLogEntry(entry);
    console.log(`📡 Notion API Request: ${method} ${endpoint}`);
    
    return requestId;
  },
  
  /**
   * Ajoute une entrée de journal pour une réponse
   */
  logResponse(
    requestId: string,
    status: number,
    success: boolean,
    duration: number,
    error?: string
  ): void {
    const entry: NotionLogEntry = {
      timestamp: Date.now(),
      type: 'response',
      status,
      duration,
      message: success ? `Success (${status})` : `Error (${status}): ${error}`,
      details: { requestId, error }
    };
    
    this.addLogEntry(entry);
    
    if (success) {
      console.log(`✅ Notion API Response: ${status} in ${duration}ms`);
    } else {
      console.error(`❌ Notion API Error: ${status} in ${duration}ms - ${error}`);
    }
  },
  
  /**
   * Ajoute une entrée de journal pour une erreur
   */
  logError(message: string, details?: any): void {
    const entry: NotionLogEntry = {
      timestamp: Date.now(),
      type: 'error',
      message,
      details
    };
    
    this.addLogEntry(entry);
    console.error(`❌ Notion API Error: ${message}`, details);
  },
  
  /**
   * Ajoute une entrée au journal
   */
  addLogEntry(entry: NotionLogEntry): void {
    apiLog.unshift(entry);
    
    // Limiter la taille du journal
    if (apiLog.length > MAX_LOG_ENTRIES) {
      apiLog = apiLog.slice(0, MAX_LOG_ENTRIES);
    }
  },
  
  /**
   * Récupère toutes les entrées du journal
   */
  getLog(): NotionLogEntry[] {
    return [...apiLog];
  },
  
  /**
   * Efface le journal
   */
  clearLog(): void {
    apiLog = [];
  },
  
  /**
   * Récupère les statistiques d'appels API
   */
  getStats(): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  } {
    const requests = apiLog.filter(entry => entry.type === 'request').length;
    const responses = apiLog.filter(entry => entry.type === 'response');
    const successfulResponses = responses.filter(entry => entry.status && entry.status < 400).length;
    const failedResponses = responses.filter(entry => entry.status && entry.status >= 400).length;
    
    // Calculer le temps de réponse moyen
    const responseTimes = responses.map(entry => entry.duration || 0).filter(duration => duration > 0);
    const averageTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
    
    return {
      totalRequests: requests,
      successfulRequests: successfulResponses,
      failedRequests: failedResponses,
      averageResponseTime: Math.round(averageTime)
    };
  }
};

export default notionLogger;
