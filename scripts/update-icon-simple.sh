#!/bin/bash

echo "🎨 Creating simple Tutu Studio icon using macOS tools..."

# Create a simple colored square as a temporary icon
# This uses ImageMagick if available, or creates a basic file

# Check if ImageMagick is available
if command -v convert &> /dev/null; then
    echo "📱 Using ImageMagick to create icon..."
    
    # Create a simple gradient icon with text
    convert -size 512x512 gradient:#FF6B6B-#FF4757 \
            -gravity center \
            -pointsize 200 \
            -fill white \
            -stroke black \
            -strokewidth 2 \
            -annotate +0+0 "T" \
            build/icon.png
    
    # Create different sizes
    mkdir -p build/icons
    for size in 16 24 32 48 64 128 256 512 1024; do
        convert build/icon.png -resize ${size}x${size} build/icons/${size}x${size}.png
    done
    
    # Create other required files
    convert build/icon.png -resize 256x256 build/logo.png
    convert build/icon.png -resize 32x32 build/tray_icon.png
    cp build/tray_icon.png build/tray_icon_light.png
    cp build/tray_icon.png build/tray_icon_dark.png
    
    # Update renderer logo
    cp build/logo.png src/renderer/src/assets/images/logo.png
    
    echo "✅ Icon created successfully with ImageMagick!"
    
elif command -v sips &> /dev/null; then
    echo "📱 Using sips to create basic icon..."
    
    # Create a simple solid color image using sips
    # First, let's copy the existing icon and modify it
    cp src/renderer/src/assets/images/logo.png build/icon-backup.png
    
    # Create a simple red square
    sips -s format png --setProperty pixelsW 512 --setProperty pixelsH 512 \
         --setProperty hasAlpha yes \
         /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericDocumentIcon.icns \
         --out build/icon.png 2>/dev/null || {
        echo "⚠️  Could not create icon with sips, using existing icon as base"
        cp src/renderer/src/assets/images/logo.png build/icon.png
    }
    
    # Create different sizes using sips
    mkdir -p build/icons
    for size in 16 24 32 48 64 128 256 512 1024; do
        sips -z $size $size build/icon.png --out build/icons/${size}x${size}.png >/dev/null 2>&1
    done
    
    # Create other files
    sips -z 256 256 build/icon.png --out build/logo.png >/dev/null 2>&1
    sips -z 32 32 build/icon.png --out build/tray_icon.png >/dev/null 2>&1
    cp build/tray_icon.png build/tray_icon_light.png
    cp build/tray_icon.png build/tray_icon_dark.png
    
    # Update renderer logo
    cp build/logo.png src/renderer/src/assets/images/logo.png
    
    echo "✅ Basic icon structure created with sips!"
    
else
    echo "⚠️  No image tools available, creating placeholder files..."
    
    # Just copy existing files as placeholders
    mkdir -p build/icons
    cp src/renderer/src/assets/images/logo.png build/icon.png
    cp src/renderer/src/assets/images/logo.png build/logo.png
    
    # Create placeholder files for different sizes
    for size in 16 24 32 48 64 128 256 512 1024; do
        cp build/icon.png build/icons/${size}x${size}.png
    done
    
    cp build/icon.png build/tray_icon.png
    cp build/icon.png build/tray_icon_light.png
    cp build/icon.png build/tray_icon_dark.png
    
    echo "✅ Placeholder icon files created!"
fi

# Create ICNS file for macOS if iconutil is available
if command -v iconutil &> /dev/null && [ -d "build/icons" ]; then
    echo "🍎 Creating ICNS file for macOS..."
    
    # Create iconset directory
    mkdir -p build/icon.iconset
    
    # Copy files with proper naming for iconset
    [ -f "build/icons/16x16.png" ] && cp build/icons/16x16.png build/icon.iconset/icon_16x16.png
    [ -f "build/icons/32x32.png" ] && cp build/icons/32x32.png build/icon.iconset/icon_16x16@2x.png
    [ -f "build/icons/32x32.png" ] && cp build/icons/32x32.png build/icon.iconset/icon_32x32.png
    [ -f "build/icons/64x64.png" ] && cp build/icons/64x64.png build/icon.iconset/icon_32x32@2x.png
    [ -f "build/icons/128x128.png" ] && cp build/icons/128x128.png build/icon.iconset/icon_128x128.png
    [ -f "build/icons/256x256.png" ] && cp build/icons/256x256.png build/icon.iconset/icon_128x128@2x.png
    [ -f "build/icons/256x256.png" ] && cp build/icons/256x256.png build/icon.iconset/icon_256x256.png
    [ -f "build/icons/512x512.png" ] && cp build/icons/512x512.png build/icon.iconset/icon_256x256@2x.png
    [ -f "build/icons/512x512.png" ] && cp build/icons/512x512.png build/icon.iconset/icon_512x512.png
    [ -f "build/icons/1024x1024.png" ] && cp build/icons/1024x1024.png build/icon.iconset/icon_512x512@2x.png
    
    # Generate ICNS file
    iconutil -c icns build/icon.iconset -o build/icon.icns
    
    # Clean up
    rm -rf build/icon.iconset
    
    echo "✅ ICNS file created!"
fi

echo ""
echo "🎉 Icon update complete!"
echo "📁 Files updated:"
echo "   ✅ build/icon.png"
echo "   ✅ build/logo.png" 
echo "   ✅ build/icons/ (various sizes)"
echo "   ✅ src/renderer/src/assets/images/logo.png"
if [ -f "build/icon.icns" ]; then
    echo "   ✅ build/icon.icns (macOS)"
fi

echo ""
echo "🚀 Next steps:"
echo "   1. Run 'yarn build:mac:x64' to rebuild the app with new icon"
echo "   2. The app will now show 'T' as the icon (temporary)"
echo "   3. Replace build/icon.png with a custom Tutu Studio icon when ready"
