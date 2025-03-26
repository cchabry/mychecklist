
# Nettoyage du code après migration

Après avoir effectué la migration depuis l'ancien système Notion vers la nouvelle architecture, vous pouvez utiliser le script de nettoyage inclus pour supprimer les fichiers obsolètes et identifier les imports qui doivent encore être mis à jour.

## Étapes du processus de nettoyage

1. **Exécution du script en mode simulation**
   ```bash
   node scripts/cleanup.js
   ```
   Ce mode par défaut n'effectue pas de suppressions réelles, mais montre ce qui serait fait.

2. **Examiner les résultats**
   Le script produira un rapport détaillant :
   - Les fichiers obsolètes qui seraient supprimés
   - Les imports obsolètes restants qui doivent être mis à jour

3. **Mettre à jour les imports**
   Utilisez les informations du rapport pour mettre à jour les imports selon les directives du guide de migration.

4. **Exécuter le script en mode réel**
   ```bash
   # Éditer d'abord le script pour définir dryRun: false
   nano scripts/cleanup.js
   # Puis exécuter
   node scripts/cleanup.js
   ```

## Important

- **Effectuez toujours un commit avant d'exécuter le script en mode réel** pour pouvoir revenir en arrière si nécessaire.
- Certains fichiers obsolètes peuvent encore être utilisés par d'autres parties du code. Le script identifiera ces dépendances pour vous permettre de les mettre à jour.
- Reportez-vous au guide de migration complet dans `src/services/notion/MIGRATION.md` pour plus de détails sur la façon de remplacer les composants et hooks obsolètes.

## Après le nettoyage

Une fois le nettoyage terminé, vous pouvez vérifier que tout fonctionne correctement :

1. Exécutez l'application localement
2. Testez les fonctionnalités clés en mode réel et en mode démonstration
3. Vérifiez la console pour vous assurer qu'il n'y a pas d'erreurs liées à des imports manquants
