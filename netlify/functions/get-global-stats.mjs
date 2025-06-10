// Using Netlify's built-in Blobs storage - no external services needed!
// This is the simplest solution since you're already on Netlify

// netlify/functions/get-global-stats.js
import { getStore } from '@netlify/blobs';

export default async function handler(event, context) {
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
    console.log('Starting get-global-stats function');
    
    const store = getStore('trivia-stats');
    console.log('Got store instance');
    
    const statsBlob = await store.get('global-stats', { type: 'json' });
    console.log('Retrieved statsBlob:', statsBlob);
    
    const stats = statsBlob || { totalPlayers: 0, totalGamesPlayed: 0 };
    console.log('Final stats:', stats);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(stats)
    };
  } catch (error) {
    console.error('Detailed error in get-global-stats:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ totalPlayers: 0, totalGamesPlayed: 0 })
    };
  }
};

