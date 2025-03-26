
/**
 * Tokens de design pour l'application
 * Contient les définitions des couleurs, typographies et espacements
 */

/**
 * Couleurs principales de l'application
 */
export const COLORS = {
  // Couleurs principales selon la charte ThinkMyWeb
  PRIMARY: '#28767D',     // couleur_02: Vert teal principal
  SECONDARY: '#F26A52',   // couleur_04: Orange/corail 
  SECONDARY_HOVER: '#d85b47', // couleur_04_hover: Orange/corail hover
  TERTIARY: '#F9E4D7',    // couleur_03: Beige clair
  DARK: '#000000',        // couleur_01: Noir
  
  // Niveaux de gris
  GRAY: {
    LIGHTEST: '#F9F9F9',
    LIGHT: '#E5E7EB',
    MEDIUM: '#9CA3AF',
    DARK: '#4B5563',
    DARKEST: '#333333',
  },
  
  // Couleurs sémantiques
  SUCCESS: '#10B981',
  WARNING: '#FBBF24',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  
  // Couleurs d'interface
  BACKGROUND: '#FFFFFF',
  FOREGROUND: '#111827',
  CARD: '#FFFFFF',
  BORDER: '#E5E7EB',
};

/**
 * Configuration de la typographie
 */
export const TYPOGRAPHY = {
  // Famille de polices
  FONT_FAMILY: {
    SANS: [
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    MONO: [
      'JetBrains Mono',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
  },
  
  // Tailles de police
  FONT_SIZE: {
    XS: '0.75rem',
    SM: '0.875rem',
    BASE: '1rem',
    LG: '1.125rem',
    XL: '1.25rem',
    '2XL': '1.5rem',
    '3XL': '1.875rem',
    '4XL': '2.25rem',
    '5XL': '3rem',
  },
  
  // Graisse de police
  FONT_WEIGHT: {
    NORMAL: '400',
    MEDIUM: '500',
    SEMIBOLD: '600',
    BOLD: '700',
  },
  
  // Hauteur de ligne
  LINE_HEIGHT: {
    NONE: '1',
    TIGHT: '1.25',
    SNUG: '1.375',
    NORMAL: '1.5',
    RELAXED: '1.625',
    LOOSE: '2',
  },
};

/**
 * Système d'espacement
 */
export const SPACING = {
  '0': '0px',
  '0.5': '0.125rem',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  '3': '0.75rem',
  '3.5': '0.875rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '32': '8rem',
  '40': '10rem',
  '48': '12rem',
  '56': '14rem',
  '64': '16rem',
};

/**
 * Système de bordures et arrondis
 */
export const BORDERS = {
  RADIUS: {
    NONE: '0',
    SM: '0.125rem',
    DEFAULT: '0.25rem',
    MD: '0.375rem',
    LG: '0.5rem',
    XL: '0.75rem',
    '2XL': '1rem',
    '3XL': '1.5rem',
    FULL: '9999px',
  },
  WIDTH: {
    NONE: '0',
    THIN: '1px',
    THICK: '2px',
    THICKER: '3px',
  },
};

/**
 * Système d'ombres
 */
export const SHADOWS = {
  NONE: 'none',
  SM: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2XL': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

/**
 * Transitions et animations
 */
export const TRANSITIONS = {
  DURATION: {
    FAST: '150ms',
    DEFAULT: '300ms',
    SLOW: '500ms',
  },
  TIMING: {
    EASE: 'cubic-bezier(0.4, 0, 0.2, 1)',
    EASE_IN: 'cubic-bezier(0.4, 0, 1, 1)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    APPLE: 'cubic-bezier(0.25, 1, 0.5, 1)',
  },
};

/**
 * Animations prédéfinies
 */
export const ANIMATIONS = {
  KEYFRAMES: {
    FADE_IN: {
      FROM: { opacity: '0' },
      TO: { opacity: '1' },
    },
    FADE_OUT: {
      FROM: { opacity: '1' },
      TO: { opacity: '0' },
    },
    SLIDE_IN: {
      FROM: { transform: 'translateY(20px)', opacity: '0' },
      TO: { transform: 'translateY(0)', opacity: '1' },
    },
    SCALE_IN: {
      FROM: { transform: 'scale(0.95)', opacity: '0' },
      TO: { transform: 'scale(1)', opacity: '1' },
    },
  },
};

/**
 * Mediaquery breakpoints
 */
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
};
