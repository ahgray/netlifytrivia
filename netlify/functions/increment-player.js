// netlify/functions/increment-player.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('trivia-stats');
    
    // Get current stats
    const currentStats = await store.get('global-stats', { type: 'json' }) || {
      totalPlayers: 0,
      totalGamesPlayed: 0
    };
    
    // Increment
    currentStats.totalPlayers += 1;
    currentStats.totalGamesPlayed += 1;
    
    // Save updated stats
    await store.setJSON('global-stats', currentStats);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(currentStats)
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to increment player count' })
    };
  }
};

