// netlify/functions/update-question-stats.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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
    const { questionId, isCorrect } = JSON.parse(event.body);
    
    if (!questionId || isCorrect === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'questionId and isCorrect are required' })
      };
    }

    const { getStore } = await import('@netlify/blobs');
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
      body: JSON.stringify({ error: 'Failed to update stats' })
    };
  }
};

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