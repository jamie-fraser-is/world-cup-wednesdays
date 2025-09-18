@echo off
REM Development setup script for World Cup Wednesdays (Windows)

echo 🚀 Setting up World Cup Wednesdays development environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Build and start services
echo 📦 Building and starting services...
docker-compose up --build -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Check if services are healthy
echo 🔍 Checking service health...
docker-compose ps

echo ✅ Development environment is ready!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo 🗄️  Database: localhost:5432
echo.
echo 👥 Demo accounts (password: 'password'):
echo    Admin: admin@example.com
echo    Users: john@example.com, jane@example.com, alice@example.com, bob@example.com
echo.
echo 🛑 To stop: docker-compose down
echo 🔄 To restart: docker-compose restart
echo 📊 To view logs: docker-compose logs -f [service-name]

pause