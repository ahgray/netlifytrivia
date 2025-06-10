// netlify/functions/get-question-stats.js
const fetch = require('node-fetch');

// Using jsonstorage.net - a free JSON storage service
// This creates a unique storage for your trivia game
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
    // Fetch current data
    const response = await fetch(API_URL);
    const data = await response.json();
    
    const stats = data.questions && data.questions[questionId] 
      ? data.questions[questionId] 
      : { correct: 0, total: 0 };

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
};
