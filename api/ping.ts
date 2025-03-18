
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Set simple CORS header
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Respond with a simple message
  return res.status(200).json({ message: 'pong' });
}
