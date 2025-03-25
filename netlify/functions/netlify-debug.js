
/**
 * Fonction de diagnostic pour Netlify
 * Renvoie des informations utiles sur l'environnement Netlify
 */
exports.handler = async function(event, context) {
  // Récupérer les informations sur l'environnement
  const environment = {
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV || 'non défini',
    netlifyContext: process.env.CONTEXT || 'non défini',
    netlifyBranch: process.env.BRANCH || 'non défini',
    netlifyBuildId: process.env.BUILD_ID || 'non défini',
    isLocal: process.env.NETLIFY_LOCAL === 'true',
    functionName: context.functionName,
    functionVersion: context.functionVersion,
    region: context.region || 'non définie',
    memoryLimit: context.memoryLimitInMB,
    timeRemaining: context.getRemainingTimeInMillis ? 
      `${context.getRemainingTimeInMillis()}ms` : 
      'non disponible',
    event: {
      path: event.path,
      httpMethod: event.httpMethod,
      headers: event.headers,
      queryStringParameters: event.queryStringParameters,
      hasBody: !!event.body
    }
  };
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    },
    body: JSON.stringify({
      status: "ok",
      message: "Diagnostic Netlify",
      environment,
      timestamp: new Date().toISOString()
    })
  };
};
