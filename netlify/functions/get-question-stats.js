// netlify/functions/get-question-stats.js
exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET
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
    // Using Netlify Blobs (free built-in storage)
    const { getStore } = require('@netlify/blobs');
    const store = getStore('trivia-stats');
    
    const stats = await store.get(questionId);
    
    if (!stats) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ correct: 0, total: 0 })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: stats
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to get stats' })
    };
  }
};