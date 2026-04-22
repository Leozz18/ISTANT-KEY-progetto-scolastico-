@echo off
echo INSTANT KEY - Gaming Marketplace
echo Starting development environment...

echo.
echo [1/2] Installing PHP dependencies...
composer install

echo.
echo [2/2] Installing Node dependencies...
npm install

echo.
echo Setup complete! 
echo.
echo To start the application:
echo 1. Run: php artisan serve
echo 2. In another terminal: npm run dev
echo.
pause
