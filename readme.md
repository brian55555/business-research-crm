# Business Research CRM

A comprehensive CRM system designed for business research and client management, with centralized document storage on Google Drive.

## Features

- Client and business management
- Project tracking and scheduling
- Contact management
- Centralized document storage using Google Drive
- Document categorization by business
- Custom category management
- Role-based access control
- Reporting and analytics

## Technology Stack

- Frontend: React.js with Bootstrap
- Backend: Node.js with Express
- Database: MongoDB
- Storage: Google Drive API (centralized storage)
- Authentication: JWT for application users, Google service account for Drive access

## Setup Instructions

### Prerequisites

- Node.js (v12+)
- npm or yarn
- MongoDB
- Google Cloud Platform account with Drive API enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/brian55555/business-research-crm.git
cd business-research-crm
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Create a `.env` file in the root directory
- Add the following variables:
```
# Application
PORT=3000
MONGODB_URI=mongodb://localhost:27017/business-research-crm
JWT_SECRET=your_jwt_secret

# Google Drive API
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=your_service_account_private_key
```

4. Start the application:
```bash
npm start
```

### Google Drive Setup

This application uses a centralized Google Drive account for document storage, organizing files by business and category. To set up Google Drive integration:

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Drive API
3. Create API credentials:
   - API Key for client-side access
   - OAuth Client ID for authentication flows
   - Service Account for server-side document management
4. Download the service account JSON key file
5. Extract the required credentials and add them to your environment variables

## Document Storage Structure

Documents are organized in the following structure in Google Drive:

```
/
|- business_123/
   |- general/
   |- contracts/
   |- financials/
   |- [custom categories...]
|- business_456/
   |- general/
   |- marketing/
   |- [custom categories...]
```

Each business has its own folder with customizable document categories.

## Usage

### Document Management

- Navigate to a business profile
- Use the document manager to:
  - Upload files to any category
  - Create custom categories
  - View, download, and delete documents
  - Share documents via Google Drive links

### Access Control

- Admin users have full access to all documents
- Regular users only see documents for businesses they're assigned to
- All document operations are logged for auditing purposes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Google Drive API](https://developers.google.com/drive)
- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Bootstrap](https://getbootstrap.com/)
