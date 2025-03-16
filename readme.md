# Business Research CRM

A comprehensive CRM system designed specifically for business research, featuring advanced note-taking, document management, and Microsoft OneDrive integration.

## Features

- **Business Management**: Track and organize businesses you're researching
- **Rich Note-Taking**: Take detailed notes with full formatting capabilities
- **Document Management**: Upload, organize, and share documents
- **News Articles**: Save and catalog relevant news about businesses
- **Task Management**: Keep track of research tasks and deadlines
- **Cloud Storage**: Seamless Microsoft OneDrive integration
- **User Authentication**: Secure login with email or Microsoft account

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- Passport.js for authentication
- Microsoft Graph API for OneDrive integration

### Frontend
- React
- React Router
- React Bootstrap for UI components
- TinyMCE for rich text editing
- Axios for API calls
- Context API for state management

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- Microsoft Azure account (for OneDrive integration)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/business-research-crm.git
cd business-research-crm
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/business_crm
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
AZURE_CLIENT_ID=your_azure_client_id
AZURE_CLIENT_SECRET=your_azure_client_secret
AZURE_TENANT_ID=your_azure_tenant_id
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:3000
```

4. Install frontend dependencies:
```bash
cd ../client
npm install
```

5. Create a `.env` file in the client directory:
```
REACT_APP_API_URL=http://localhost:5000
```

### Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. In a separate terminal, start the frontend:
```bash
cd client
npm start
```

3. Access the application at `http://localhost:3000`

## Setting Up Microsoft OneDrive Integration

1. Register a new application in the [Azure Portal](https://portal.azure.com/)
2. Set the redirect URI to `http://localhost:5000/auth/microsoft/callback` (for development)
3. Add the following API permissions:
   - Microsoft Graph > Files.ReadWrite.All
   - Microsoft Graph > User.Read
   - Microsoft Graph > offline_access
4. Update your `.env` file with the Azure app credentials

## Project Structure

```
business-research-crm/
├── server/                   # Backend
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── services/             # Service modules
│   ├── utils/                # Utility functions
│   └── server.js             # Main server file
│
├── client/                   # Frontend
│   ├── public/               # Static files
│   └── src/
│       ├── components/       # React components
│       ├── contexts/         # Context providers
│       ├── utils/            # Utility functions
│       ├── App.js            # Main App component
│       └── index.js          # Entry point
│
└── README.md                 # Project documentation
```

## Key Functionality

### Business Management
- Create, view, edit, and delete business profiles
- Track industry, contacts, and research stage
- Add tags for easy categorization

### Notes
- Rich text editor with formatting options
- Automatic syncing with OneDrive
- Tag notes for easy searching

### Document Management
- Upload documents directly to OneDrive
- Organize documents by business
- View, download, and manage permissions

### News Articles
- Save relevant news articles
- Add summaries and source information
- Link articles to specific businesses

### Tasks
- Create tasks with due dates and priorities
- Assign tasks to specific businesses
- Track task completion status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/microsoft` - Initiate Microsoft OAuth flow
- `GET /api/auth/me` - Get current user data

### Businesses
- `GET /api/businesses` - Get all businesses
- `GET /api/businesses/:id` - Get a specific business
- `POST /api/businesses` - Create a new business
- `PUT /api/businesses/:id` - Update a business
- `DELETE /api/businesses/:id` - Delete a business

### Notes
- `GET /api/notes/business/:businessId` - Get notes for a business
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Documents
- `GET /api/documents/business/:businessId` - Get documents for a business
- `POST /api/documents` - Upload a document
- `GET /api/documents/:id/download` - Download a document
- `DELETE /api/documents/:id` - Delete a document

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/business/:businessId` - Get tasks for a business
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Microsoft Graph API for OneDrive integration
- TinyMCE for the rich text editor
- MongoDB Atlas for database hosting
- React Bootstrap for UI components
