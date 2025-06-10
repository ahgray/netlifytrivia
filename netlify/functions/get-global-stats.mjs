// Using Netlify's built-in Blobs storage - no external services needed!
// This is the simplest solution since you're already on Netlify

// netlify/functions/get-global-stats.mjs
import { getStore } from '@netlify/blobs';

export default async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (event.httpMethod !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('Starting get-global-stats function');
    
    const store = getStore('trivia-stats');
    console.log('Got store instance');
    
    const statsBlob = await store.get('global-stats', { type: 'json' });
    console.log('Retrieved statsBlob:', statsBlob);
    
    const stats = statsBlob || { totalPlayers: 0, totalGamesPlayed: 0 };
    console.log('Final stats:', stats);
    
    return new Response(
      JSON.stringify(stats),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Detailed error in get-global-stats:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return new Response(
      JSON.stringify({ totalPlayers: 0, totalGamesPlayed: 0 }),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }
};

