// netlify/functions/update-question-stats.js
const fetch = require('node-fetch');

const BIN_ID = '6774d8a8e41b4d34e456e3c9';
const API_KEY = '$2a$10$7JQJgfH.E3kQwVkrBiWjXeRAIa1NwM4cE0xGsNpN9QKGzRpUdN6E6';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

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

    // Get current data
    const getResponse = await fetch(API_URL + '/latest', {
      headers: {
        'X-Access-Key': API_KEY
      }
    });
    
    let currentData = { questions: {}, totalPlayers: 0, totalGamesPlayed: 0 };
    
    if (getResponse.ok) {
      const responseData = await getResponse.json();
      currentData = responseData.record || currentData;
    }

    // Initialize if needed
    if (!currentData.questions) currentData.questions = {};
    if (!currentData.questions[questionId]) {
      currentData.questions[questionId] = { correct: 0, total: 0 };
    }

    // Update stats
    currentData.questions[questionId].total += 1;
    if (isCorrect) {
      currentData.questions[questionId].correct += 1;
    }

    // Save updated data
    const saveResponse = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': API_KEY
      },
      body: JSON.stringify(currentData)
    });
    
    if (!saveResponse.ok) {
      throw new Error('Failed to save data');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(currentData.questions[questionId])
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