@echo off
REM Voice-First Spiritual Intent Classifier - Setup Script for Windows

echo 🚀 Voice-First Spiritual Intent Classifier - Setup
echo ==================================================

REM Create .env file if it doesn't exist
if not exist "backend\.env" (
  echo.
  echo 📝 Creating backend\.env file...
  copy backend\.env.example backend\.env
  echo ⚠️  Please update backend\.env with your API keys:
  echo    - DEEPGRAM_API_KEY
  echo    - OPENAI_API_KEY
  echo    - ELEVENLABS_API_KEY
)

echo.
echo ✅ Setup complete!
echo.
echo 🎬 To run the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   npm start
echo.
echo Terminal 2 - Frontend:
echo   cd frontend
echo   npm start
echo.
echo 📖 Frontend will open at http://localhost:3000
echo 🔌 Backend API at http://localhost:5000
echo.
