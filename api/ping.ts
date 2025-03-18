
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  response.status(200).json({
    status: 'ok',
    message: 'Ping successful!',
    timestamp: new Date().toISOString(),
    serverInfo: {
      environment: process.env.NODE_ENV || 'unknown',
      region: process.env.VERCEL_REGION || 'unknown'
    }
  });
}
