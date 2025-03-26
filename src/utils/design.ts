
/**
 * Utilitaires pour l'utilisation des tokens de design
 */

import { COLORS, TYPOGRAPHY, SPACING, BORDERS, SHADOWS, TRANSITIONS, ANIMATIONS } from '@/constants/designTokens';

/**
 * Obtient une couleur à partir des tokens de design
 * @param color - Le nom de la couleur
 * @param variant - La variante de la couleur (pour les objets imbriqués)
 * @returns La valeur CSS de la couleur
 */
export const getColor = (color: keyof typeof COLORS, variant?: string): string => {
  if (!variant) {
    return (COLORS[color] as string);
  }
  
  const colorObj = COLORS[color] as Record<string, string>;
  return colorObj[variant] || '';
};

/**
 * Génère un style de texte basé sur les tokens de typographie
 * @param size - Taille de la police
 * @param weight - Graisse de la police
 * @param lineHeight - Hauteur de ligne
 * @returns Un objet de style CSS
 */
export const getTextStyle = (
  size: keyof typeof TYPOGRAPHY.FONT_SIZE = 'BASE',
  weight: keyof typeof TYPOGRAPHY.FONT_WEIGHT = 'NORMAL',
  lineHeight: keyof typeof TYPOGRAPHY.LINE_HEIGHT = 'NORMAL'
): React.CSSProperties => {
  return {
    fontSize: TYPOGRAPHY.FONT_SIZE[size],
    fontWeight: TYPOGRAPHY.FONT_WEIGHT[weight],
    lineHeight: TYPOGRAPHY.LINE_HEIGHT[lineHeight],
  };
};

/**
 * Obtient une valeur d'espacement à partir des tokens
 * @param space - La clé d'espacement
 * @returns La valeur CSS de l'espacement
 */
export const getSpacing = (space: keyof typeof SPACING): string => {
  return SPACING[space];
};

/**
 * Obtient une valeur de rayon de bordure à partir des tokens
 * @param radius - La clé du rayon
 * @returns La valeur CSS du rayon
 */
export const getBorderRadius = (radius: keyof typeof BORDERS.RADIUS): string => {
  return BORDERS.RADIUS[radius];
};

/**
 * Obtient une valeur d'ombre à partir des tokens
 * @param shadow - La clé de l'ombre
 * @returns La valeur CSS de l'ombre
 */
export const getShadow = (shadow: keyof typeof SHADOWS): string => {
  return SHADOWS[shadow];
};

/**
 * Obtient une valeur de durée de transition à partir des tokens
 * @param duration - La clé de la durée
 * @returns La valeur CSS de la durée
 */
export const getTransitionDuration = (duration: keyof typeof TRANSITIONS.DURATION): string => {
  return TRANSITIONS.DURATION[duration];
};

/**
 * Obtient une valeur de timing de transition à partir des tokens
 * @param timing - La clé du timing
 * @returns La valeur CSS du timing
 */
export const getTransitionTiming = (timing: keyof typeof TRANSITIONS.TIMING): string => {
  return TRANSITIONS.TIMING[timing];
};

/**
 * Construit une transition CSS complète
 * @param property - La propriété CSS à animer
 * @param duration - La durée de la transition
 * @param timing - La fonction de timing
 * @returns Une chaîne de transition CSS complète
 */
export const getTransition = (
  property: string = 'all',
  duration: keyof typeof TRANSITIONS.DURATION = 'DEFAULT',
  timing: keyof typeof TRANSITIONS.TIMING = 'EASE'
): string => {
  return `${property} ${TRANSITIONS.DURATION[duration]} ${TRANSITIONS.TIMING[timing]}`;
};
