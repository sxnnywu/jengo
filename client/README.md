# Jengo Client

React + Vite frontend application for Jengo - A C2C volunteer marketplace.

## Tech Stack

- React 19
- Vite
- React Router DOM
- Context API for state management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the client directory:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
client/src/
├── pages/          # Page components (Home, Login, Register, Opportunities, Dashboard)
├── components/     # Reusable UI components (Navbar, Footer, OpportunityCard)
├── context/        # React Context providers (AuthContext)
├── hooks/          # Custom React hooks (useAuth, useOpportunities)
├── services/       # API service layer (api.js)
├── utils/          # Utility functions and constants
├── assets/         # Static assets (images, icons)
├── App.jsx         # Main app component with routing
└── main.jsx        # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:5000/api)
