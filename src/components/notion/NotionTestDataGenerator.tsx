
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCw, Database, Check, XCircle, AlertTriangle } from 'lucide-react';
import { notionApi } from '@/lib/notionProxy';
import { toast } from 'sonner';
import { STORAGE_KEYS } from '@/lib/notionProxy/config';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface NotionTestDataGeneratorProps {
  onComplete?: () => void;
}

interface DatabaseInfo {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  recordCount: number;
}

// Type pour les relations entre bases de données
interface RelationMap {
  [sourceDb: string]: {
    [relationField: string]: {
      targetDb: string;
      targetField?: string;
    }
  }
}

const NotionTestDataGenerator: React.FC<NotionTestDataGeneratorProps> = ({ onComplete }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<'idle' | 'collecting' | 'generating' | 'verifying' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  // Fonction pour ajouter des logs
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Fonction pour mettre à jour le statut d'une base de données
  const updateDatabaseStatus = (dbId: string, updates: Partial<DatabaseInfo>) => {
    setDatabases(prev => prev.map(db => 
      db.id === dbId ? { ...db, ...updates } : db
    ));
  };

  // Collecter les informations sur les bases de données Notion
  const collectDatabases = async () => {
    try {
      setStep('collecting');
      addLog('Collecte des informations sur les bases de données...');

      // Récupérer les IDs des bases de données depuis localStorage
      const dbIds = {
        projects: localStorage.getItem('notion_projects_database_id'),
        pages: localStorage.getItem('notion_pages_database_id'),
        checklists: localStorage.getItem('notion_checklists_database_id'),
        exigences: localStorage.getItem('notion_exigences_database_id'),
        audits: localStorage.getItem('notion_audits_database_id'),
        evaluations: localStorage.getItem('notion_evaluations_database_id'),
        actions: localStorage.getItem('notion_actions_database_id'),
        progress: localStorage.getItem('notion_progress_database_id')
      };

      // Vérifier que toutes les bases sont configurées
      const missingDbs = Object.entries(dbIds)
        .filter(([_, id]) => !id)
        .map(([name]) => name);

      if (missingDbs.length > 0) {
        addLog(`⚠️ Bases de données manquantes: ${missingDbs.join(', ')}`);
        toast.error('Configuration incomplète', {
          description: `Les bases de données suivantes ne sont pas configurées: ${missingDbs.join(', ')}`
        });
        setStep('error');
        return false;
      }

      const apiKey = localStorage.getItem('notion_api_key');
      if (!apiKey) {
        addLog('❌ Clé API Notion manquante');
        toast.error('Clé API manquante', {
          description: 'Veuillez configurer votre clé API Notion'
        });
        setStep('error');
        return false;
      }

      // Initialiser les informations de base de données
      const dbInfos: DatabaseInfo[] = [];
      
      // Fonction pour récupérer les détails d'une base
      const getDbInfo = async (dbId: string, dbName: string) => {
        try {
          const dbDetails = await notionApi.databases.retrieve(dbId, apiKey);
          dbInfos.push({
            id: dbId,
            name: dbName,
            status: 'pending',
            recordCount: 0
          });
          addLog(`✅ Base "${dbName}" trouvée: ${dbId.substring(0, 8)}...`);
          return true;
        } catch (error) {
          addLog(`❌ Erreur lors de la récupération de la base "${dbName}": ${error.message}`);
          return false;
        }
      };

      // Récupérer les informations pour chaque base
      for (const [dbName, dbId] of Object.entries(dbIds)) {
        if (dbId) {
          await getDbInfo(dbId, dbName);
        }
      }

      setDatabases(dbInfos);
      setProgress(10);
      return true;
    } catch (error) {
      addLog(`❌ Erreur lors de la collecte des bases de données: ${error.message}`);
      toast.error('Erreur de collecte', {
        description: error.message
      });
      setStep('error');
      return false;
    }
  };

  // Générer des données de test pour toutes les bases
  const generateTestData = async () => {
    const apiKey = localStorage.getItem('notion_api_key');
    
    if (!apiKey) {
      addLog('❌ Clé API Notion manquante');
      return false;
    }

    setStep('generating');
    addLog('Génération des données de test...');

    // Dictionnaire pour stocker les IDs de référence (pour les relations)
    const referenceIds: Record<string, string[]> = {};
    
    try {
      // 1. Générer d'abord les données pour la base Checklist (pas de dépendances)
      addLog('Étape 1: Création des items de checklist');
      const checklistDbId = databases.find(db => db.name === 'checklists')?.id;
      
      if (checklistDbId) {
        updateDatabaseStatus(checklistDbId, { status: 'processing' });
        
        const checklistItems = [
          { consigne: "Images optimisées pour le web", category: "Médias", subcategory: "Images", priority: "High" },
          { consigne: "Textes alternatifs pour les images", category: "Accessibilité", subcategory: "Images", priority: "Medium" },
          { consigne: "Contraste de couleurs suffisant", category: "Accessibilité", subcategory: "Couleurs", priority: "High" },
          { consigne: "Structure de titres cohérente", category: "Technique", subcategory: "Structure", priority: "Medium" },
          { consigne: "Site responsive sur mobile", category: "Technique", subcategory: "Responsive", priority: "High" }
        ];
        
        // Créer les items de checklist
        for (const item of checklistItems) {
          try {
            const response = await notionApi.pages.create({
              parent: { database_id: checklistDbId },
              properties: {
                Name: { title: [{ text: { content: item.consigne } }] },
                Category: { select: { name: item.category } },
                Subcategory: { select: { name: item.subcategory } },
                Priority: { select: { name: item.priority } }
              }
            }, apiKey);
            
            // Stocker l'ID pour les références futures
            if (!referenceIds.checklists) referenceIds.checklists = [];
            referenceIds.checklists.push(response.id);
            
            addLog(`✅ Item de checklist créé: "${item.consigne}"`);
          } catch (error) {
            addLog(`❌ Erreur lors de la création de l'item "${item.consigne}": ${error.message}`);
          }
        }
        
        updateDatabaseStatus(checklistDbId, { 
          status: 'success', 
          recordCount: checklistItems.length 
        });
      }
      
      setProgress(20);
      
      // 2. Générer les données pour les projets
      addLog('Étape 2: Création des projets');
      const projectsDbId = databases.find(db => db.name === 'projects')?.id;
      
      if (projectsDbId) {
        updateDatabaseStatus(projectsDbId, { status: 'processing' });
        
        const projects = [
          { name: "Site e-commerce", url: "https://shop.example.com", progress: "En cours" },
          { name: "Application mobile", url: "https://app.example.com", progress: "Planifié" }
        ];
        
        // Créer les projets
        for (const project of projects) {
          try {
            const response = await notionApi.pages.create({
              parent: { database_id: projectsDbId },
              properties: {
                Name: { title: [{ text: { content: project.name } }] },
                URL: { url: project.url },
                Progress: { select: { name: project.progress } }
              }
            }, apiKey);
            
            // Stocker l'ID pour les références futures
            if (!referenceIds.projects) referenceIds.projects = [];
            referenceIds.projects.push(response.id);
            
            addLog(`✅ Projet créé: "${project.name}"`);
          } catch (error) {
            addLog(`❌ Erreur lors de la création du projet "${project.name}": ${error.message}`);
          }
        }
        
        updateDatabaseStatus(projectsDbId, { 
          status: 'success', 
          recordCount: projects.length 
        });
      }
      
      setProgress(30);
      
      // 3. Créer les pages d'échantillon (dépend des projets)
      addLog('Étape 3: Création des pages d\'échantillon');
      const pagesDbId = databases.find(db => db.name === 'pages')?.id;
      
      if (pagesDbId && referenceIds.projects?.length > 0) {
        updateDatabaseStatus(pagesDbId, { status: 'processing' });
        
        // Utiliser le premier projet comme référence
        const projectId = referenceIds.projects[0];
        
        const pages = [
          { title: "Page d'accueil", url: "https://shop.example.com/", description: "Page principale" },
          { title: "Catalogue produits", url: "https://shop.example.com/products", description: "Liste des produits" },
          { title: "Fiche produit", url: "https://shop.example.com/products/1", description: "Détail d'un produit" }
        ];
        
        // Créer les pages
        for (const page of pages) {
          try {
            const response = await notionApi.pages.create({
              parent: { database_id: pagesDbId },
              properties: {
                Name: { title: [{ text: { content: page.title } }] },
                URL: { url: page.url },
                Description: { rich_text: [{ text: { content: page.description } }] },
                // Relation avec le projet
                Projet: {
                  relation: [{ id: projectId }]
                }
              }
            }, apiKey);
            
            // Stocker l'ID pour les références futures
            if (!referenceIds.pages) referenceIds.pages = [];
            referenceIds.pages.push(response.id);
            
            addLog(`✅ Page créée: "${page.title}"`);
          } catch (error) {
            addLog(`❌ Erreur lors de la création de la page "${page.title}": ${error.message}`);
          }
        }
        
        updateDatabaseStatus(pagesDbId, { 
          status: 'success', 
          recordCount: pages.length 
        });
      }
      
      setProgress(40);
      
      // 4. Créer les exigences (dépend des projets et de la checklist)
      addLog('Étape 4: Création des exigences');
      const exigencesDbId = databases.find(db => db.name === 'exigences')?.id;
      
      if (exigencesDbId && referenceIds.projects?.length > 0 && referenceIds.checklists?.length > 0) {
        updateDatabaseStatus(exigencesDbId, { status: 'processing' });
        
        // Utiliser le premier projet comme référence
        const projectId = referenceIds.projects[0];
        
        // Créer une exigence pour chaque item de checklist
        for (let i = 0; i < referenceIds.checklists.length; i++) {
          const checklistId = referenceIds.checklists[i];
          const importance = ["Mineur", "Moyen", "Important", "Majeur"][i % 4];
          
          try {
            const response = await notionApi.pages.create({
              parent: { database_id: exigencesDbId },
              properties: {
                Name: { title: [{ text: { content: `Exigence ${i+1}` } }] },
                Importance: { select: { name: importance } },
                Comment: { rich_text: [{ text: { content: `Commentaire pour l'exigence ${i+1}` } }] },
                // Relations
                Projet: { relation: [{ id: projectId }] },
                Item: { relation: [{ id: checklistId }] }
              }
            }, apiKey);
            
            // Stocker l'ID pour les références futures
            if (!referenceIds.exigences) referenceIds.exigences = [];
            referenceIds.exigences.push(response.id);
            
            addLog(`✅ Exigence créée: "Exigence ${i+1}"`);
          } catch (error) {
            addLog(`❌ Erreur lors de la création de l'exigence ${i+1}: ${error.message}`);
          }
        }
        
        updateDatabaseStatus(exigencesDbId, { 
          status: 'success', 
          recordCount: referenceIds.checklists.length 
        });
      }
      
      setProgress(50);
      
      // 5. Créer un audit (dépend des projets)
      addLog('Étape 5: Création d\'un audit');
      const auditsDbId = databases.find(db => db.name === 'audits')?.id;
      
      if (auditsDbId && referenceIds.projects?.length > 0) {
        updateDatabaseStatus(auditsDbId, { status: 'processing' });
        
        // Utiliser le premier projet comme référence
        const projectId = referenceIds.projects[0];
        
        try {
          const response = await notionApi.pages.create({
            parent: { database_id: auditsDbId },
            properties: {
              Name: { title: [{ text: { content: "Audit initial" } }] },
              CreatedAt: { date: { start: new Date().toISOString() } },
              // Relation avec le projet
              Projet: { relation: [{ id: projectId }] }
            }
          }, apiKey);
          
          // Stocker l'ID pour les références futures
          if (!referenceIds.audits) referenceIds.audits = [];
          referenceIds.audits.push(response.id);
          
          addLog(`✅ Audit créé: "Audit initial"`);
          
          updateDatabaseStatus(auditsDbId, { 
            status: 'success', 
            recordCount: 1
          });
        } catch (error) {
          addLog(`❌ Erreur lors de la création de l'audit: ${error.message}`);
          updateDatabaseStatus(auditsDbId, { 
            status: 'error', 
            error: error.message
          });
        }
      }
      
      setProgress(60);
      
      // 6. Créer des évaluations (dépend des audits, pages et exigences)
      addLog('Étape 6: Création des évaluations');
      const evaluationsDbId = databases.find(db => db.name === 'evaluations')?.id;
      
      if (evaluationsDbId && 
          referenceIds.audits?.length > 0 && 
          referenceIds.pages?.length > 0 && 
          referenceIds.exigences?.length > 0) {
        
        updateDatabaseStatus(evaluationsDbId, { status: 'processing' });
        
        const auditId = referenceIds.audits[0];
        const evaluations = [];
        let count = 0;
        
        // Créer une évaluation pour chaque combinaison page/exigence
        for (const pageId of referenceIds.pages) {
          for (const exigenceId of referenceIds.exigences) {
            const scores = ["Conforme", "Partiellement conforme", "Non conforme", "Non applicable"];
            const score = scores[Math.floor(Math.random() * scores.length)];
            
            try {
              const response = await notionApi.pages.create({
                parent: { database_id: evaluationsDbId },
                properties: {
                  Name: { title: [{ text: { content: `Évaluation ${++count}` } }] },
                  Score: { select: { name: score } },
                  Comment: { rich_text: [{ text: { content: `Commentaire pour l'évaluation ${count}` } }] },
                  // Relations
                  Audit: { relation: [{ id: auditId }] },
                  Page: { relation: [{ id: pageId }] },
                  Exigence: { relation: [{ id: exigenceId }] }
                }
              }, apiKey);
              
              // Stocker l'ID pour les références futures
              if (!referenceIds.evaluations) referenceIds.evaluations = [];
              referenceIds.evaluations.push(response.id);
              
              evaluations.push(response.id);
              addLog(`✅ Évaluation créée: "Évaluation ${count}"`);
            } catch (error) {
              addLog(`❌ Erreur lors de la création de l'évaluation ${count}: ${error.message}`);
            }
          }
        }
        
        updateDatabaseStatus(evaluationsDbId, { 
          status: 'success', 
          recordCount: count
        });
      }
      
      setProgress(80);
      
      // 7. Créer des actions correctives (dépend des évaluations)
      addLog('Étape 7: Création des actions correctives');
      const actionsDbId = databases.find(db => db.name === 'actions')?.id;
      
      if (actionsDbId && referenceIds.evaluations?.length > 0) {
        updateDatabaseStatus(actionsDbId, { status: 'processing' });
        
        const actionCount = Math.min(3, referenceIds.evaluations.length);
        
        // Créer quelques actions pour certaines évaluations
        for (let i = 0; i < actionCount; i++) {
          const evaluationId = referenceIds.evaluations[i];
          const priorities = ["Faible", "Moyenne", "Haute", "Critique"];
          const priority = priorities[Math.floor(Math.random() * priorities.length)];
          
          try {
            const response = await notionApi.pages.create({
              parent: { database_id: actionsDbId },
              properties: {
                Name: { title: [{ text: { content: `Action corrective ${i+1}` } }] },
                TargetScore: { select: { name: "Conforme" } },
                Priority: { select: { name: priority } },
                DueDate: { date: { start: new Date(Date.now() + 1000*60*60*24*30).toISOString() } },
                Responsible: { rich_text: [{ text: { content: "John Doe" } }] },
                Status: { select: { name: "À faire" } },
                Comment: { rich_text: [{ text: { content: `Commentaire pour l'action corrective ${i+1}` } }] },
                // Relation avec l'évaluation
                Evaluation: { relation: [{ id: evaluationId }] }
              }
            }, apiKey);
            
            // Stocker l'ID pour les références futures
            if (!referenceIds.actions) referenceIds.actions = [];
            referenceIds.actions.push(response.id);
            
            addLog(`✅ Action corrective créée: "Action corrective ${i+1}"`);
          } catch (error) {
            addLog(`❌ Erreur lors de la création de l'action corrective ${i+1}: ${error.message}`);
          }
        }
        
        updateDatabaseStatus(actionsDbId, { 
          status: 'success', 
          recordCount: actionCount
        });
      }
      
      setProgress(90);
      
      // 8. Créer des progrès (dépend des actions)
      addLog('Étape 8: Création des progrès');
      const progressDbId = databases.find(db => db.name === 'progress')?.id;
      
      if (progressDbId && referenceIds.actions?.length > 0) {
        updateDatabaseStatus(progressDbId, { status: 'processing' });
        
        // Créer un progrès pour chaque action
        for (let i = 0; i < referenceIds.actions.length; i++) {
          const actionId = referenceIds.actions[i];
          const statuses = ["À faire", "En cours", "Terminée"];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          
          try {
            const response = await notionApi.pages.create({
              parent: { database_id: progressDbId },
              properties: {
                Name: { title: [{ text: { content: `Progrès ${i+1}` } }] },
                Date: { date: { start: new Date().toISOString() } },
                Responsible: { rich_text: [{ text: { content: "Jane Smith" } }] },
                Comment: { rich_text: [{ text: { content: `Mise à jour du progrès ${i+1}` } }] },
                Score: { select: { name: "Partiellement conforme" } },
                Status: { select: { name: status } },
                // Relation avec l'action
                Action: { relation: [{ id: actionId }] }
              }
            }, apiKey);
            
            addLog(`✅ Progrès créé: "Progrès ${i+1}"`);
          } catch (error) {
            addLog(`❌ Erreur lors de la création du progrès ${i+1}: ${error.message}`);
          }
        }
        
        updateDatabaseStatus(progressDbId, { 
          status: 'success', 
          recordCount: referenceIds.actions.length
        });
      }
      
      setProgress(95);
      
      // 9. Vérifier les relations et l'intégrité
      addLog('Étape 9: Vérification de l\'intégrité des données');
      setStep('verifying');
      
      // Vérifier que toutes les données ont été correctement créées
      const databasesWithErrors = databases.filter(db => db.status === 'error');
      
      if (databasesWithErrors.length > 0) {
        addLog(`⚠️ Des erreurs ont été rencontrées lors de la génération des données pour ${databasesWithErrors.length} bases`);
        setOverallStatus('error');
      } else if (databases.some(db => db.status !== 'success')) {
        addLog('⚠️ Certaines bases n\'ont pas été traitées correctement');
        setOverallStatus('error');
      } else {
        addLog('✅ Toutes les données ont été générées avec succès!');
        setOverallStatus('success');
      }
      
      setProgress(100);
      setStep('complete');
      
      // Récapitulatif des données générées
      addLog('--- Récapitulatif des données générées ---');
      for (const db of databases) {
        addLog(`${db.name}: ${db.recordCount} enregistrements (${db.status})`);
      }
      
      // Appeler le callback onComplete si fourni
      if (onComplete) {
        onComplete();
      }
      
      return true;
    } catch (error) {
      addLog(`❌ Erreur générale lors de la génération des données: ${error.message}`);
      setStep('error');
      setOverallStatus('error');
      
      toast.error('Erreur de génération', {
        description: error.message
      });
      
      return false;
    }
  };

  // Gérer le processus complet
  const handleGenerateData = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setLogs([]);
    setProgress(0);
    setOverallStatus('idle');
    
    try {
      // Forcer le mode réel pour ce test
      const wasMockActive = notionApi.mockMode.isActive();
      if (wasMockActive) {
        notionApi.mockMode.deactivate();
        addLog('🔄 Mode réel forcé pour la génération de données');
      }
      
      // Étape 1: Collecter les informations sur les bases de données
      const collectSuccessful = await collectDatabases();
      
      if (!collectSuccessful) {
        setIsGenerating(false);
        return;
      }
      
      // Étape 2: Générer les données
      await generateTestData();
      
      // Restaurer le mode mock si nécessaire
      if (wasMockActive) {
        notionApi.mockMode.activate();
        addLog('🔄 Mode mock restauré après la génération de données');
      }
    } catch (error) {
      toast.error('Erreur inattendue', {
        description: error.message
      });
      
      setStep('error');
      setOverallStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Générateur de données de test</h3>
        <Button
          onClick={handleGenerateData}
          disabled={isGenerating}
          variant={overallStatus === 'success' ? 'default' : overallStatus === 'error' ? 'destructive' : 'outline'}
          className="gap-2"
        >
          {isGenerating ? (
            <><RotateCw size={16} className="animate-spin" /> Génération en cours...</>
          ) : overallStatus === 'success' ? (
            <><Check size={16} /> Données générées</>
          ) : overallStatus === 'error' ? (
            <><XCircle size={16} /> Réessayer</>
          ) : (
            <><Database size={16} /> Générer des données de test</>
          )}
        </Button>
      </div>
      
      {step !== 'idle' && (
        <>
          <Progress value={progress} className="h-2" />
          
          <div className="text-sm text-gray-500">
            {step === 'collecting' && 'Collecte des informations...'}
            {step === 'generating' && 'Génération des données de test...'}
            {step === 'verifying' && 'Vérification de l\'intégrité des données...'}
            {step === 'complete' && `Génération terminée (${databases.filter(db => db.status === 'success').length}/${databases.length} bases de données)`}
            {step === 'error' && 'Une erreur est survenue lors de la génération des données'}
          </div>
          
          {databases.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">État des bases de données</h4>
              <div className="space-y-1">
                {databases.map(db => (
                  <div key={db.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {db.status === 'processing' ? (
                        <RotateCw size={14} className="text-blue-500 animate-spin" />
                      ) : db.status === 'success' ? (
                        <Check size={14} className="text-green-500" />
                      ) : db.status === 'error' ? (
                        <XCircle size={14} className="text-red-500" />
                      ) : (
                        <div className="w-3.5 h-3.5" />
                      )}
                      <span>{db.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {db.status === 'success' && `${db.recordCount} enregistrements`}
                      {db.status === 'error' && 'Erreur'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="logs">
              <AccordionTrigger className="text-sm">
                Journal d'exécution ({logs.length} entrées)
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 p-2 bg-slate-50 rounded text-xs font-mono h-60 overflow-y-auto">
                  {logs.map((log, i) => (
                    <div key={i} className="whitespace-pre-wrap mb-1">{log}</div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
      
      {step === 'idle' && (
        <div className="text-sm text-gray-500">
          Cet outil va générer des données de test dans toutes vos bases de données Notion configurées.
          Il va créer des projets, des pages, des checklists, des exigences, des audits, des évaluations,
          des actions correctives et des progrès, avec toutes les relations nécessaires entre ces entités.
        </div>
      )}
    </Card>
  );
};

export default NotionTestDataGenerator;
