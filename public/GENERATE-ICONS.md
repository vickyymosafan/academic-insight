# Generate PWA Icons

The PWA requires two icon files:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

## Quick Method (Browser-based)

1. Open `scripts/generate-icons.html` in your web browser
2. Click the "Download 192x192" and "Download 512x512" buttons
3. Move the downloaded files to this `public/` directory

## Alternative Methods

### Method 1: Online Tools
- Visit https://realfavicongenerator.net/
- Upload `icon-template.svg` or your own logo
- Download the generated icons
- Rename and place them in this directory

### Method 2: Design Software
- Open `icon-template.svg` in Figma, Illustrator, or Inkscape
- Export as PNG at 192x192 and 512x512 sizes
- Save as `icon-192x192.png` and `icon-512x512.png`

### Method 3: Command Line (requires ImageMagick)
```bash
# Install ImageMagick first
# Then run:
magick icon-template.svg -resize 192x192 icon-192x192.png
magick icon-template.svg -resize 512x512 icon-512x512.png
```

## Temporary Placeholder

For development purposes, you can use the SVG template directly, but PNG files are required for production PWA functionality.
