#!/usr/bin/env python3
"""
Convert SVG to various icon formats for Tutu Studio
"""

import os
import sys
import subprocess
import tempfile

def run_command(cmd):
    """Run a shell command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {cmd}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command: {cmd}")
        print(f"Exception: {e}")
        return False

def convert_svg_to_png():
    """Convert SVG to PNG using various methods"""
    svg_file = "build/tutu-logo.svg"
    
    if not os.path.exists(svg_file):
        print(f"❌ SVG file not found: {svg_file}")
        return False
    
    print("🎨 Converting SVG to PNG icons...")
    
    # Create output directories
    os.makedirs("build/icons", exist_ok=True)
    
    # Try different conversion methods
    methods = [
        # Method 1: rsvg-convert (if available)
        lambda size, output: run_command(f"rsvg-convert -w {size} -h {size} {svg_file} > {output}"),
        # Method 2: inkscape (if available)
        lambda size, output: run_command(f"inkscape -w {size} -h {size} {svg_file} -o {output}"),
        # Method 3: ImageMagick convert (if available)
        lambda size, output: run_command(f"convert -background transparent -size {size}x{size} {svg_file} {output}"),
        # Method 4: cairosvg (Python library, if available)
        lambda size, output: convert_with_cairosvg(svg_file, output, size)
    ]
    
    # Test which method works
    test_output = "build/test_icon.png"
    working_method = None
    
    for i, method in enumerate(methods):
        print(f"🔍 Testing conversion method {i+1}...")
        if method(512, test_output):
            if os.path.exists(test_output) and os.path.getsize(test_output) > 0:
                working_method = method
                print(f"✅ Method {i+1} works!")
                os.remove(test_output)
                break
            elif os.path.exists(test_output):
                os.remove(test_output)
    
    if not working_method:
        print("❌ No working conversion method found. Trying manual approach...")
        return create_fallback_icons()
    
    # Generate all required sizes
    sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
    
    for size in sizes:
        output_file = f"build/icons/{size}x{size}.png"
        if working_method(size, output_file):
            print(f"✅ Created {size}x{size}.png")
        else:
            print(f"❌ Failed to create {size}x{size}.png")
    
    # Create main icon files
    working_method(512, "build/icon.png")
    working_method(256, "build/logo.png")
    working_method(32, "build/tray_icon.png")
    
    # Copy tray icons
    if os.path.exists("build/tray_icon.png"):
        run_command("cp build/tray_icon.png build/tray_icon_light.png")
        run_command("cp build/tray_icon.png build/tray_icon_dark.png")
    
    # Update renderer logo
    if os.path.exists("build/logo.png"):
        run_command("cp build/logo.png src/renderer/src/assets/images/logo.png")
    
    return True

def convert_with_cairosvg(svg_file, output_file, size):
    """Try to convert using cairosvg Python library"""
    try:
        import cairosvg
        cairosvg.svg2png(url=svg_file, write_to=output_file, output_width=size, output_height=size)
        return True
    except ImportError:
        return False
    except Exception:
        return False

def create_fallback_icons():
    """Create fallback icons using Python PIL if available"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        print("📱 Creating fallback icons with PIL...")
        
        # Create a simple icon
        sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
        
        for size in sizes:
            # Create image with gradient background
            img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # Draw gradient circle
            center = size // 2
            radius = int(size * 0.47)
            
            # Create gradient effect with multiple circles
            for i in range(radius, 0, -2):
                ratio = i / radius
                r = int(255 * (0.4 + 0.3 * ratio))
                g = int(107 * (0.4 + 0.6 * ratio))
                b = int(107 * (0.4 + 0.6 * ratio))
                alpha = int(255 * (0.8 + 0.2 * ratio))
                
                draw.ellipse([center-i, center-i, center+i, center+i], 
                           fill=(r, g, b, alpha))
            
            # Draw letter T
            font_size = int(size * 0.6)
            try:
                # Try to use system font
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", font_size)
            except:
                try:
                    font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
                except:
                    font = ImageFont.load_default()
            
            text = "T"
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            x = (size - text_width) // 2
            y = (size - text_height) // 2 - int(size * 0.05)
            
            # Draw text shadow
            shadow_offset = max(1, size // 128)
            draw.text((x + shadow_offset, y + shadow_offset), text, 
                     fill=(0, 0, 0, 128), font=font)
            # Draw main text
            draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
            
            # Save image
            output_file = f"build/icons/{size}x{size}.png"
            img.save(output_file, "PNG")
            print(f"✅ Created fallback {size}x{size}.png")
        
        # Create main files
        img_512 = Image.open("build/icons/512x512.png")
        img_512.save("build/icon.png")
        
        img_256 = img_512.resize((256, 256), Image.Resampling.LANCZOS)
        img_256.save("build/logo.png")
        img_256.save("src/renderer/src/assets/images/logo.png")
        
        img_32 = img_512.resize((32, 32), Image.Resampling.LANCZOS)
        img_32.save("build/tray_icon.png")
        img_32.save("build/tray_icon_light.png")
        img_32.save("build/tray_icon_dark.png")
        
        return True
        
    except ImportError:
        print("❌ PIL not available for fallback icons")
        return False
    except Exception as e:
        print(f"❌ Error creating fallback icons: {e}")
        return False

def create_icns_file():
    """Create ICNS file for macOS"""
    if not run_command("which iconutil"):
        print("⚠️  iconutil not found, skipping ICNS creation")
        return False
    
    print("🍎 Creating ICNS file for macOS...")
    
    # Create iconset directory
    iconset_dir = "build/icon.iconset"
    os.makedirs(iconset_dir, exist_ok=True)
    
    # Copy files with proper naming
    icon_mappings = [
        ("16x16.png", "icon_16x16.png"),
        ("32x32.png", "icon_16x16@2x.png"),
        ("32x32.png", "icon_32x32.png"),
        ("64x64.png", "icon_32x32@2x.png"),
        ("128x128.png", "icon_128x128.png"),
        ("256x256.png", "icon_128x128@2x.png"),
        ("256x256.png", "icon_256x256.png"),
        ("512x512.png", "icon_256x256@2x.png"),
        ("512x512.png", "icon_512x512.png"),
        ("1024x1024.png", "icon_512x512@2x.png"),
    ]
    
    for src, dst in icon_mappings:
        src_path = f"build/icons/{src}"
        dst_path = f"{iconset_dir}/{dst}"
        if os.path.exists(src_path):
            run_command(f"cp {src_path} {dst_path}")
    
    # Generate ICNS file
    if run_command(f"iconutil -c icns {iconset_dir} -o build/icon.icns"):
        print("✅ ICNS file created successfully")
        # Clean up
        run_command(f"rm -rf {iconset_dir}")
        return True
    else:
        print("❌ Failed to create ICNS file")
        return False

def main():
    print("🎨 Converting Tutu Studio SVG logo to icons...")
    
    # Convert SVG to PNG
    if not convert_svg_to_png():
        print("❌ Failed to convert SVG to PNG")
        return 1
    
    # Create ICNS file for macOS
    create_icns_file()
    
    print("\n🎉 Icon conversion complete!")
    print("📁 Generated files:")
    print("   ✅ build/icon.png (main icon)")
    print("   ✅ build/logo.png (logo)")
    print("   ✅ build/icons/ (various sizes)")
    print("   ✅ src/renderer/src/assets/images/logo.png (updated)")
    if os.path.exists("build/icon.icns"):
        print("   ✅ build/icon.icns (macOS)")
    
    print("\n🚀 Next step: Run 'yarn build:mac:x64' to rebuild with new icons")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
