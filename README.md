
# Audit Projet Vercel

Ce projet utilise Vercel pour déployer une fonction serverless qui sert de proxy pour l'API Notion, permettant de contourner les limitations CORS du navigateur.

## Déploiement sur Vercel

### Prérequis
1. Un compte [GitHub](https://github.com)
2. Un compte [Vercel](https://vercel.com)

### Étapes de déploiement

1. **Créer un dépôt GitHub**
   - Créer un nouveau dépôt sur GitHub
   - Cloner le dépôt localement
   - Copier tous les fichiers de ce projet dans le dépôt local
   - Commiter et pousser les changements vers GitHub

2. **Déployer sur Vercel**
   - Se connecter à [Vercel](https://vercel.com)
   - Cliquer sur "Add New..." puis "Project"
   - Sélectionner le dépôt GitHub contenant votre projet
   - Dans les paramètres de déploiement:
     - Framework Preset: Autre
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Cliquer sur "Deploy"

3. **Configurer le frontend**
   - Après le déploiement, Vercel vous fournira une URL (exemple: `https://votre-projet.vercel.app`)
   - Ouvrez le fichier `src/lib/notionProxy.ts`
   - Remplacez la ligne `const VERCEL_PROXY_URL = '/api/notion-proxy';` par:
     ```javascript
     const VERCEL_PROXY_URL = 'https://votre-projet.vercel.app/api/notion-proxy';
     ```
   - Commiter et pousser ces changements vers GitHub pour déclencher un nouveau déploiement

4. **Tester l'intégration**
   - Une fois déployé, configurez la connexion Notion dans l'application
   - L'application devrait maintenant pouvoir communiquer avec l'API Notion via le proxy Vercel

## Notes importantes
- Les fonctions serverless Vercel ont une limite de 10 secondes d'exécution dans le plan gratuit.
- Si vous rencontrez des problèmes, vérifiez les logs dans le dashboard Vercel.
