
/**
 * Re-export du client mock Notion depuis son nouveau chemin
 * 
 * @deprecated Utiliser l'import depuis 'src/services/notion/client/mock/notionMockClient.ts'
 */

export { notionMockClient, NotionMockClient } from './mock/notionMockClient';
export default { notionMockClient };
