// netlify/functions/increment-player.js
const fetch = require('node-fetch');

const BIN_ID = '6774d8a8e41b4d34e456e3c9';
const API_KEY = '$2a$10$7JQJgfH.E3kQwVkrBiWjXeRAIa1NwM4cE0xGsNpN9QKGzRpUdN6E6';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

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
    
    // Increment
    currentData.totalPlayers = (currentData.totalPlayers || 0) + 1;
    currentData.totalGamesPlayed = (currentData.totalGamesPlayed || 0) + 1;
    
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
      body: JSON.stringify({ 
        totalPlayers: currentData.totalPlayers,
        totalGamesPlayed: currentData.totalGamesPlayed 
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
