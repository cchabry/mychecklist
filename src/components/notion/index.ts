
// Exporter les composants Notion
export { default as NotionConfig } from './NotionConfig';
export { default as NotionErrorDetails } from './NotionErrorDetails';
export { default as NotionTestButton } from './NotionTestButton';
export { default as NotionWriteTestButton } from './NotionWriteTestButton';
export { default as NotionProxyConfigGuide } from './NotionProxyConfigGuide';
export { default as NotionDatabaseStructureCheck } from './NotionDatabaseStructureCheck';
export { default as NotionFetchErrorSection } from './NotionFetchErrorSection';
export { default as NotionErrorStatusSection } from './NotionErrorStatusSection';
export { default as NotionSolutionsSection } from './NotionSolutionsSection';
export { default as NotionAlternativesSection } from './NotionAlternativesSection';
export { default as NotionDeploymentChecker } from './NotionDeploymentChecker';
export { default as NotionCreatePageTest } from './NotionCreatePageTest';
export { default as NotionErrorActions } from './NotionErrorActions';
export { default as ProxyStatusIndicator } from './ProxyStatusIndicator';
export { default as MockModeControl } from './MockModeControl';
export { default as MockModeSelector } from './MockModeSelector';

// Add the missing diagnostic tools
export { NotionDiagnosticTool, NotionDiagnosticRunner, NotionTestResult, NotionTestSection, NotionTestSummary } from './diagnostic';
export type { DiagnosticResults } from '@/hooks/notion/useNotionDiagnostic';
export type { TestResult, TestStatus } from './diagnostic/NotionTestResult';
