
import { useNotionAPI } from './useNotionAPI';

/**
 * @deprecated Utiliser useNotionAPI à la place
 */
export function useNotionRequest<T = unknown>() {
  return useNotionAPI<T>();
}
