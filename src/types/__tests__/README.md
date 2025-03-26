
# Tests de Type

Ce dossier contient des tests de type pour vérifier que nos interfaces principales sont correctement définies.

## Comment exécuter les tests de type

1. Ajoutez le script suivant dans votre package.json:
```json
"scripts": {
  "test:types": "tsc --project src/types/__tests__/tsconfig.test.json --noEmit"
}
```

2. Exécutez le test avec la commande:
```bash
npm run test:types
```

## Comprendre les résultats

- Si le test compile sans erreur, tous les types sont corrects
- En cas d'erreur, le compilateur TypeScript affichera les problèmes détectés

## Importance des tests de type

Ces tests permettent de:
- Vérifier que les interfaces respectent leur définition attendue
- Détecter les incohérences entre les types liés
- S'assurer que les modifications préservent la compatibilité de type
- Servir de documentation sur l'utilisation attendue des types

## Maintenance

Pensez à mettre à jour ces tests lorsque vous modifiez les interfaces du domaine.
