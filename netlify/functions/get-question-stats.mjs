// netlify/functions/get-question-stats.mjs
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

  if (event.httpMethod !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }

  const { questionId } = event.queryStringParameters || {};
  
  if (!questionId) {
    return new Response(
      JSON.stringify({ error: 'questionId is required' }),
      { 
        status: 400, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const store = getStore('trivia-stats');
    
    const stats = await store.get(`question-${questionId}`, { type: 'json' }) || {
      correct: 0,
      total: 0
    };
    
    return new Response(
      JSON.stringify(stats),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ correct: 0, total: 0 }),
      { 
        status: 200, 
        headers: { ...headers, 'Content-Type': 'application/json' }
      }
    );
  }
}