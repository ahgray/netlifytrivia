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
    const { getStore } = require('@netlify/blobs');
    const store = getStore('trivia-stats');
    
    const globalStats = await store.get('global-stats');
    
    if (!globalStats) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ totalPlayers: 0, totalGamesPlayed: 0 })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: globalStats
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get global stats' })
    };
  }
};