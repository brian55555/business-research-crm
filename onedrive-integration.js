// services/oneDriveService.js
const axios = require('axios');
const User = require('../models/User');
const refreshTokenIfNeeded = require('../utils/refreshToken');

class OneDriveService {
  constructor(user) {
    this.user = user;
    this.baseUrl = 'https://graph.microsoft.com/v1.0';
  }

  async getHeaders() {
    // Make sure we have a valid token
    const user = await refreshTokenIfNeeded(this.user);
    
    return {
      'Authorization': `Bearer ${user.microsoftAccessToken}`,
      'Content-Type': 'application/json'
    };
  }

  // Create a folder in OneDrive (if it doesn't exist)
  async ensureFolder(folderName, parentFolder = 'root') {
    try {
      const headers = await this.getHeaders();
      
      // Check if folder exists
      try {
        const response = await axios.get(
          `${this.baseUrl}/me/drive/${parentFolder === 'root' ? 'root' : `items/${parentFolder}`}/children?$filter=name eq '${folderName}' and folder ne null`,
          { headers }
        );
        
        if (response.data.value && response.data.value.length > 0) {
          return response.data.value[0];
        }
      } catch (error) {
        console.log('Folder not found, creating new one');
      }
      
      // Create folder if it doesn't exist
      const response = await axios.post(
        `${this.baseUrl}/me/drive/${parentFolder === 'root' ? 'root' : `items/${parentFolder}`}/children`,
        {
          name: folderName,
          folder: {},
          "@microsoft.graph.conflictBehavior": "rename"
        },
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error in ensureFolder:', error.response ? error.response.data : error.message);
      throw new Error('Failed to create folder in OneDrive');
    }
  }

  // Create a business folder with subfolders
  async setupBusinessFolders(businessName, businessId) {
    try {
      // Create main business folder
      const businessFolder = await this.ensureFolder(`Business - ${businessName}`);
      
      // Create subfolders
      const notesFolderPromise = this.ensureFolder('Notes', businessFolder.id);
      const documentsFolderPromise = this.ensureFolder('Documents', businessFolder.id);
      const newsFolderPromise = this.ensureFolder('News Articles', businessFolder.id);
      const meetingsFolderPromise = this.ensureFolder('Meeting Notes', businessFolder.id);
      
      const [notesFolder, documentsFolder, newsFolder, meetingsFolder] = 
        await Promise.all([notesFolderPromise, documentsFolderPromise, newsFolderPromise, meetingsFolderPromise]);
      
      return {
        businessFolder,
        notesFolder,
        documentsFolder,
        newsFolder,
        meetingsFolder
      };
    } catch (error) {
      console.error('Error in setupBusinessFolders:', error);
      throw new Error('Failed to set up business folders in OneDrive');
    }
  }

  // Create a text file in OneDrive
  async createTextFile(content, fileName, folderId) {
    try {
      const headers = await this.getHeaders();
      
      // Convert content to base64
      const base64Content = Buffer.from(content).toString('base64');
      
      const response = await axios.put(
        `${this.baseUrl}/me/drive/items/${folderId}:/${fileName}.txt:/content`,
        base64Content,
        { 
          headers: {
            ...headers,
            'Content-Type': 'text/plain'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error in createTextFile:', error.response ? error.response.data : error.message);
      throw new Error('Failed to create text file in OneDrive');
    }
  }

  // Upload note to OneDrive
  async uploadNote(note, businessName) {
    try {
      // Ensure folders exist
      const businessFolder = await this.ensureFolder(`Business - ${businessName}`);
      const notesFolder = await this.ensureFolder('Notes', businessFolder.id);
      
      // Format note content
      const noteContent = `# ${note.title}\n\n${note.content}\n\nTags: ${note.tags.join(', ')}\nCreated: ${note.createdAt.toISOString()}\nUpdated: ${note.updatedAt.toISOString()}`;
      
      // Create file
      const file = await this.createTextFile(
        noteContent,
        `${note.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}`,
        notesFolder.id
      );
      
      return {
        oneDriveId: file.id,
        oneDriveUrl: file.webUrl
      };
    } catch (error) {
      console.error('Error in uploadNote:', error);
      throw new Error('Failed to upload note to OneDrive');
    }
  }

  // Upload file to OneDrive
  async uploadFile(fileBuffer, fileName, businessName, folderType = 'Documents') {
    try {
      // Ensure folders exist
      const businessFolder = await this.ensureFolder(`Business - ${businessName}`);
      const targetFolder = await this.ensureFolder(folderType, businessFolder.id);
      
      const headers = await this.getHeaders();
      
      // Upload file
      const response = await axios.put(
        `${this.baseUrl}/me/drive/items/${targetFolder.id}:/${fileName}:/content`,
        fileBuffer,
        { 
          headers: {
            ...headers,
            'Content-Type': 'application/octet-stream'
          }
        }
      );
      
      return {
        oneDriveId: response.data.id,
        oneDriveUrl: response.data.webUrl
      };
    } catch (error) {
      console.error('Error in uploadFile:', error.response ? error.response.data : error.message);
      throw new Error('Failed to upload file to OneDrive');
    }
  }

  // Get file content
  async getFileContent(fileId) {
    try {
      const headers = await this.getHeaders();
      
      const response = await axios.get(
        `${this.baseUrl}/me/drive/items/${fileId}/content`,
        { 
          headers,
          responseType: 'arraybuffer'
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error in getFileContent:', error.response ? error.response.data : error.message);
      throw new Error('Failed to get file content from OneDrive');
    }
  }

  // Delete file
  async deleteFile(fileId) {
    try {
      const headers = await this.getHeaders();
      
      await axios.delete(
        `${this.baseUrl}/me/drive/items/${fileId}`,
        { headers }
      );
      
      return true;
    } catch (error) {
      console.error('Error in deleteFile:', error.response ? error.response.data : error.message);
      throw new Error('Failed to delete file from OneDrive');
    }
  }
}

module.exports = OneDriveService;

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
