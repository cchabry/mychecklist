
/**
 * Fonction simple pour tester la disponibilité des fonctions Netlify
 */
exports.handler = async function(event, context) {
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
      message: "Netlify Functions sont opérationnelles",
      timestamp: new Date().toISOString()
    })
  };
};
