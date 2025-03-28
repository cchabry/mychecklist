
/**
 * Constantes utilisées par les services Notion
 */

// En-têtes par défaut pour les requêtes Notion
export const defaultHeaders = {
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28'
};

// Types de propriétés Notion
export const PROPERTY_TYPES = {
  TITLE: 'title',
  RICH_TEXT: 'rich_text',
  NUMBER: 'number',
  SELECT: 'select',
  MULTI_SELECT: 'multi_select',
  DATE: 'date',
  PEOPLE: 'people',
  FILES: 'files',
  CHECKBOX: 'checkbox',
  URL: 'url',
  EMAIL: 'email',
  PHONE_NUMBER: 'phone_number',
  FORMULA: 'formula',
  RELATION: 'relation',
  ROLLUP: 'rollup',
  CREATED_TIME: 'created_time',
  CREATED_BY: 'created_by',
  LAST_EDITED_TIME: 'last_edited_time',
  LAST_EDITED_BY: 'last_edited_by',
};
