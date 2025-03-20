
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Database, Key, Check, AlertTriangle } from 'lucide-react';
import Header from '@/components/Header';
import { NotionConfig } from '@/components/notion/NotionConfig';
import NotionDatabaseCreator from '@/components/notion/NotionDatabaseCreator';
import NotionConnectionTests from '@/components/notion/form/NotionConnectionTests';
import { isNotionConfigured, testNotionConnection } from '@/lib/notion';

const NotionSetup: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('config');
  const [isConfigured, setIsConfigured] = useState(isNotionConfigured());
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  
  useEffect(() => {
    // Vérifier la configuration à chaque changement de page
    setIsConfigured(isNotionConfigured());
    
    if (isNotionConfigured()) {
      checkConnection();
    }
  }, []);
  
  const checkConnection = async () => {
    try {
      const result = await testNotionConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: error.message });
    }
  };
  
  const handleConfigSuccess = () => {
    setIsConfigured(isNotionConfigured());
    checkConnection();
    setActiveTab('databases');
  };
  
  const handleDatabaseSuccess = () => {
    checkConnection();
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-tmw-teal/5">
      <Header />
      
      <main className="flex-1 container py-8 mx-auto max-w-4xl px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 hover:text-tmw-teal"
        >
          <ArrowLeft size={16} className="mr-2" />
          Retour
        </Button>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-tmw-teal rounded-full p-2">
              <Database size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-tmw-darkgray">Configuration Notion</h1>
              <p className="text-muted-foreground">
                Configurez l'intégration avec Notion pour sauvegarder vos audits
              </p>
            </div>
            
            {isConfigured && testResult && (
              <Badge 
                variant={testResult.success ? "default" : "destructive"}
                className={`ml-auto ${testResult.success ? "bg-green-500" : ""}`}
              >
                {testResult.success ? (
                  <span className="flex items-center gap-1">
                    <Check size={12} />
                    Connecté
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Erreur
                  </span>
                )}
              </Badge>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="config" className="relative">
                <Key size={14} className="mr-2" />
                Configuration API
                {isConfigured && (
                  <span className="absolute top-0 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </TabsTrigger>
              <TabsTrigger value="databases" className="relative" disabled={!isConfigured}>
                <Database size={14} className="mr-2" />
                Bases de données
                {isConfigured && testResult?.success && 
                  localStorage.getItem('notion_checklists_database_id') && (
                  <span className="absolute top-0 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="config" className="mt-6">
              <Card className="border-tmw-teal/20">
                <CardHeader>
                  <CardTitle className="text-xl">Configuration de l'API Notion</CardTitle>
                  <CardDescription>
                    Connectez votre compte Notion à myChecklist
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotionConfig onSuccess={handleConfigSuccess} />
                </CardContent>
              </Card>
              
              {isConfigured && (
                <div className="mt-4">
                  <NotionConnectionTests onSuccess={checkConnection} />
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="databases" className="mt-6">
              <NotionDatabaseCreator onSuccess={handleDatabaseSuccess} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <footer className="py-6 border-t border-tmw-teal/10 bg-background">
        <div className="container px-4 mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} myChecklist - Audits Qualité Web
          <div className="mt-2 text-xs text-muted-foreground/70">by ThinkMyWeb</div>
        </div>
      </footer>
    </div>
  );
};

export default NotionSetup;
