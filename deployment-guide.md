# Business Research CRM - Deployment Guide

This document provides detailed instructions on how to deploy the Business Research CRM with OneDrive integration for cloud storage.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Setting Up Microsoft Azure App Registration](#setting-up-microsoft-azure-app-registration)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Running the Application](#running-the-application)
8. [Troubleshooting](#troubleshooting)

## System Requirements

### Backend
- Node.js 14.x or higher
- MongoDB 4.4 or higher
- npm or yarn package manager

### Frontend
- Node.js 14.x or higher
- npm or yarn package manager
- Modern web browser

### Infrastructure
- MongoDB Atlas or a self-hosted MongoDB instance
- Web server with HTTPS support (recommended for production)
- Microsoft Azure account for OneDrive integration

## Setting Up Microsoft Azure App Registration

To enable OneDrive integration, you need to register your application with Microsoft Azure:

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "App Registrations" and click "New registration"
3. Enter a name for your application (e.g., "Business Research CRM")
4. Select "Accounts in any organizational directory and personal Microsoft accounts"
5. Set the Redirect URI to `https://your-backend-url.com/api/auth/microsoft/callback`
6. Click "Register"
7. Note down the Application (client) ID and Directory (tenant) ID
8. Navigate to "Certificates & secrets", click "New client secret"
9. Create a new client secret, note down the value (it will only be shown once)
10. Navigate to "API permissions" and add the following permissions:
    - Microsoft Graph -> Files.ReadWrite.All
    - Microsoft Graph -> User.Read
    - Microsoft Graph -> offline_access
11. Click "Grant admin consent" for these permissions

## Backend Deployment

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/business-research-crm.git
cd business-research-crm/server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the required environment variables (see [Environment Variables](#environment-variables) section)

4. Start the development server:
```bash
npm run dev
```

### Production Deployment

#### Option 1: Traditional Server

1. Clone the repository on your server
2. Install dependencies: `npm install --production`
3. Build the application: `npm run build`
4. Set up environment variables
5. Start the server: `npm start`

#### Option 2: Docker Deployment

1. Build the Docker image:
```bash
docker build -t business-crm-backend .
```

2. Run the container:
```bash
docker run -p 5000:5000 --env-file .env business-crm-backend
```

#### Option 3: Cloud Platforms

The backend can be deployed to various cloud platforms:

- **Heroku**:
  ```bash
  heroku create
  git push heroku main
  ```
  
- **AWS Elastic Beanstalk**:
  ```bash
  eb init
  eb create production
  ```

- **Digital Ocean App Platform**:
  - Connect your GitHub repository
  - Select Node.js environment
  - Configure environment variables

## Frontend Deployment

### Local Development

1. Navigate to the client directory:
```bash
cd ../client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the required environment variables

4. Start the development server:
```bash
npm start
```

### Production Deployment

1. Build the production bundle:
```bash
npm run build
```

2. Deploy the contents of the `build` directory to your web server or hosting provider

#### Deployment Options

- **Netlify**:
  - Connect your GitHub repository
  - Build command: `npm run build`
  - Publish directory: `build`

- **Vercel**:
  - Import your project
  - Build command: `npm run build`

- **GitHub Pages**:
  ```bash
  npm run deploy
  ```

## Environment Variables

### Backend (.env)

```
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/business_crm

# Authentication
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key

# Azure AD Configuration
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id

# URLs
API_URL=https://your-backend-url.com
CLIENT_URL=https://your-frontend-url.com
```

### Frontend (.env)

```
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_TINYMCE_API_KEY=your_tinymce_api_key
```

## Database Setup

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Set up a database user with read/write permissions
4. Whitelist your IP address or set it to allow connections from anywhere (0.0.0.0/0)
5. Get your connection string and add it to your backend environment variables

### Local MongoDB Setup

1. Install MongoDB Community Edition
2. Start the MongoDB server
3. Use a connection string like `mongodb://localhost:27017/business_crm`

## Running the Application

### Development Mode

1. Start the backend:
```bash
cd server
npm run dev
```

2. Start the frontend:
```bash
cd client
npm start
```

### Production Mode

1. Start the backend:
```bash
cd server
npm start
```

2. Serve the frontend using a web server of your choice (nginx, Apache, etc.)

## Troubleshooting

### Common Issues

#### Authentication Problems

- Ensure your Microsoft Azure app registration is configured correctly
- Check that redirect URIs match exactly
- Verify that all required permissions are granted

#### Database Connection Issues

- Check MongoDB connection string
- Ensure IP whitelist allows your server's IP address
- Verify database user credentials

#### Frontend/Backend Communication

- CORS issues: Ensure the backend allows requests from your frontend origin
- API URL: Make sure REACT_APP_API_URL points to your backend

#### File Upload Issues

- Check OneDrive permissions
- Verify Microsoft access token is being refreshed properly
- Check file size limits in multer configuration

### Getting Help

If you encounter issues not covered in this guide:

1. Check the application logs for detailed error messages
2. Open an issue on the GitHub repository
3. Contact the development team at support@example.com

---

## Next Steps

After successful deployment, the following steps are recommended:

1. Set up regular database backups
2. Implement a monitoring solution
3. Create user documentation for your team
4. Set up a periodic maintenance schedule

## Security Considerations

### Data Protection

1. **Encryption**: Ensure data in transit is encrypted using HTTPS
2. **Password Policy**: Implement a strong password policy
3. **API Security**: Use rate limiting and JWT token expiration
4. **File Security**: Implement proper permissions for OneDrive access

### Regular Audits

1. Perform regular security audits
2. Keep all dependencies updated
3. Monitor for suspicious activities
4. Implement logging for all critical operations

## Customization Options

The Business Research CRM can be customized to meet your specific needs:

### Adding Custom Fields

1. Update the MongoDB schema in `models/Business.js`
2. Add corresponding fields to the frontend forms
3. Update API endpoints to handle the new fields

### Theming

1. Modify the Bootstrap variables in the frontend's SCSS files
2. Create custom component styles
3. Update the logo and branding elements

### Additional Integrations

The CRM can be extended with additional integrations:

1. **Email Integration**: Add email sending capabilities for notifications
2. **Calendar Integration**: Sync tasks with Microsoft Calendar
3. **Data Visualization**: Add more advanced reporting features

## Maintenance

### Regular Updates

1. Update Node.js dependencies regularly
2. Apply security patches promptly
3. Monitor MongoDB for performance issues

### Scaling Considerations

As your usage grows, consider:

1. Implementing MongoDB indexing for performance
2. Adding caching layers
3. Horizontal scaling of your backend services
4. CDN for static frontend assets

## User Management

### Adding Users

1. Use the registration endpoint to create new users
2. Assign appropriate permissions
3. Provide onboarding documentation

### User Roles

To implement more advanced user roles:

1. Add a roles field to the User model
2. Implement role-based middleware
3. Update frontend to show/hide features based on roles

## Backup and Recovery

### Database Backups

1. Set up automated MongoDB backups
2. Store backups in a secure, offsite location
3. Test restore procedures regularly

### Application Backups

1. Create regular backups of your application code
2. Document any custom configurations
3. Maintain environment variable documentation

## Conclusion

The Business Research CRM provides a robust platform for managing your business research workflow. With the OneDrive integration, your team can securely store and share documents, while the rich note-taking experience enables comprehensive knowledge management.

For additional support or custom development, contact the development team.

---

© 2025 Business Research CRM