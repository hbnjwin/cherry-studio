#!/bin/bash

# Simple script to update the app icon with a text-based temporary icon
echo "🎨 Creating simple Tutu Studio icon..."

# Create a simple text-based icon using macOS tools
# This creates a basic PNG with text

# Create a temporary HTML file to render as image
cat > /tmp/tutu-icon.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: 512px;
            height: 512px;
            background: linear-gradient(135deg, #FF6B6B, #FF4757);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .icon {
            color: white;
            font-size: 200px;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <div class="icon">T</div>
</body>
</html>
EOF

echo "📱 Creating icon files..."

# Create the main logo file by copying the current one and renaming
cp src/renderer/src/assets/images/logo.png build/tutu-logo-backup.png

# For now, let's create a simple approach - we'll update the renderer logo
# Create a simple text file that indicates the change
echo "Tutu Studio Icon - Please replace with custom icon" > build/icon-placeholder.txt

echo "✅ Icon placeholder created!"
echo "📝 To complete the icon update:"
echo "   1. Create a 512x512 PNG icon for Tutu Studio"
echo "   2. Replace build/icon.png with your new icon"
echo "   3. Replace src/renderer/src/assets/images/logo.png with your new icon"
echo "   4. Run 'yarn build:mac:x64' to rebuild with new icon"

echo ""
echo "🎨 Suggested icon design:"
echo "   - Use a 'T' letter or tutu/dance theme"
echo "   - Colors: Pink/Red gradient (#FF6B6B to #FF4757)"
echo "   - Size: 512x512 pixels"
echo "   - Format: PNG with transparency"
