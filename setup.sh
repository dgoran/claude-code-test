#!/bin/bash

# Zoom Registration App - Setup Script
# This script helps you set up the application for the first time

echo "🚀 Zoom Registration App - Setup Script"
echo "========================================"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
    read -p "Do you want to recreate it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping .env creation"
    else
        echo "📝 Creating new .env file from .env.example..."
        cp .env.example .env
        echo "✅ .env file created successfully"
    fi
else
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created successfully"
fi

echo ""
echo "⚠️  IMPORTANT: Please edit the .env file and configure:"
echo "   - JWT_SECRET (change from default)"
echo "   - MONGODB_URI (if using custom MongoDB)"
echo "   - Zoom API credentials (optional, for Zoom integration)"
echo ""
echo "📖 Edit .env file:"
echo "   nano .env   (or use your preferred editor)"
echo ""
echo "🐳 Next steps:"
echo "   Option 1 (Docker - Recommended):"
echo "     docker compose up -d"
echo ""
echo "   Option 2 (Manual):"
echo "     cd backend && npm install && npm start"
echo "     cd client && npm install && npm start"
echo ""
echo "✨ Setup complete! Happy coding!"
