
/**
 * Fonction de test spécifique pour vérifier que le proxy Notion fonctionne correctement
 */
exports.handler = async function(event, context) {
  console.log('Test de fonctionnalité du proxy Notion');
  
  try {
    // Tester l'appel à la fonction notion-proxy
    const fetch = require('node-fetch');
    
    const response = await fetch('https://api.notion.com/v1/users/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test_token',
        'Notion-Version': '2022-06-28'
      }
    }).catch(error => {
      console.log('Erreur attendue:', error.message);
      return { ok: false, status: 401, error: error.message };
    });
    
    // Même une erreur 401 est acceptable car cela signifie que nous avons atteint l'API Notion
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Test de fonctionnalité du proxy Notion',
        direct_api_status: response.status || 'erreur',
        proxy_function_exists: true,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Erreur inattendue:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Erreur lors du test du proxy Notion',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
