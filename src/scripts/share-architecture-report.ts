#!/usr/bin/env node

/**
* Script de partage du rapport d'architecture
* 
* Ce script permet de partager le rapport d'architecture
* via différents canaux (email, serveur, etc.).
*/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
