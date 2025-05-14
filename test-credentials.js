require('dotenv').config();
const axios = require('axios');

// Log credentials (safely)
const apiKey = process.env.PHAXIOKEY;
const apiSecret = process.env.PHAXIOSECRET;

console.log('Testing Phaxio credentials:');
console.log(`API Key: ${apiKey ? apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4) : 'not set'}`);
console.log(`API Secret: ${apiSecret ? apiSecret.substring(0, 4) + '...' + apiSecret.substring(apiSecret.length - 4) : 'not set'}`);

// Test credentials by checking account status
async function testCredentials() {
  try {
    const response = await axios({
      method: 'get',
      url: 'https://api.phaxio.com/v2.1/account',
      auth: {
        username: apiKey,
        password: apiSecret
      }
    });
    
    console.log('\nSuccess! Your Phaxio credentials are valid.');
    console.log('Account status:', response.data);
    return true;
  } catch (error) {
    console.error('\nError testing credentials:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

testCredentials();
