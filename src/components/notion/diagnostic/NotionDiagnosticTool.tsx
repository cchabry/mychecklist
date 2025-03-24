
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, FileWarning, RotateCw } from "lucide-react";
import { notionApi } from '@/lib/notionProxy';
import { isMockActive, temporarilyDisableMock, enableMock } from '../utils';
import NotionCreatePageTest from './NotionCreatePageTest';

interface NotionDiagnosticToolProps {
  apiKey: string | null;
  projectsDbId: string | null;
  checklistsDbId: string | null;
  onClose: () => void;
}

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

interface TestResult {
  name: string;
  status: TestStatus;
  details?: string;
}

const NotionDiagnosticTool: React.FC<NotionDiagnosticToolProps> = ({ apiKey, projectsDbId, checklistsDbId, onClose }) => {
  const [activeTest, setActiveTest] = useState<string | null>(null);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Outils de diagnostic Notion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!activeTest ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choisissez un test à exécuter pour diagnostiquer votre configuration Notion.
            </p>

            <Button variant="outline" onClick={() => setActiveTest('create-page')}>
              Tester la création de page
            </Button>
          </div>
        ) : activeTest === 'create-page' ? (
          <NotionCreatePageTest
            onClose={() => setActiveTest(null)}
          />
        ) : null}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="ghost" onClick={onClose}>
          Fermer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotionDiagnosticTool;
