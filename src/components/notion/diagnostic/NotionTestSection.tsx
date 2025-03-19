
import React from 'react';
import { Separator } from '@/components/ui/separator';
import NotionTestResult, { TestResult } from './NotionTestResult';

interface NotionTestSectionProps {
  title: string;
  tests: TestResult[];
}

const NotionTestSection: React.FC<NotionTestSectionProps> = ({ title, tests }) => {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <div className="space-y-1 pl-1">
        {tests.map((test, index) => (
          <NotionTestResult key={`${title}-${index}`} test={test} />
        ))}
      </div>
    </div>
  );
};

export default NotionTestSection;
