#!/bin/bash

# Voice-First Spiritual Intent Classifier - Setup Script
# This script sets up the entire project for local development

echo "🚀 Voice-First Spiritual Intent Classifier - Setup"
echo "=================================================="

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
  echo ""
  echo "📝 Creating backend/.env file..."
  cp backend/.env.example backend/.env
  echo "⚠️  Please update backend/.env with your API keys:"
  echo "   - DEEPGRAM_API_KEY"
  echo "   - OPENAI_API_KEY"
  echo "   - ELEVENLABS_API_KEY"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎬 To run the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm start"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "📖 Frontend will open at http://localhost:3000"
echo "🔌 Backend API at http://localhost:5000"
echo ""
