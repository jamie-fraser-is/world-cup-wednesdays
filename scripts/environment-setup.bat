@echo off
REM Environment Setup Script for World Cup Wednesdays (Windows)
REM Usage: scripts\environment-setup.bat [development|staging|production]

setlocal enabledelayedexpansion

set ENVIRONMENT=%1
if "%ENVIRONMENT%"=="" set ENVIRONMENT=development

echo 🚀 Setting up World Cup Wednesdays - %ENVIRONMENT% environment

if "%ENVIRONMENT%"=="development" (
    echo 📦 Setting up local development environment...
    
    REM Check if Docker is running
    docker info >nul 2>&1
    if !errorlevel! neq 0 (
        echo ❌ Docker is not running. Please start Docker and try again.
        exit /b 1
    )
    
    REM Create .env file if it doesn't exist
    if not exist ".env" (
        echo 📝 Creating .env file...
        (
            echo NODE_ENV=development
            echo DB_HOST=localhost
            echo DB_PORT=5432
            echo DB_NAME=world_cup_wednesdays
            echo DB_USER=wcw_user
            echo DB_PASSWORD=password
            echo JWT_SECRET=dev-secret-key-change-in-production
            echo ENABLE_SEED_DATA=true
            echo LOG_LEVEL=debug
        ) > .env
    )
    
    REM Start development environment
    echo 🐳 Starting Docker containers...
    docker-compose up -d
    
    REM Wait for services to be ready
    echo ⏳ Waiting for services to start...
    timeout /t 10 /nobreak >nul
    
    REM Health check
    echo 🔍 Checking service health...
    curl -f http://localhost:5000/api/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Backend is healthy
    ) else (
        echo ❌ Backend health check failed
    )
    
    curl -f http://localhost:3000 >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Frontend is healthy
    ) else (
        echo ❌ Frontend health check failed
    )
    
    echo 🎉 Development environment is ready!
    echo 🌐 Frontend: http://localhost:3000
    echo 🔧 Backend: http://localhost:5000
    echo 🗄️  Database: localhost:5432
    echo.
    echo 📚 Next steps:
    echo 1. Open http://localhost:3000 in your browser
    echo 2. Login with demo account: admin@example.com / password
    echo 3. Start developing!
    echo 4. Run 'docker-compose logs -f' to view logs
    echo 5. Run 'docker-compose down' to stop services
    
) else if "%ENVIRONMENT%"=="staging" (
    echo ☁️  Setting up staging environment on AWS...
    echo ⚠️  This requires AWS CLI configuration and environment variables.
    echo Please use GitHub Actions or run the Linux script in WSL.
    
) else if "%ENVIRONMENT%"=="production" (
    echo 🏭 Setting up production environment on AWS...
    echo ⚠️  This requires AWS CLI configuration and environment variables.
    echo Please use GitHub Actions or run the Linux script in WSL.
    
) else (
    echo ❌ Invalid environment: %ENVIRONMENT%
    echo Usage: %0 [development^|staging^|production]
    exit /b 1
)

pause