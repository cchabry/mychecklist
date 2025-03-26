
/**
 * Types pour le système de design
 */

import { COLORS, TYPOGRAPHY, SPACING, BORDERS, SHADOWS, TRANSITIONS, ANIMATIONS } from '@/constants/designTokens';

/**
 * Types pour les couleurs
 */
export type ColorToken = keyof typeof COLORS;
export type GrayVariant = keyof typeof COLORS.GRAY;

/**
 * Types pour la typographie
 */
export type FontSizeToken = keyof typeof TYPOGRAPHY.FONT_SIZE;
export type FontWeightToken = keyof typeof TYPOGRAPHY.FONT_WEIGHT;
export type LineHeightToken = keyof typeof TYPOGRAPHY.LINE_HEIGHT;

/**
 * Types pour les espacements
 */
export type SpacingToken = keyof typeof SPACING;

/**
 * Types pour les bordures
 */
export type BorderRadiusToken = keyof typeof BORDERS.RADIUS;
export type BorderWidthToken = keyof typeof BORDERS.WIDTH;

/**
 * Types pour les ombres
 */
export type ShadowToken = keyof typeof SHADOWS;

/**
 * Types pour les transitions
 */
export type TransitionDurationToken = keyof typeof TRANSITIONS.DURATION;
export type TransitionTimingToken = keyof typeof TRANSITIONS.TIMING;

/**
 * Types pour les points de rupture
 */
export type BreakpointToken = 'SM' | 'MD' | 'LG' | 'XL' | '2XL';

/**
 * Type pour un thème
 */
export interface Theme {
  colors: typeof COLORS;
  typography: typeof TYPOGRAPHY;
  spacing: typeof SPACING;
  borders: typeof BORDERS;
  shadows: typeof SHADOWS;
  transitions: typeof TRANSITIONS;
  animations: typeof ANIMATIONS;
}
