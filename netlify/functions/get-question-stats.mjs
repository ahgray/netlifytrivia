// netlify/functions/get-question-stats.mjs
import { getStore } from '@netlify/blobs';

export default async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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

  const { questionId } = event.queryStringParameters || {};
  
  if (!questionId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'questionId is required' })
    };
  }

  try {
    const store = getStore('trivia-stats');
    
    const stats = await store.get(`question-${questionId}`, { type: 'json' }) || {
      correct: 0,
      total: 0
    };
    
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
      body: JSON.stringify({ correct: 0, total: 0 })
    };
  }
}