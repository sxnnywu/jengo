# Jengo - Project Overview

## What is Jengo?

Jengo is a **C2C (Consumer-to-Consumer) volunteer marketplace** that connects volunteers with nonprofit organizations. It's a platform where:
- **Volunteers** can discover meaningful opportunities, showcase their skills through profiles with pitch videos and resumes, and apply to positions
- **Nonprofits** can post volunteer opportunities, review applications, and find qualified volunteers for their causes

The platform uses a **Tinder-style swipe interface** for volunteers to browse opportunities, making the discovery process engaging and modern.

---

## Tech Stack

### Frontend (Client)
- **React** with Vite as the build tool
- **React Router** for navigation
- **CSS** for styling (custom, no UI framework)
- Key libraries: Context API for auth state management
- Design: Modern, playful, clean aesthetic with custom animations

### Backend (Server)
- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **Multer** for file uploads (profile photos, videos, resumes)
- **bcrypt** for password hashing
- Deployment: Hosted on Render
- Database: MongoDB Atlas (with fallback to in-memory MongoDB for development)

### Build & Dev Tools
- **Concurrently** to run client and server simultaneously
- **Nodemon** for server hot-reloading
- **ESLint** for code quality
- **dotenv** for environment configuration

---

## Project Structure

```
jengo/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-based page components
│   │   ├── context/      # React Context for global state
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API communication layer
│   │   └── utils/        # Helper functions, constants, mock data
│   └── public/           # Static assets
├── server/               # Express backend
│   ├── controllers/      # Request handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API route definitions
│   ├── middleware/       # Auth, upload, validation middleware
│   └── config/           # Database, JWT configuration
└── package.json          # Root scripts for dev workflow
```

---

## User Roles & Features

### Volunteer Role
- Create profile with: name, pronouns, location, age, school, skills, interests
- Upload **pitch video** to stand out to nonprofits
- Upload **resume** and volunteer forms
- Upload **profile photo**
- Browse opportunities using a **swipe deck interface** (SwipeDeck component)
- Apply to opportunities with one click
- View application status (applied, accepted, rejected)
- Dashboard to track applications

### Nonprofit Role
- Create organization profile with: description, needed skills/interests, website, social links
- Upload **organization logo**
- Post volunteer opportunities with: title, description, category, required skills, estimated hours
- View and manage posted opportunities
- Review applications from volunteers (see their profiles, videos, resumes)
- Accept or reject applications
- Dashboard to manage opportunities and applications

---

## Key Features

### Authentication System
- Registration with role selection (volunteer or nonprofit)
- Login with JWT token generation
- Protected routes (Dashboard requires authentication)
- Auth context provides user state across the app

### Opportunity Discovery
- **Swipe Deck**: Tinder-style card interface for volunteers to browse opportunities
- Filters and search on Opportunities page
- Opportunity detail pages with full information
- Apply directly from opportunity cards or detail pages

### Application Management
- Volunteers can track all their applications
- Nonprofits can see all applications per opportunity
- Status tracking: applied → accepted/rejected
- Prevents duplicate applications (unique index on volunteer + opportunity)

### File Uploads
- Pitch videos (volunteers)
- Resumes (volunteers)
- Profile photos (volunteers and nonprofits)
- Organization logos (nonprofits)
- Files stored locally in `/uploads` directory and served statically

### Contact Form (NEW)
- Public contact page at `/contact`
- Form fields: name, email, message, consent checkbox
- Submissions stored in MongoDB (ContactMessage model)
- No email sending (database-only storage for now)
- Linked from footer

---

## Database Models

### User
- Shared fields: name, username, email, password (hashed), location, age, profilePhoto
- Role-based fields:
  - **Volunteer**: school, skills, interests, resume, pitchVideoUrl, volunteerForm
  - **Nonprofit**: organizationDescription, neededSkills, neededInterests, website, socialLinks, organizationLogo, verificationStatus
- Methods: `matchPassword()`, `toPublicJSON()`

### Opportunity
- Fields: title, description, category, skillsRequired, estimatedHours, status (open/closed)
- References: nonprofit (User ObjectId)
- Indexes for efficient querying by status and nonprofit

### Application
- Fields: opportunity (ref), volunteer (ref), status (applied/accepted/rejected), reviewedAt
- Unique compound index on (opportunity, volunteer) to prevent duplicates
- Timestamps for tracking

### ContactMessage (NEW)
- Fields: name, email, message, consent
- Timestamps for tracking submissions

---

## Client Pages & Routes

### Public Pages
- **/** - Home: Hero section, how it works, call-to-action
- **/about** - About page explaining Jengo's mission
- **/contact** - Contact form (NEW)
- **/login** - Login form
- **/register** - Registration form with role selection
- **/opportunities** - Browse all opportunities (list view)
- **/opportunities/:id** - Individual opportunity details

### Protected Pages
- **/dashboard** - Role-based dashboard:
  - **Volunteers**: View applications, swipe deck, profile management
  - **Nonprofits**: Create opportunities, manage applications, view analytics

