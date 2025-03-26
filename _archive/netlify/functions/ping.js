
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      status: 'ok',
      message: 'Ping successful from Netlify Function!',
      timestamp: new Date().toISOString(),
      serverInfo: {
        environment: process.env.NODE_ENV || 'unknown',
        region: process.env.AWS_REGION || 'unknown'
      }
    })
  };
};
