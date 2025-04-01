import { Action, ActionStatus } from '@/types/domain/action';
import { getDatabase, updatePage } from '../notionClient';
import { mapNotionToAction, mapActionToNotionProperties } from './actionMapper';
import { getActionDatabaseId } from '../config';

/**
 * Récupère toutes les actions d'un audit
 */
export async function getActionsByAuditId(auditId: string): Promise<Action[]> {
  try {
    const databaseId = getActionDatabaseId();
    const response = await getDatabase(databaseId, {
      filter: {
        property: 'AuditId',
        rich_text: {
          equals: auditId
        }
      },
      sorts: [
        {
          property: 'Status',
          direction: 'ascending'
        },
        {
          property: 'Priority',
          direction: 'descending'
        }
      ]
    });

    return response.results.map(mapNotionToAction);
  } catch (error) {
    console.error('Error fetching actions by audit ID:', error);
    throw new Error('Failed to fetch actions');
  }
}

/**
 * Met à jour le statut d'une action
 */
export async function updateActionStatus(actionId: string, status: ActionStatus): Promise<Action> {
  try {
    const response = await updatePage(actionId, {
      properties: {
        Status: {
          select: {
            name: status
          }
        },
        // Si le statut est "Done", mettre à jour la date de complétion
        ...(status === ActionStatus.Done && {
          CompletedAt: {
            date: {
              start: new Date().toISOString()
            }
          }
        })
      }
    });

    return mapNotionToAction(response);
  } catch (error) {
    console.error('Error updating action status:', error);
    throw new Error('Failed to update action status');
  }
}

/**
 * Met à jour une action
 */
export async function updateAction(action: Action): Promise<Action> {
  try {
    const properties = mapActionToNotionProperties(action);
    const response = await updatePage(action.id, { properties });
    return mapNotionToAction(response);
  } catch (error) {
    console.error('Error updating action:', error);
    throw new Error('Failed to update action');
  }
}

/**
 * Crée une nouvelle action
 */
export async function createAction(action: Omit<Action, 'id'>): Promise<Action> {
  try {
    const databaseId = getActionDatabaseId();
    const properties = mapActionToNotionProperties(action as Action);
    
    const response = await createPage({
      parent: { database_id: databaseId },
      properties
    });
    
    return mapNotionToAction(response);
  } catch (error) {
    console.error('Error creating action:', error);
    throw new Error('Failed to create action');
  }
}

/**
 * Supprime une action
 */
export async function deleteAction(actionId: string): Promise<boolean> {
  try {
    await archivePage(actionId);
    return true;
  } catch (error) {
    console.error('Error deleting action:', error);
    throw new Error('Failed to delete action');
  }
}

// Fonction d'aide pour créer une page Notion
async function createPage(params: any) {
  // Implémentation à compléter avec l'API Notion
  throw new Error('Not implemented');
}

// Fonction d'aide pour archiver une page Notion
async function archivePage(pageId: string) {
  // Implémentation à compléter avec l'API Notion
  throw new Error('Not implemented');
}
