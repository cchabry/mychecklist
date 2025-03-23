
// Exporter les utilitaires de mock
import mockUtils from './utils';
import mockMode from './mode';
import { mockData } from './data';

// Exporter le mode mock
export { mockMode };

// Exporter les données mock
export { mockData };

// Exporter par défaut l'ensemble des utilitaires mock
export default {
  utils: mockUtils,
  mode: mockMode,
  data: mockData
};
