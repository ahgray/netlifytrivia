// Using Netlify's built-in Blobs storage - no external services needed!
// This is the simplest solution since you're already on Netlify

// netlify/functions/get-global-stats.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('trivia-stats');
    
    const statsBlob = await store.get('global-stats', { type: 'json' });
    
    const stats = statsBlob || { totalPlayers: 0, totalGamesPlayed: 0 };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ totalPlayers: 0, totalGamesPlayed: 0 })
    };
  }
};

