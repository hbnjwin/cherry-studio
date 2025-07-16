#!/usr/bin/env python3
"""
Simple script to create a temporary Tutu Studio icon using Python PIL
"""

import os
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ PIL (Pillow) not found. Installing...")
    os.system("pip3 install Pillow")
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        print("❌ Failed to install Pillow. Please install manually: pip3 install Pillow")
        sys.exit(1)

def create_tutu_icon():
    # Create a 512x512 image with gradient background
    size = 512
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    # Create a circular background with gradient effect
    center = size // 2
    radius = 240

    # Draw multiple circles for gradient effect
    for i in range(radius, 0, -5):
        # Calculate color based on radius
        ratio = i / radius
        r = int(255 * (0.4 + 0.2 * ratio))  # Red component
        g = int(107 * (0.4 + 0.6 * ratio))  # Green component
        b = int(107 * (0.4 + 0.6 * ratio))  # Blue component

        draw.ellipse([center-i, center-i, center+i, center+i],
                    fill=(r, g, b, 255))

    # Try to use a system font, fallback to default
    try:
        # Try to find a bold system font
        font_size = 200
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
    except:
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()

    # Draw the letter "T"
    text = "T"

    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Calculate position to center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - 20  # Slightly higher

    # Draw text with shadow
    shadow_offset = 4
    draw.text((x + shadow_offset, y + shadow_offset), text,
              fill=(0, 0, 0, 128), font=font)  # Shadow
    draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)  # Main text

    return image

def main():
    print("🎨 Creating Tutu Studio icon...")

    # Create the icon
    icon = create_tutu_icon()

    # Save in different sizes
    sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024]

    # Create icons directory
    os.makedirs("build/icons", exist_ok=True)

    for size in sizes:
        resized = icon.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(f"build/icons/{size}x{size}.png")
        print(f"✅ Created {size}x{size}.png")

    # Save main icon files
    icon.save("build/icon.png")
    icon.resize((256, 256), Image.Resampling.LANCZOS).save("build/logo.png")
    icon.resize((32, 32), Image.Resampling.LANCZOS).save("build/tray_icon.png")
    icon.resize((32, 32), Image.Resampling.LANCZOS).save("build/tray_icon_light.png")
    icon.resize((32, 32), Image.Resampling.LANCZOS).save("build/tray_icon_dark.png")

    # Also update the renderer logo
    icon.resize((256, 256), Image.Resampling.LANCZOS).save("src/renderer/src/assets/images/logo.png")

    print("✅ Icon creation complete!")
    print("📁 Created files:")
    print("   - build/icon.png (main icon)")
    print("   - build/logo.png (logo)")
    print("   - build/icons/ (various sizes)")
    print("   - src/renderer/src/assets/images/logo.png (updated)")

if __name__ == "__main__":
    main()
