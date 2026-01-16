# Jengo Backend Server

Backend server for Jengo - A C2C volunteer marketplace connecting nonprofits with volunteers.

## Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs for password hashing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory (use `.env.example` as a template):
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string and JWT secret.

4. Start the development server:
```bash
npm run dev
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users
- `GET /api/users/:id` - Get user profile (protected)
- `PUT /api/users/:id` - Update user profile (protected, own profile only)

### Opportunities
- `GET /api/opportunities` - Get all opportunities (public)
- `GET /api/opportunities/:id` - Get single opportunity (public)
- `GET /api/opportunities/my` - Get nonprofit's own opportunities (protected, nonprofit only)
- `POST /api/opportunities` - Create opportunity (protected, nonprofit only)
- `PUT /api/opportunities/:id` - Update opportunity (protected, nonprofit only, own opportunities)
- `DELETE /api/opportunities/:id` - Delete opportunity (protected, nonprofit only, own opportunities)

### Applications
- `POST /api/applications` - Apply to opportunity (protected, volunteer only)
- `GET /api/applications/my` - Get volunteer's applications (protected, volunteer only)
- `GET /api/applications/opportunity/:id` - Get applications for opportunity (protected, nonprofit only)
- `PUT /api/applications/:id/accept` - Accept application (protected, nonprofit only)
- `PUT /api/applications/:id/reject` - Reject application (protected, nonprofit only)

## Project Structure

```
server/
├── config/          # Configuration files (database, JWT)
├── controllers/     # Route controllers
├── middleware/      # Custom middleware (auth, validation)
├── models/          # MongoDB models (User, Opportunity, Application)
├── routes/          # API routes
├── utils/           # Utility functions
├── server.js        # Entry point
└── package.json     # Dependencies
```
