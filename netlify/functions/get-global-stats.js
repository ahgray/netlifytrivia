
// netlify/functions/get-global-stats.js
const fetch = require('node-fetch');

const STORAGE_ID = 'c5d6f8a9-3b2e-4d7f-9a1b-8c3e5f7d9b2a';
const API_URL = `https://api.jsonstorage.net/v1/json/${STORAGE_ID}`;

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
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

  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        totalPlayers: data.totalPlayers || 0, 
        totalGamesPlayed: data.totalGamesPlayed || 0 
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ totalPlayers: 0, totalGamesPlayed: 0 })
    };
  }
};

