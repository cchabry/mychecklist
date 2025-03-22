
import { useNotionAPI } from './notion/useNotionAPI';

/**
 * @deprecated Utiliser useNotionAPI importé depuis './notion/useNotionAPI' à la place
 */
export function useNotionApi<T = any>() {
  return useNotionAPI<T>();
}
