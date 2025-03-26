
/**
 * Types pour les outils de diagnostique Notion
 */

export interface NotionCreatePageTestProps {
  databaseId: string;
  onClose: () => void;
  onSuccess?: (pageId: string) => void;
  onError?: (error: Error) => void;
}

export interface NotionConnectionTestProps {
  apiKey: string;
  onClose: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface NotionDatabaseTestProps {
  databaseId: string;
  apiKey: string;
  onClose: () => void;
  onSuccess?: (databaseInfo: any) => void;
  onError?: (error: Error) => void;
}
