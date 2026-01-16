#!/bin/bash

# Jengo Development Server Startup Script

echo "🚀 Starting Jengo Development Servers..."
echo ""

# Check if MongoDB is needed
echo "📦 Checking MongoDB connection..."
echo "   Note: If using MongoDB Atlas, make sure your connection string is in server/.env"
echo ""

# Start backend server
echo "🔧 Starting backend server on http://localhost:5000..."
cd server
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend client
echo "⚛️  Starting frontend client on http://localhost:5173..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers are starting!"
echo ""
echo "📍 Frontend: http://localhost:5173"
echo "📍 Backend API: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
