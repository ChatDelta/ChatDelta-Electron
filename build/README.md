# Icon Generation

The app icons need to be generated in different formats:

## Required formats:
- **icon.png**: 512x512 PNG for Linux
- **icon.ico**: Windows icon (includes multiple sizes: 16x16, 32x32, 48x48, 256x256)
- **icon.icns**: macOS icon (includes multiple sizes)

## How to generate:

1. Open `icon-generator.html` in a browser
2. Take a screenshot of the icon (512x512)
3. Use an online converter or tools to generate:
   - PNG to ICO converter for Windows
   - PNG to ICNS converter for macOS

## Temporary solution:
Currently using placeholder icons. For production, generate proper icons using:
- `electron-icon-builder` npm package
- Online converters like convertio.co
- Or design tools like Figma/Sketch

The icon features:
- Delta (Δ) symbol in gradient purple
- Three colored dots representing ChatGPT (green), Claude (purple), and Gemini (orange)
- Neumorphic design matching the app's style