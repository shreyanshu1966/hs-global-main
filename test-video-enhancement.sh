#!/bin/bash

# 🎬 Product CRUD Video Enhancement - Test Script
# Run this script to verify all functionality works

echo "🚀 Starting Product CRUD Video Enhancement Tests..."
echo ""

# Check if backend is running
echo "📋 Checking backend status..."
backend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")

if [ "$backend_status" != "200" ]; then
    echo "⚠️  Backend not running on port 3000"
    echo "   Please start backend: cd backend && npm start"
    echo ""
else
    echo "✅ Backend is running"
    echo ""
fi

# Check if frontend is running
echo "📋 Checking frontend status..."
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 2>/dev/null || echo "000")

if [ "$frontend_status" != "200" ]; then
    echo "⚠️  Frontend not running on port 5173"
    echo "   Please start frontend: cd frontend && npm run dev"
    echo ""
else
    echo "✅ Frontend is running"
    echo ""
fi

echo "🧪 Test Checklist - Please verify manually:"
echo ""

echo "1️⃣  IMAGE UPLOAD TESTS:"
echo "   □ Upload multiple images (5-10)"
echo "   □ Verify progress bars appear"
echo "   □ Test drag & drop reordering"
echo "   □ Set different main image"
echo "   □ Test image cropping"
echo ""

echo "2️⃣  VIDEO UPLOAD TESTS:"
echo "   □ Upload MP4/WebM/MOV video files"
echo "   □ Verify upload progress tracking"
echo "   □ Test video preview controls"
echo "   □ Check duration & file size display"
echo "   □ Test remove video functionality"
echo "   □ Test drag & drop video upload"
echo ""

echo "3️⃣  LOADING STATES TESTS:"
echo "   □ Image processing spinners"
echo "   □ Video upload progress bars"
echo "   □ Create/Update button loading states"
echo "   □ Preview button loading states"
echo "   □ Disabled states during operations"
echo ""

echo "4️⃣  UI/UX TESTS:"
echo "   □ Purple play icon on products with video"
echo "   □ Video indicator tooltip"
echo "   □ Responsive design on mobile"
echo "   □ Error messages display correctly"
echo "   □ Form validation works"
echo ""

echo "5️⃣  BACKEND INTEGRATION TESTS:"
echo "   □ Videos actually save to backend"
echo "   □ Video URLs returned in product data"
echo "   □ Edit products with existing videos"
echo "   □ Video removal persists"
echo ""

echo "🔗 Quick Links:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3000"
echo "   Admin:    http://localhost:5173/admin"
echo ""

echo "📁 Files to check:"
echo "   ✅ ProductVideoManager.tsx (NEW)"
echo "   ✅ EnhancedProductForm.tsx (ENHANCED)"
echo "   ✅ Admin.tsx (VIDEO INDICATORS)"
echo "   ✅ ProductImageManager.tsx (LOADING STATES)"
echo ""

echo "🎯 Success Criteria:"
echo "   ✅ Can upload multiple images with progress tracking"
echo "   ✅ Can upload videos with validation and preview"
echo "   ✅ Loading states work throughout the process"
echo "   ✅ Video indicators appear in product listings"
echo "   ✅ All operations save properly to backend"
echo ""

echo "🎉 If all tests pass, your Product CRUD Video Enhancement is complete!"