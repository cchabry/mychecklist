
/**
 * Types spécifiques au client Notion
 * 
 * Ce module définit les types et interfaces utilisés spécifiquement
 * par le client Notion pour interagir avec l'API.
 */

/**
 * Propriété multi-select Notion
 */
export interface NotionMultiSelectProperty {
  /** Type de propriété */
  type: 'multi_select';
  /** Valeurs sélectionnées */
  multi_select: Array<{ name: string; color?: string; id?: string }>;
}

/**
 * Propriété select Notion
 */
export interface NotionSelectProperty {
  /** Type de propriété */
  type: 'select';
  /** Valeur sélectionnée */
  select: { name: string; color?: string; id?: string } | null;
}

/**
 * Propriété texte Notion
 */
export interface NotionRichTextProperty {
  /** Type de propriété */
  type: 'rich_text';
  /** Contenu textuel */
  rich_text: Array<{
    type: 'text';
    text: { content: string };
    annotations?: Record<string, boolean>;
    plain_text?: string;
  }>;
}

/**
 * Propriété numérique Notion
 */
export interface NotionNumberProperty {
  /** Type de propriété */
  type: 'number';
  /** Valeur numérique */
  number: number | null;
}

/**
 * Propriété titre Notion
 */
export interface NotionTitleProperty {
  /** Type de propriété */
  type: 'title';
  /** Contenu du titre */
  title: Array<{
    type: 'text';
    text: { content: string };
    annotations?: Record<string, boolean>;
    plain_text?: string;
  }>;
}

/**
 * Propriété date Notion
 */
export interface NotionDateProperty {
  /** Type de propriété */
  type: 'date';
  /** Valeur de date */
  date: {
    start: string;
    end?: string;
    time_zone?: string;
  } | null;
}

/**
 * Propriété URL Notion
 */
export interface NotionUrlProperty {
  /** Type de propriété */
  type: 'url';
  /** Valeur URL */
  url: string | null;
}
