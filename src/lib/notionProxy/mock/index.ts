
// Exporter les utilitaires de mock
export { default as mockUtils } from './utils';

// Exporter le mode mock
export { default as mockMode } from './mode';

// Exporter les données mock
export { mockData } from './data';

// Exporter par défaut l'ensemble des utilitaires mock
export default {
  utils: mockUtils,
  mode: mockMode,
  data: mockData
};
