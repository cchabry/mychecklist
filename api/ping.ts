
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Minimal CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Simplest possible response
  return res.status(200).json({
    status: 'ok',
    message: 'pong'
  });
}
