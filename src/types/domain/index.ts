
/**
 * Point d'entrée pour les types du domaine
 * 
 * Ce fichier exporte tous les types du domaine de manière centralisée
 * pour faciliter les imports et éviter les problèmes de référence circulaire.
 */

// Exporter tous les types du domaine
export * from './action';
export * from './attachment';
export * from './audit';
export * from './checklist';
export * from './evaluation';
export * from './exigence';
export * from './project';
export * from './progress';
export * from './samplePage';

// Types qui n'ont pas encore leur propre fichier
export * from './user';
