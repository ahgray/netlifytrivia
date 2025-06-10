// netlify/functions/increment-player.js
const fetch = require('node-fetch');

const STORAGE_ID = 'c5d6f8a9-3b2e-4d7f-9a1b-8c3e5f7d9b2a';
const API_URL = `https://api.jsonstorage.net/v1/json/${STORAGE_ID}`;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
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

    // Increment
    data.totalPlayers = (data.totalPlayers || 0) + 1;
    data.totalGamesPlayed = (data.totalGamesPlayed || 0) + 1;
    
    // Save updated data
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        totalPlayers: data.totalPlayers,
        totalGamesPlayed: data.totalGamesPlayed 
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to increment player count' })
    };
  }
};

// Updated package.json - add node-fetch
/*
{
  "name": "trivia-game-netlify",
  "version": "1.0.0",
  "description": "Trivia game with global stats using Netlify Functions",
  "dependencies": {
    "node-fetch": "^2.6.7"
  }
}
*/