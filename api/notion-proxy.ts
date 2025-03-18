
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers simplified to absolute minimum
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // OPTIONS - simplest possible handling
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extremely simple response - no processing
  return res.status(200).json({
    status: 'ok',
    message: 'Basic proxy response',
    method: req.method
  });
}
