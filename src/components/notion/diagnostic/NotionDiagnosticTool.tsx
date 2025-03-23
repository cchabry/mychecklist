
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotionConnectionTest } from './NotionConnectionTest';
import { NotionDatabaseTest } from './NotionDatabaseTest';
import { NotionCreatePageTest } from './NotionCreatePageTest';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { NotionConfig } from '@/components/notion/config/NotionConfig';
import { extractNotionDatabaseId } from '@/lib/notion';

/**
 * Outil de diagnostic pour les connexions Notion
 */
export function NotionDiagnosticTool() {
  const [apiKey, setApiKey] = useState('');
  const [databaseId, setDatabaseId] = useState('');
  const [activeTab, setActiveTab] = useState('config');
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const [showDatabaseTest, setShowDatabaseTest] = useState(false);
  const [showCreatePageTest, setShowCreatePageTest] = useState(false);
  
  const handleClearApiKey = () => {
    setApiKey('');
  };
  
  const handleClearDatabaseId = () => {
    setDatabaseId('');
  };
  
  const handleDatabaseUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    const extractedId = extractNotionDatabaseId(url);
    setDatabaseId(extractedId || url);
  };
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Notion Diagnostic Tool</CardTitle>
        <CardDescription>
          Test your Notion connection and database configuration
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="tests">Tests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <CardContent className="space-y-4">
            <NotionConfig />
          </CardContent>
        </TabsContent>
        
        <TabsContent value="tests">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="secret_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Button variant="outline" onClick={handleClearApiKey}>
                  Clear
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="databaseId">Database ID or URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="databaseId"
                  placeholder="Database ID or URL"
                  value={databaseId}
                  onChange={handleDatabaseUrlChange}
                />
                <Button variant="outline" onClick={handleClearDatabaseId}>
                  Clear
                </Button>
              </div>
            </div>
            
            <Alert variant="info" className="mt-4">
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                Enter your Notion API key and database ID or URL to run the tests.
                The API key should start with <code>secret_</code>.
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <div className="space-x-2">
              <Button 
                onClick={() => setShowConnectionTest(true)} 
                disabled={!apiKey}
                variant="outline"
              >
                Test Connection
              </Button>
              
              <Button 
                onClick={() => setShowDatabaseTest(true)}
                disabled={!apiKey || !databaseId}
                variant="outline"
              >
                Test Database
              </Button>
              
              <Button 
                onClick={() => setShowCreatePageTest(true)}
                disabled={!apiKey || !databaseId}
                variant="outline"
              >
                Test Create Page
              </Button>
            </div>
          </CardFooter>
        </TabsContent>
      </Tabs>
      
      {showConnectionTest && (
        <NotionConnectionTest 
          apiKey={apiKey}
          onClose={() => setShowConnectionTest(false)}
        />
      )}
      
      {showDatabaseTest && (
        <NotionDatabaseTest 
          apiKey={apiKey}
          databaseId={databaseId}
          onClose={() => setShowDatabaseTest(false)}
        />
      )}
      
      {showCreatePageTest && (
        <NotionCreatePageTest 
          databaseId={databaseId}
          onClose={() => setShowCreatePageTest(false)}
        />
      )}
    </Card>
  );
}
