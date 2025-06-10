// netlify/functions/increment-player.js
import { getStore } from '@netlify/blobs';

export default async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Debug logging to see the event structure
  console.log('Event object:', JSON.stringify(event, null, 2));
  console.log('HTTP Method:', event.httpMethod);
  console.log('Request method:', event.requestContext?.http?.method);

  const method = event.httpMethod || event.requestContext?.http?.method;
  console.log('Detected method:', method);

  if (method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (method !== 'POST') {
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed',
        receivedMethod: method,
        eventKeys: Object.keys(event)
      }),
      { 
        status: 405, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('Starting increment-player function');
    
    // Get the store - should work automatically with ES module default export
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
    
    return new Response(
      JSON.stringify(currentStats),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Detailed error in increment-player:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to increment player count',
        details: error.message,
        type: error.name
      }),
      { 
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }
};

