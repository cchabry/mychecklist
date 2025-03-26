
import React from 'react';
import NotionTestButton from '../NotionTestButton';
import NotionWriteTestButton from '../NotionWriteTestButton';

interface NotionConnectionTestsProps {
  onSuccess?: () => void;
}

const NotionConnectionTests: React.FC<NotionConnectionTestsProps> = ({ onSuccess }) => {
  return (
    <div className="flex flex-col gap-2 pt-2">
      <p className="text-xs font-medium text-gray-500">Tests de connexion :</p>
      <div className="flex gap-2">
        <NotionTestButton onSuccess={onSuccess} />
        <NotionWriteTestButton onSuccess={onSuccess} />
      </div>
    </div>
  );
};

export default NotionConnectionTests;
