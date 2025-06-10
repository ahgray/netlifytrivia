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

    const { getStore } = require('@netlify/blobs');
    const store = getStore('trivia-stats');
    
    // Get current stats
    const currentStatsJson = await store.get(questionId);
    const currentStats = currentStatsJson 
      ? JSON.parse(currentStatsJson)
      : { correct: 0, total: 0 };
    
    // Update stats
    currentStats.total += 1;
    if (isCorrect) {
      currentStats.correct += 1;
    }
    
    // Save updated stats
    await store.set(questionId, JSON.stringify(currentStats));
    
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