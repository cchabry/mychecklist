
# Checklist pour la vérification des types en TypeScript

Ce document fournit une liste de contrôles à effectuer lors des revues de code pour garantir que les définitions de types sont correctement utilisées dans l'application.

## ✅ Points généraux

- [ ] Les types sont-ils correctement définis et exportés ?
- [ ] Les imports de types sont-ils organisés et distincts des imports de valeurs ?
- [ ] Les interfaces et types sont-ils documentés avec des commentaires JSDoc ?
- [ ] Les enums utilisés sont-ils conformes aux définitions existantes ?
- [ ] Les types union et intersection sont-ils utilisés à bon escient ?

## ✅ Types du domaine

- [ ] Les types correspondent-ils aux entités du domaine métier ?
- [ ] Les relations entre entités sont-elles correctement représentées ?
- [ ] Les identifiants (`id`) et clés étrangères (`projectId`, etc.) sont-ils typés comme `string` ?
- [ ] Les champs obligatoires vs optionnels sont-ils correctement définis ?
- [ ] Les dates sont-elles typées comme `string` (format ISO) pour la sérialisation ?

## ✅ Vérifications spécifiques au projet

- [ ] Les valeurs d'énumération utilisées sont-elles conformes à `ImportanceLevel`, `ComplianceLevel`, `StatusType`, etc. ?
- [ ] Les objets d'évaluation (`Evaluation`) incluent-ils tous les champs requis ?
- [ ] Les actions correctives (`CorrectiveAction`) sont-elles correctement typées ?
- [ ] Les propriétés d'UI comme `progress` sont-elles typées comme `number` ?
- [ ] Les tableaux (comme `reference`, `profil`, `phase`) sont-ils correctement typés ?

## ✅ API et intégration Notion

- [ ] Les options de configuration de l'API sont-elles conformes à `NotionAPIOptions` ?
- [ ] Les réponses d'API suivent-elles le format `NotionAPIResponse<T>` ?
- [ ] Les requêtes API incluent-elles les types corrects pour les paramètres ?
- [ ] Les mappings entre objets Notion et objets du domaine sont-ils typés ?
- [ ] Les erreurs Notion sont-elles correctement typées ?

## ✅ Hooks et composants React

- [ ] Les props des composants sont-elles correctement typées ?
- [ ] Les hooks personnalisés retournent-ils des types cohérents ?
- [ ] Les états React (`useState`) ont-ils des types explicites ?
- [ ] Les événements sont-ils correctement typés (ex: `React.MouseEvent`, `React.FormEvent`) ?
- [ ] Les refs utilisent-elles `React.RefObject<T>` avec le bon type `T` ?

## ✅ Techniques de tests de type

- [ ] Des tests de type existent-ils pour les interfaces principales ?
- [ ] La fonction `assertType<T>` est-elle utilisée pour vérifier l'assignabilité ?
- [ ] Les tests incluent-ils des cas pour les propriétés obligatoires et optionnelles ?
- [ ] Les tests vérifient-ils les relations entre types ?
- [ ] Les erreurs attendues sont-elles annotées avec `@ts-expect-error` ?

## ✅ Bonnes pratiques

- [ ] Aucun `any` non justifié dans le code ?
- [ ] Préférence pour les interfaces plutôt que les types quand approprié ?
- [ ] Les types génériques sont-ils utilisés correctement ?
- [ ] Les types d'utilité (`Omit<>`, `Pick<>`, `Partial<>`, etc.) sont-ils utilisés lorsque pertinent ?
- [ ] Les types index signatures (`[key: string]: any`) sont-ils évités ou justifiés ?

## Processus de vérification

1. Exécuter `npm run test:types` pour vérifier que tous les tests de type passent
2. En cas d'erreur, utiliser l'utilitaire `src/utils/type-test-runner.ts` pour obtenir des détails
3. Vérifier la cohérence avec les types existants dans `src/types/domain/`
4. S'assurer que les modifications n'introduisent pas de régression de type

## Ressources utiles

- [Documentation TypeScript officielle](https://www.typescriptlang.org/docs/)
- [Guide des bonnes pratiques TypeScript](https://google.github.io/styleguide/tsguide.html)
- [Utility Types in TypeScript](https://www.typescriptlang.org/docs/handbook/utility-types.html)

