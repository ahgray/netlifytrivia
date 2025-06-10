// netlify/functions/update-question-stats.mjs
import { getStore } from '@netlify/blobs';

export default async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (event.httpMethod !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { questionId, isCorrect } = JSON.parse(event.body);
    
    if (!questionId || isCorrect === undefined) {
      return new Response(
        JSON.stringify({ error: 'questionId and isCorrect are required' }),
        { 
          status: 400, 
          headers: { ...headers, 'Content-Type': 'application/json' }
        }
      );
    }

    const store = getStore('trivia-stats');
    
    // Get current stats
    const currentStats = await store.get(`question-${questionId}`, { type: 'json' }) || {
      correct: 0,
      total: 0
    };
    
    // Update stats
    currentStats.total += 1;
    if (isCorrect) {
      currentStats.correct += 1;
    }
    
    // Save updated stats
    await store.setJSON(`question-${questionId}`, currentStats);
    
    return new Response(
      JSON.stringify(currentStats),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update stats' }),
      { 
        status: 500, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }
}

// Updated package.json - make sure you have this dependency
/*
{
  "name": "trivia-game-netlify",
  "version": "1.0.0",
  "dependencies": {
    "@netlify/blobs": "^7.0.0"
  }
}
*/