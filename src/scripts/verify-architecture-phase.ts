#!/usr/bin/env node

/**
* Script de vérification des phases d'architecture
* 
* Ce script vérifie si une phase du plan d'alignement architectural
* est complètement terminée selon les indicateurs de succès définis.
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
