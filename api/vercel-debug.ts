
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Configuration CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Pour OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Informations de débogage simples
  return res.status(200).json({
    status: 'ok',
    message: 'Vercel Debug Info',
    nodeVersion: process.version,
    timestamp: new Date().toISOString(),
    headers: req.headers,
    method: req.method
  });
}
