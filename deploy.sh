#!/bin/bash

# 🚀 BARNBOWL PremPredictions Deployment Script
# This script will build and deploy your app

set -e  # Exit on any error

echo "🏆 BARNBOWL PremPredictions - Deployment Script"
echo "==============================================="

# Check if we're in the right directory
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building production app..."
npm run build

echo "✅ Build complete! Your app is ready to deploy."
echo ""
echo "🚀 Next steps to go live:"
echo ""
echo "Option 1 - Vercel (Recommended):"
echo "1. Go to https://vercel.com"
echo "2. Sign up/login with GitHub"
echo "3. Click 'New Project' and import this repo"
echo "4. Vercel will auto-deploy! ⚡"
echo ""
echo "Option 2 - Netlify:"
echo "1. Go to https://netlify.com"
echo "2. Drag & drop the 'build' folder"
echo "3. Instant deployment! 🌐"
echo ""
echo "Option 3 - Manual upload:"
echo "1. Zip the 'build' folder"
echo "2. Upload to any static hosting service"
echo ""
echo "🎯 Your app will be live in minutes!"
echo "Share the URL with your barnbowl friends!"

# Optional: Open the build folder
if command -v open >/dev/null 2>&1; then
    echo ""
    echo "📁 Opening build folder..."
    open build
fi

echo ""
echo "🎉 Ready to go live! Your barnbowl friends will love it!"