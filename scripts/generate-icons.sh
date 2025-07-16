#!/bin/bash

# Script to generate icons for Tutu Studio
# This script converts the SVG icon to various formats needed for the app

echo "🎨 Generating icons for Tutu Studio..."

# Check if we have the required tools
if ! command -v rsvg-convert &> /dev/null; then
    echo "❌ rsvg-convert not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install librsvg
    else
        echo "Please install librsvg manually"
        exit 1
    fi
fi

# Create build/icons directory if it doesn't exist
mkdir -p build/icons

# Generate PNG files from SVG
echo "📱 Generating PNG files..."
rsvg-convert -w 16 -h 16 build/tutu-icon.svg > build/icons/16x16.png
rsvg-convert -w 24 -h 24 build/tutu-icon.svg > build/icons/24x24.png
rsvg-convert -w 32 -h 32 build/tutu-icon.svg > build/icons/32x32.png
rsvg-convert -w 48 -h 48 build/tutu-icon.svg > build/icons/48x48.png
rsvg-convert -w 64 -h 64 build/tutu-icon.svg > build/icons/64x64.png
rsvg-convert -w 128 -h 128 build/tutu-icon.svg > build/icons/128x128.png
rsvg-convert -w 256 -h 256 build/tutu-icon.svg > build/icons/256x256.png
rsvg-convert -w 512 -h 512 build/tutu-icon.svg > build/icons/512x512.png
rsvg-convert -w 1024 -h 1024 build/tutu-icon.svg > build/icons/1024x1024.png

# Generate main icon files
rsvg-convert -w 512 -h 512 build/tutu-icon.svg > build/icon.png
rsvg-convert -w 256 -h 256 build/tutu-icon.svg > build/logo.png

# Generate tray icons
rsvg-convert -w 32 -h 32 build/tutu-icon.svg > build/tray_icon.png
rsvg-convert -w 32 -h 32 build/tutu-icon.svg > build/tray_icon_light.png
rsvg-convert -w 32 -h 32 build/tutu-icon.svg > build/tray_icon_dark.png

# Generate ICNS file for macOS (requires iconutil on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Generating ICNS file for macOS..."
    
    # Create iconset directory
    mkdir -p build/icon.iconset
    
    # Copy PNG files to iconset with proper naming
    cp build/icons/16x16.png build/icon.iconset/icon_16x16.png
    cp build/icons/32x32.png build/icon.iconset/icon_16x16@2x.png
    cp build/icons/32x32.png build/icon.iconset/icon_32x32.png
    cp build/icons/64x64.png build/icon.iconset/icon_32x32@2x.png
    cp build/icons/128x128.png build/icon.iconset/icon_128x128.png
    cp build/icons/256x256.png build/icon.iconset/icon_128x128@2x.png
    cp build/icons/256x256.png build/icon.iconset/icon_256x256.png
    cp build/icons/512x512.png build/icon.iconset/icon_256x256@2x.png
    cp build/icons/512x512.png build/icon.iconset/icon_512x512.png
    cp build/icons/1024x1024.png build/icon.iconset/icon_512x512@2x.png
    
    # Generate ICNS file
    iconutil -c icns build/icon.iconset
    
    # Clean up
    rm -rf build/icon.iconset
fi

# Generate ICO file for Windows (requires ImageMagick)
if command -v convert &> /dev/null; then
    echo "🪟 Generating ICO file for Windows..."
    convert build/icons/16x16.png build/icons/24x24.png build/icons/32x32.png build/icons/48x48.png build/icons/64x64.png build/icons/128x128.png build/icons/256x256.png build/icon.ico
fi

echo "✅ Icon generation complete!"
echo "📁 Generated files:"
echo "   - build/icon.png (main icon)"
echo "   - build/icon.icns (macOS)"
echo "   - build/icon.ico (Windows)"
echo "   - build/icons/ (various sizes)"
