#!/usr/bin/env node

/**
* Script de configuration du hook pre-commit
* 
* Ce script installe un hook Git pre-commit qui vérifie
* la conformité architecturale avant chaque commit.
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HOOK_FILE = '.git/hooks/pre-commit';
const HOOK_CONTENT = `#!/bin/sh
echo "Vérification de l'architecture en cours..."
npx ts-node --transpile-only src/scripts/quick-architecture-check.ts

if [ $? -ne 0 ]; then
  echo "❌ L'architecture n'est pas conforme. Veuillez corriger les erreurs avant de commiter."
  exit 1
fi

echo "✅ L'architecture est conforme. Vous pouvez commiter en toute sécurité."
exit 0
`;

function setupPreCommitHook() {
  if (fs.existsSync(HOOK_FILE)) {
    console.log('Un hook pre-commit existe déjà. Il sera remplacé.');
  }

  fs.writeFileSync(HOOK_FILE, HOOK_CONTENT, { mode: 0o755 });
  console.log('Hook pre-commit installé avec succès.');
}

setupPreCommitHook();
