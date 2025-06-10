
// netlify/functions/get-question-stats.js
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
    const response = await fetch(API_URL + '/latest', {
      headers: {
        'X-Access-Key': API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const record = data.record || { questions: {} };
    
    const stats = record.questions && record.questions[questionId] 
      ? record.questions[questionId] 
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

