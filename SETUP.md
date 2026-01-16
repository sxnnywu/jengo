# Localhost Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose one:
   - **Local MongoDB**: Install MongoDB locally ([Download here](https://www.mongodb.com/try/download/community))
   - **MongoDB Atlas**: Free cloud database ([Sign up here](https://www.mongodb.com/cloud/atlas))

## Quick Start

### 1. Install Dependencies

Dependencies should already be installed, but if needed:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

#### Server (.env)
The `.env` file in the `server/` directory should contain:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/jengo
JWT_SECRET=jengo-super-secret-jwt-key-change-in-production
```

**For MongoDB Atlas**, replace `MONGODB_URI` with your connection string:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jengo
```

#### Client (.env)
The `.env` file in the `client/` directory should contain:
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start MongoDB (if using local MongoDB)

**macOS (using Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Windows:**
```bash
net start MongoDB
```

Or if MongoDB is installed as a service, it should start automatically.

### 4. Start the Development Servers

Open **two terminal windows**:

#### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`

#### Terminal 2 - Frontend Client
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173` (or another port if 5173 is taken)

### 5. Access the Application

- **Frontend**: Open `http://localhost:5173` in your browser
- **Backend API**: Available at `http://localhost:5000/api`
- **Health Check**: `http://localhost:5000/api/health`

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
   ```bash
   # macOS/Linux
   brew services list | grep mongodb
   # or
   ps aux | grep mongod
   ```

2. **Test MongoDB connection:**
   ```bash
   mongosh
   # or
   mongo
   ```

3. **If using MongoDB Atlas**, ensure:
   - Your IP address is whitelisted in Network Access
   - Your database user has proper permissions
   - The connection string is correct

### Port Already in Use

If port 5000 or 5173 is already in use:

1. **Change server port**: Update `PORT` in `server/.env`
2. **Change client port**: Vite will automatically use the next available port, or specify in `vite.config.js`

### Common Issues

- **"Cannot find module"**: Run `npm install` in the respective directory
- **"MongoDB connection error"**: Check your `MONGODB_URI` in `server/.env`
- **CORS errors**: Ensure the backend is running and `VITE_API_BASE_URL` matches the backend port

## Development Workflow

1. Start MongoDB (if local)
2. Start backend server (`cd server && npm run dev`)
3. Start frontend client (`cd client && npm run dev`)
4. Make changes - both servers support hot reloading
5. Test your changes in the browser

## Production Build

To build for production:

```bash
# Build client
cd client
npm run build

# Start server in production mode
cd ../server
NODE_ENV=production npm start
```
