
import React from 'react';
import NotionTestButton from '../NotionTestButton';
import NotionWriteTestButton from '../NotionWriteTestButton';

interface NotionConnectionTestsProps {
  className?: string;
  apiKey: string;
  databaseId: string;
  onSuccess?: () => void;
}

const NotionConnectionTests: React.FC<NotionConnectionTestsProps> = ({ 
  className, 
  apiKey,
  databaseId,
  onSuccess 
}) => {
  return (
    <div className={`flex flex-col gap-2 pt-2 ${className || ''}`}>
      <p className="text-xs font-medium text-gray-500">Tests de connexion :</p>
      <div className="flex gap-2">
        <NotionTestButton 
          onSuccess={onSuccess} 
          apiKey={apiKey}
          databaseId={databaseId}
        />
        <NotionWriteTestButton 
          onSuccess={onSuccess}
          apiKey={apiKey}
          databaseId={databaseId}
        />
      </div>
    </div>
  );
};

export default NotionConnectionTests;
