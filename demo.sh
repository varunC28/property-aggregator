#!/bin/bash

echo "🏠 Property Aggregator Demo"
echo "=========================="
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "🔧 Starting MongoDB..."
    mongod --dbpath ~/data/db &
    MONGODB_PID=$!
    sleep 3
    echo "✅ MongoDB started"
else
    echo "✅ MongoDB is already running"
fi

# Check if backend is running
if ! lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo "🔧 Starting Backend Server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    sleep 5
    echo "✅ Backend started on http://localhost:5000"
else
    echo "✅ Backend is already running on http://localhost:5000"
fi

# Check if frontend is running
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "🎨 Starting Frontend Server..."
    cd ../frontend
    npm start &
    FRONTEND_PID=$!
    sleep 10
    echo "✅ Frontend started on http://localhost:3000"
else
    echo "✅ Frontend is already running on http://localhost:3000"
fi

echo ""
echo "🚀 Application is ready!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🔍 Health Check: http://localhost:5000/api/health"
echo ""
echo "📋 Demo Steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Go to the 'Scraper' tab"
echo "3. Click 'Start All' to scrape sample data"
echo "4. Go back to 'Properties' to view the listings"
echo "5. Use filters to explore different properties"
echo ""
echo "Press Ctrl+C to stop the demo"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping demo..."
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend stopped"
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend stopped"
    fi
    if [ ! -z "$MONGODB_PID" ]; then
        kill $MONGODB_PID 2>/dev/null
        echo "✅ MongoDB stopped"
    fi
    echo "🎉 Demo completed"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait 