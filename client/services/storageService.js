// storageService.js - Google Drive implementation
import { google } from 'googleapis';
import storageConfig from './config';

class StorageService {
  constructor() {
    this.initialized = false;
    this.drive = null;
    this.folderIdCache = new Map(); // Cache folder IDs to reduce API calls
  }

  // Initialize Google Drive client with service account
  async initialize() {
    if (this.initialized) return true;

    try {
      // Create JWT client for authentication
      const auth = new google.auth.JWT(
        storageConfig.googleDrive.serviceAccount.clientEmail,
        null,
        storageConfig.googleDrive.serviceAccount.privateKey.replace(/\\n/g, '\n'),
        storageConfig.googleDrive.serviceAccount.scopes
      );

      // Initialize the Drive API client
      this.drive = google.drive({
        version: 'v3',
        auth
      });

      this.initialized = true;
      console.log('Google Drive storage initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Drive:', error);
      throw error;
    }
  }

  // Get or create a folder, returning its ID
  async getOrCreateFolder(folderName, parentFolderId = null) {
    if (!this.initialized) await this.initialize();

    // Check cache first
    const cacheKey = parentFolderId ? `${parentFolderId}/${folderName}` : folderName;
    if (this.folderIdCache.has(cacheKey)) {
      return this.folderIdCache.get(cacheKey);
    }

    try {
      // Search for the folder
      const query = parentFolderId
        ? `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`
        : `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      // If folder exists, return its ID
      if (response.data.files.length > 0) {
        const folderId = response.data.files[0].id;
        this.folderIdCache.set(cacheKey, folderId);
        return folderId;
      }

      // If folder doesn't exist, create it
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : []
      };

      const folder = await this.drive.files.create({
        resource: folderMetadata,
        fields: 'id'
      });

      const folderId = folder.data.id;
      this.folderIdCache.set(cacheKey, folderId);
      return folderId;
    } catch (error) {
      console.error(`Error getting/creating folder '${folderName}':`, error);
      throw error;
    }
  }

  // Create a nested folder structure, returning the deepest folder ID
  async createFolderPath(folderPath) {
    if (!this.initialized) await this.initialize();

    const folders = folderPath.split('/').filter(folder => folder.trim() !== '');
    let parentId = null;

    for (const folder of folders) {
      parentId = await this.getOrCreateFolder(folder, parentId);
    }

    return parentId;
  }

  // Upload file to Google Drive
  async uploadFile(file, businessId, category = 'general') {
    if (!this.initialized) await this.initialize();

    try {
      // Create folder path for the business
      const businessFolderId = await this.getOrCreateFolder(`business_${businessId}`);
      
      // Create or get category subfolder
      const categoryFolderId = await this.getOrCreateFolder(category, businessFolderId);

      // Prepare file metadata
      const fileMetadata = {
        name: file.name,
        parents: [categoryFolderId]
      };

      // Convert file to buffer for upload
      const buffer = await this.fileToBuffer(file);

      // Upload file to Google Drive
      const media = {
        mimeType: file.type || 'application/octet-stream',
        body: buffer
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size, webViewLink, webContentLink'
      });

      return {
        success: true,
        fileInfo: response.data,
        storagePath: `business_${businessId}/${category}/${file.name}`,
        fileId: response.data.id
      };
    } catch (error) {
      console.error('Error uploading file to Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Download file from Google Drive by file ID
  async downloadFile(fileId) {
    if (!this.initialized) await this.initialize();

    try {
      // Get file metadata
      const fileResponse = await this.drive.files.get({
        fileId: fileId,
        fields: 'name, mimeType, size'
      });

      // Download file content
      const contentResponse = await this.drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, {
        responseType: 'arraybuffer'
      });

      // Convert to blob
      const blob = new Blob([contentResponse.data], { type: fileResponse.data.mimeType });
      blob.name = fileResponse.data.name;

      return {
        success: true,
        file: blob,
        fileInfo: fileResponse.data
      };
    } catch (error) {
      console.error('Error downloading file from Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // List files in a folder (business/category)
  async listFiles(businessId, category = 'general') {
    if (!this.initialized) await this.initialize();

    try {
      // Get business folder ID
      const businessFolderId = await this.getOrCreateFolder(`business_${businessId}`);
      
      // Get category folder ID
      const categoryFolderId = await this.getOrCreateFolder(category, businessFolderId);

      // Query files in the category folder
      const response = await this.drive.files.list({
        q: `'${categoryFolderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink)',
        spaces: 'drive'
      });

      return {
        success: true,
        files: response.data.files.map(file => ({
          id: file.id,
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
          createdAt: file.createdTime,
          modifiedAt: file.modifiedTime,
          viewUrl: file.webViewLink,
          downloadUrl: file.webContentLink
        }))
      };
    } catch (error) {
      console.error('Error listing files from Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file from Google Drive
  async deleteFile(fileId) {
    if (!this.initialized) await this.initialize();

    try {
      await this.drive.files.delete({
        fileId: fileId
      });

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting file from Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Create a shareable link for a file
  async createSharedLink(fileId, role = 'reader', type = 'anyone') {
    if (!this.initialized) await this.initialize();

    try {
      // Update file permissions
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: role,
          type: type
        }
      });

      // Get the file with link
      const file = await this.drive.files.get({
        fileId: fileId,
        fields: 'webViewLink'
      });

      return {
        success: true,
        url: file.data.webViewLink
      };
    } catch (error) {
      console.error('Error creating shared link in Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Convert File object to Buffer for upload
  async fileToBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const buffer = Buffer.from(arrayBuffer);
        resolve(buffer);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // Get folders within a business folder
  async listCategories(businessId) {
    if (!this.initialized) await this.initialize();

    try {
      // Get business folder ID
      const businessFolderId = await this.getOrCreateFolder(`business_${businessId}`);

      // Query folders in the business folder
      const response = await this.drive.files.list({
        q: `'${businessFolderId}' in parents and trashed=false and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
        spaces: 'drive'
      });

      return {
        success: true,
        categories: response.data.files.map(folder => ({
          id: folder.id,
          name: folder.name
        }))
      };
    } catch (error) {
      console.error('Error listing categories from Google Drive:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new StorageService();
