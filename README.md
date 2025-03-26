
# MyChecklist - Audit de projets avec Notion

Ce projet utilise Vercel pour déployer une fonction serverless qui sert de proxy pour l'API Notion, permettant de contourner les limitations CORS du navigateur.

## Déploiement sur Vercel

### Prérequis
1. Un compte [GitHub](https://github.com)
2. Un compte [Vercel](https://vercel.com)

### Étapes de déploiement rapide

1. **Déployer directement sur Vercel**
   - Forker ce dépôt sur GitHub
   - Connecter votre compte Vercel
   - Importer le dépôt GitHub dans Vercel
   - Vercel détectera automatiquement la configuration et déploiera le projet

2. **Configuration spécifique (si nécessaire)**
   - Framework preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables: Aucune requise

3. **Vérifier le déploiement**
   - Après le déploiement réussi, vous pourrez accéder à votre application à l'URL fournie par Vercel
   - Testez le proxy Notion en utilisant l'endpoint `/api/ping`

## Dépannage des déploiements Vercel

Si le déploiement échoue, vérifiez ces points courants:

1. **Problèmes de build**
   - Vérifiez les logs de build dans l'interface Vercel
   - Assurez-vous que toutes les dépendances sont correctement installées

2. **Problèmes de fonctions serverless**
   - Vérifiez que le fichier `vercel.json` est correctement configuré 
   - Utilisez des `rewrites` au lieu de `routes` pour éviter les conflits de configuration
   - Les redirections API devraient pointer vers les fichiers .ts corrects

3. **Problèmes CORS**
   - Les en-têtes CORS sont configurés dans `vercel.json`
   - Testez l'endpoint `/api/ping` pour vérifier l'accès au serveur

4. **Redéploiement**
   - Parfois, un simple redéploiement résout les problèmes temporaires
   - Utilisez l'option "Redeploy" dans le tableau de bord Vercel

## Structure du projet

- `/api` - Fonctions serverless Vercel
- `/src` - Code source de l'application
  - `/lib/notionProxy` - Utilitaires pour communiquer avec l'API Notion via le proxy
  - `/components` - Composants React réutilisables

## Notes importantes
- Les fonctions serverless Vercel ont une limite de 10 secondes d'exécution dans le plan gratuit (étendue à 30s dans notre configuration).
- Si vous rencontrez des problèmes, vérifiez les logs dans le dashboard Vercel.
- Le déploiement de ce projet utilise des `rewrites` au lieu de `routes` pour assurer la compatibilité avec les nouvelles versions de Vercel.
