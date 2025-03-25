
import '@testing-library/jest-dom';

// Supprimer les avertissements des tests liés aux actes
const originalError = console.error;
console.error = (...args) => {
  if (/Warning: ReactDOM.render is no longer supported/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};
