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
    console.log('Starting increment-player function');
    
    const { getStore } = await import('@netlify/blobs');
    console.log('Successfully imported @netlify/blobs');
    
    const store = getStore('trivia-stats');
    console.log('Got store instance');
    
    // Get current stats
    const currentStats = await store.get('global-stats', { type: 'json' }) || {
      totalPlayers: 0,
      totalGamesPlayed: 0
    };
    console.log('Current stats:', currentStats);
    
    // Increment
    currentStats.totalPlayers += 1;
    currentStats.totalGamesPlayed += 1;
    console.log('Updated stats:', currentStats);
    
    // Save updated stats
    await store.setJSON('global-stats', currentStats);
    console.log('Successfully saved stats');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(currentStats)
    };
  } catch (error) {
    console.error('Detailed error in increment-player:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to increment player count',
        details: error.message,
        type: error.name
      })
    };
  }
};

