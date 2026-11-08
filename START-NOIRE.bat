@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules\express\package.json" (
  echo Existing dependencies were not found.
  echo Copy this update into the original noire-restaurant folder that already has node_modules.
  pause
  exit /b 1
)
if not exist "client\dist\index.html" (
  echo The prebuilt client is missing. Extract the entire update before starting.
  pause
  exit /b 1
)
call npm start
if errorlevel 1 pause