### Components
- **Navbar**: Navigation with auth-aware links
- **Footer**: Links to pages, company info, contact
- **SwipeDeck**: Tinder-style card swiping for opportunities
- **OpportunityCard**: Display opportunity info
- **ApplicationCard**: Display volunteer applications (for nonprofits)
- **VolunteerApplicationCard**: Display applications with status (for volunteers)
- **CreateOpportunity**: Form for nonprofits to post opportunities
- **RoleSwitcher**: Switch between volunteer/nonprofit views (dashboard)
- **TagInput**: Input component for skills/interests
- **Sidebar**: Dashboard navigation

---

## API Endpoints

### Auth (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate and get JWT token
- `GET /me` - Get current user profile (protected)

### Users (`/api/users`)
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user profile (protected)
- `POST /users/:id/pitch-video` - Upload pitch video (protected)
- `POST /users/:id/resume` - Upload resume (protected)
- `POST /users/:id/profile-photo` - Upload profile photo (protected)

### Opportunities (`/api/opportunities`)
- `GET /opportunities` - List all opportunities
- `GET /opportunities/:id` - Get single opportunity
- `POST /opportunities` - Create opportunity (protected, nonprofit only)
- `GET /opportunities/my` - Get user's posted opportunities (protected)

### Applications (`/api/applications`)
- `POST /applications` - Apply to opportunity (protected, volunteer only)
- `GET /applications/my` - Get user's applications (protected)
- `GET /applications/opportunity/:id` - Get applications for opportunity (protected, nonprofit only)
- `PUT /applications/:id/accept` - Accept application (protected)
- `PUT /applications/:id/reject` - Reject application (protected)

### Contact (`/api/contact`) (NEW)
- `POST /contact` - Submit contact form message

---

## Design System

### Color Palette
- **Navy**: `#283044` (primary dark)
- **Blue**: `#788aa3` (secondary)
- **Orange**: `#ff5100` (accent, CTAs)
- **Peach**: `#f68e5f` (secondary accent)

### Typography
- **Display Font**: 'Baloo 2' for headings (playful, warm)
- **Body Font**: 'JA JayaGiriSans' with fallbacks (clean, readable)

### Design Principles
- **Playful**: Floating animations, rounded corners, friendly copy
- **Modern**: Gradients, smooth transitions, card-based layouts
- **Clean**: Ample whitespace, clear hierarchy, minimal clutter
- **Bold**: Strong CTAs, confident typography, vibrant accent colors
- **Memorable**: Unique swipe interface, pitch videos, personality-driven

---

## Current State & Development Notes

### What's Working
- Full authentication flow with role-based access
- Opportunity creation and browsing
- Application submission and management
- File uploads for all user types
- Swipe deck interface for discovery
- Dashboard with role-specific views
- Contact form with database storage

### Known Configuration
- Backend deployed on Render: `https://jengo.onrender.com/api`
- MongoDB Atlas connection configured with fallback to in-memory DB
- Client uses environment variable `VITE_API_BASE_URL` to point to backend
- File uploads stored in `/uploads` directory (needs persistent storage solution for production)

### Areas for Future Enhancement
- Email notifications (currently just database storage for contact messages)
- Advanced matching algorithm (currently basic skill/interest matching in utils)
- Real-time notifications
- Messaging between volunteers and nonprofits
- Calendar integration for scheduling
- Analytics dashboard for nonprofits
- Volunteer hour tracking
- Review/rating system

---

## Environment Variables

### Server (.env)
```
MONGODB_URI=<MongoDB Atlas connection string>
JWT_SECRET=<Random secret key>
PORT=8000
NODE_ENV=development
```

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api  # For local dev
# OR
VITE_API_BASE_URL=https://jengo.onrender.com/api  # For production
```

---

## Running the Project

### Development
From project root:
```bash
npm run dev
```
This runs both client (localhost:5173) and server (localhost:8000) concurrently.

### Production Build
```bash
cd client && npm run build
```

### Server Only
```bash
cd server && npm run dev
```

---

## Key Implementation Details

### Authentication Flow
1. User registers with role → password hashed → JWT token generated
2. Token stored in localStorage on client
3. Protected routes check for token → verify with backend `/api/auth/me`
4. AuthContext provides user data to entire app

### File Upload Flow
1. Client creates FormData with file
2. POST to specific upload endpoint (e.g., `/users/:id/pitch-video`)
3. Multer middleware processes file → saves to `/uploads`
4. Server returns file path → stored in user document
5. Client uses `api.resolveMediaUrl()` to generate full URL for display

### Swipe Interface
1. SwipeDeck fetches all open opportunities
2. Uses Hammerjs-style gestures (simulated with mouse/touch)
3. Swipe right → apply, swipe left → skip
4. Card animations and transitions for smooth UX

### Contact Form (NEW)
1. User fills form on `/contact` page
2. Client POSTs to `/api/contact`
3. Server validates and saves to ContactMessage collection
4. Success message shown to user
5. Messages viewable in MongoDB Atlas

---

This is a living document. Update as new features are added or architecture changes.
