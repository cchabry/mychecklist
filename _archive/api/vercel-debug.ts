
import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  // Collecter des informations utiles sur l'environnement Vercel
  const vercelInfo = {
    environment: process.env.VERCEL_ENV || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    url: process.env.VERCEL_URL || 'unknown',
    git: {
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
      commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || 'unknown',
      repoOwner: process.env.VERCEL_GIT_REPO_OWNER || 'unknown',
      repoSlug: process.env.VERCEL_GIT_REPO_SLUG || 'unknown'
    },
    timestamp: new Date().toISOString(),
    headers: request.headers,
    nodeVersion: process.version
  };

  response.status(200).json({
    status: 'ok',
    message: 'Vercel debug information',
    info: vercelInfo
  });
}
