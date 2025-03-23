import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import CacheDiagnostics from './CacheDiagnostics';
import ApiCacheDiagnostics from './ApiCacheDiagnostics';
import NotionDiagnostics from './NotionDiagnostics';
import OperationModeDiagnostics from './OperationModeDiagnostics';

const DiagnosticsMenu = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Outils de diagnostic</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Cache</CardTitle>
            <CardDescription>Diagnostic du système de cache local</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/diagnostics/cache">Ouvrir</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>API avec Cache</CardTitle>
            <CardDescription>Test des services avec mise en cache</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/diagnostics/api-cache">Ouvrir</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notion</CardTitle>
            <CardDescription>Test de la connexion à Notion</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/diagnostics/notion">Ouvrir</Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mode opérationnel</CardTitle>
            <CardDescription>Test du système operationMode</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/diagnostics/operation-mode">Ouvrir</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

const DiagnosticsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<DiagnosticsMenu />} />
      <Route path="/cache" element={<CacheDiagnostics />} />
      <Route path="/api-cache" element={<ApiCacheDiagnostics />} />
      <Route path="/notion" element={<NotionDiagnostics />} />
      <Route path="/operation-mode" element={<OperationModeDiagnostics />} />
      <Route path="*" element={<Navigate to="/diagnostics" replace />} />
    </Routes>
  );
};

export default DiagnosticsRoutes;
