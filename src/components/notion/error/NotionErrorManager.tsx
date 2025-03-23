
import React from 'react';
import NotionErrorMonitor from './NotionErrorMonitor';
import RetryQueueMonitor from './RetryQueueMonitor';

/**
 * Composant pour afficher et gérer les erreurs Notion 
 * et la file d'attente de nouvelles tentatives
 */
const NotionErrorManager: React.FC = () => {
  return (
    <div className="space-y-4">
      <NotionErrorMonitor />
      <RetryQueueMonitor />
    </div>
  );
};

export default NotionErrorManager;
