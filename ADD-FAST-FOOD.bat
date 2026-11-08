@echo off
setlocal
cd /d "%~dp0"
call npm run seed -w server -- --fast-food-only
if errorlevel 1 (
  echo Check that MongoDB is reachable and MONGODB_URI is set in .env.
  pause
  exit /b 1
)
pause
