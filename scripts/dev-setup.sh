#!/bin/bash

# Development setup script for World Cup Wednesdays

echo "🚀 Setting up World Cup Wednesdays development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Build and start services
echo "📦 Building and starting services..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if services are healthy
echo "🔍 Checking service health..."
docker-compose ps

echo "✅ Development environment is ready!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "🗄️  Database: localhost:5432"
echo ""
echo "👥 Demo accounts (password: 'password'):"
echo "   Admin: admin@example.com"
echo "   Users: john@example.com, jane@example.com, alice@example.com, bob@example.com"
echo ""
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart"
echo "📊 To view logs: docker-compose logs -f [service-name]"