
exports.handler = async (event, context) => {
  // Collecter des informations utiles sur l'environnement Netlify
  const netlifyInfo = {
    environment: process.env.NODE_ENV || 'unknown',
    netlifyContext: process.env.CONTEXT || 'unknown',
    deployURL: process.env.DEPLOY_URL || 'unknown',
    deployPrimeBranch: process.env.DEPLOY_PRIME_URL || 'unknown',
    site: process.env.SITE_NAME || 'unknown',
    timestamp: new Date().toISOString(),
    headers: event.headers,
    nodeVersion: process.version
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: 'ok',
      message: 'Netlify debug information',
      info: netlifyInfo
    })
  };
};
