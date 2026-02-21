# Jengo

A C2C-style volunteer marketplace where nonprofits post one-time tasks and students/volunteers apply to earn hours or experience.

## Tech Stack

- **MongoDB** - Database
- **Express.js** - Backend framework
- **React** - Frontend framework
- **Node.js** - Runtime environment

## Project Structure

```
jengo/
├── client/          # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React Context providers
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API services
│   │   ├── utils/       # Utility functions
│   │   └── assets/      # Static assets
│   └── package.json
│
└── server/          # Node.js + Express backend
    ├── models/          # MongoDB models
    ├── routes/          # API routes
    ├── controllers/     # Route controllers
    ├── middleware/      # Custom middleware
    ├── config/          # Configuration files
    ├── utils/           # Utility functions
    └── server.js        # Entry point
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB connection string and JWT secret.

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
echo "VITE_API_BASE_URL=http://localhost:5000/api" > .env
```

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173`

## Core Features

### User Roles

- **Volunteers**: Browse opportunities, apply with one click, share profile info and documents
- **Nonprofits**: Create and manage postings, review applicants, accept or reject volunteers

### Key Functionality

- User authentication (register/login)
- Role-based access control
- Opportunity browsing and creation
- Application management
- Profile management

## API Documentation

See `server/README.md` for detailed API route documentation.

## License

ISC
