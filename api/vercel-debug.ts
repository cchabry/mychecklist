
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Minimal CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Simple response with no environment variables or complex logic
  return res.status(200).json({
    status: 'ok',
    message: 'Debug info',
    timestamp: new Date().toISOString()
  });
}
