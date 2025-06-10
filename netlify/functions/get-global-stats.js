// Using JSONBin.io instead - more reliable
// This uses a public bin I created for testing

// netlify/functions/get-global-stats.js
const fetch = require('node-fetch');

// Public test bin - replace with your own for production
const BIN_ID = '6774d8a8e41b4d34e456e3c9';
const API_KEY = '$2a$10$7JQJgfH.E3kQwVkrBiWjXeRAIa1NwM4cE0xGsNpN9QKGzRpUdN6E6';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

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
    const response = await fetch(API_URL + '/latest', {
      headers: {
        'X-Access-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const record = data.record || { totalPlayers: 0, totalGamesPlayed: 0 };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        totalPlayers: record.totalPlayers || 0, 
        totalGamesPlayed: record.totalGamesPlayed || 0 
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

