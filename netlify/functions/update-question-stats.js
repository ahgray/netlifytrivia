
// netlify/functions/update-question-stats.js
const fetch = require('node-fetch');

const STORAGE_ID = 'c5d6f8a9-3b2e-4d7f-9a1b-8c3e5f7d9b2a';
const API_URL = `https://api.jsonstorage.net/v1/json/${STORAGE_ID}`;

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

    // Fetch current data
    let data = { questions: {}, totalPlayers: 0, totalGamesPlayed: 0 };
    try {
      const getResponse = await fetch(API_URL);
      if (getResponse.ok) {
        data = await getResponse.json();
      }
    } catch (e) {
      // Use default data if fetch fails
    }

    // Initialize if needed
    if (!data.questions) data.questions = {};
    if (!data.questions[questionId]) {
      data.questions[questionId] = { correct: 0, total: 0 };
    }

    // Update stats
    data.questions[questionId].total += 1;
    if (isCorrect) {
      data.questions[questionId].correct += 1;
    }

    // Save updated data
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data.questions[questionId])
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
