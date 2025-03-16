// utils/refreshToken.js
const axios = require('axios');
const User = require('../models/User');

async function refreshTokenIfNeeded(user) {
  // Check if we need to refresh the token
  // This is a simplified approach - in production, you would check token expiration
  try {
    // Try to use current token
    await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${user.microsoftAccessToken}`
      }
    });
    
    // Token is still valid
    return user;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token expired, need to refresh
      try {
        const tokenResponse = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          client_id: process.env.AZURE_CLIENT_ID,
          client_secret: process.env.AZURE_CLIENT_SECRET,
          refresh_token: user.microsoftRefreshToken,
          grant_type: 'refresh_token'
        });
        
        // Update user tokens
        user.microsoftAccessToken = tokenResponse.data.access_token;
        if (tokenResponse.data.refresh_token) {
          user.microsoftRefreshToken = tokenResponse.data.refresh_token;
        }
        
        await user.save();
        return user;
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        throw new Error('Failed to refresh Microsoft token');
      }
    } else {
      throw error;
    }
  }
}

module.exports = refreshTokenIfNeeded;
