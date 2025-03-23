
// Exporter uniquement les utilitaires et données mock nécessaires
import mockUtils from './utils';
import { mockData } from './data';

// Exporter les données mock
export { mockData };

// Exporter par défaut les utilitaires mock
export default {
  utils: mockUtils,
  data: mockData
};
