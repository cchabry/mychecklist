
/**
 * Re-export du client mock Notion depuis son nouveau chemin
 * 
 * @deprecated Utiliser l'import depuis 'src/services/notion/client/mock/notionMockClient.ts'
 */

import { notionMockClient as importedMockClient, NotionMockClient } from './mock/notionMockClient';

export const notionMockClient = importedMockClient;
export { NotionMockClient };
export default notionMockClient;
