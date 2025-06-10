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
    console.log('Full Context:', JSON.stringify(context, null, 2));
    console.log('Context site:', context.site);
    console.log('All env vars starting with NETLIFY:', 
      Object.entries(process.env)
        .filter(([key]) => key.startsWith('NETLIFY') || key.includes('SITE') || key.includes('TOKEN'))
        .reduce((acc, [key, val]) => ({ ...acc, [key]: val ? 'present' : 'missing' }), {})
    );
    
    const { getStore } = await import('@netlify/blobs');
    console.log('Successfully imported @netlify/blobs');
    
    // Check what environment variables are available
    const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID || process.env.SITE_NAME;
    const token = process.env.NETLIFY_AUTH_TOKEN || process.env.NETLIFY_API_TOKEN || process.env.BUILD_TOKEN;
    
    console.log('Available config:', { siteID, token: token ? 'present' : 'missing' });
    
    // Try to get the store
    let store;
    try {
      // First try: Just the store name (should work in Netlify Functions)
      store = getStore('trivia-stats');
      console.log('Got store instance with default config');
    } catch (err) {
      console.log('Default getStore failed:', err.message);
      
      // Second try: Pass configuration as second parameter
      if (siteID && token) {
        console.log('Trying with manual config');
        store = getStore('trivia-stats', {
          siteID: siteID,
          token: token
        });
      } else if (siteID) {
        // Try with just siteID
        console.log('Trying with just siteID');
        store = getStore('trivia-stats', {
          siteID: siteID
        });
      } else {
        throw new Error('Unable to configure Netlify Blobs - no site context available');
      }
    }
    
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

