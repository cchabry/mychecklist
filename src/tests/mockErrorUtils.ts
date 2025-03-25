
/**
 * Utilitaires pour simuler des erreurs et tester la gestion d'erreurs
 */

// Simulation d'erreurs de réseau
export function createNetworkError(): Error {
  const error = new Error('Network error: Failed to fetch');
  // @ts-ignore - Ajouter une propriété pour identifier le type d'erreur
  error.isNetworkError = true;
  return error;
}

// Simulation d'erreurs d'authentification
export function createAuthError(): Error {
  const error = new Error('Authentication failed: Invalid token');
  // @ts-ignore - Ajouter le code HTTP pour les tests
  error.status = 401;
  return error;
}

// Simulation d'erreurs de permission
export function createPermissionError(): Error {
  const error = new Error('Permission denied: Insufficient permissions');
  // @ts-ignore - Ajouter le code HTTP pour les tests
  error.status = 403;
  return error;
}

// Simulation d'erreurs de ressource non trouvée
export function createNotFoundError(): Error {
  const error = new Error('Resource not found');
  // @ts-ignore - Ajouter le code HTTP pour les tests
  error.status = 404;
  return error;
}

// Simulation d'erreurs de timeout
export function createTimeoutError(): Error {
  const error = new Error('Request timeout');
  // @ts-ignore - Ajouter une propriété pour identifier le type d'erreur
  error.isTimeout = true;
  return error;
}

// Fonction pour simuler un appel API qui échoue
export async function simulateFailedApiCall(errorType: 'network' | 'auth' | 'permission' | 'notFound' | 'timeout'): Promise<never> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simuler un délai
  
  switch (errorType) {
    case 'network':
      throw createNetworkError();
    case 'auth':
      throw createAuthError();
    case 'permission':
      throw createPermissionError();
    case 'notFound':
      throw createNotFoundError();
    case 'timeout':
      throw createTimeoutError();
  }
}

// Fonction pour simuler un appel API réussi
export async function simulateSuccessfulApiCall<T>(data: T): Promise<T> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simuler un délai
  return data;
}
