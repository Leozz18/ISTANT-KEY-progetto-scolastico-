@echo off
echo 🧪 Testing INSTANT KEY System...
echo.

echo 1. Checking if backend is running...
curl -s http://localhost:3001/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend not running. Please start backend first with start-backend.bat
    pause
    exit /b 1
) else (
    echo ✅ Backend is running on port 3001
)

echo.
echo 2. Checking if frontend is accessible...
curl -s http://localhost:8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend not accessible. Please start frontend with start-frontend.bat
    pause
    exit /b 1
) else (
    echo ✅ Frontend is accessible on port 8000
)

echo.
echo 3. Testing API endpoints...
echo Testing health endpoint...
curl -s http://localhost:3001/api/health | findstr "OK" >nul
if %errorlevel% neq 0 (
    echo ❌ Health check failed
) else (
    echo ✅ API health check passed
)

echo.
echo 🎉 System test completed!
echo.
echo 🌐 Frontend: http://localhost:8000
echo 🚀 Backend API: http://localhost:3001
echo 📊 API Health: http://localhost:3001/api/health
echo.
echo You can now use the INSTANT KEY marketplace!
pause