# Fonts Directory for ID Card Generation

This directory should contain Unicode fonts that support Hindi (Devanagari) and Gujarati scripts for proper rendering in PDF ID cards.

## Recommended Fonts

For proper Hindi/Gujarati text rendering in ID cards, download and place the following fonts in this directory:

### Option 1: Noto Sans (Recommended)
- **Noto Sans Gujarati**: https://fonts.google.com/noto/specimen/Noto+Sans+Gujarati
- **Noto Sans Devanagari**: https://fonts.google.com/noto/specimen/Noto+Sans+Devanagari

Download the Regular and Bold variants:
- `NotoSansGujarati-Regular.ttf`
- `NotoSansGujarati-Bold.ttf`
- `NotoSansDevanagari-Regular.ttf`
- `NotoSansDevanagari-Bold.ttf`

### Option 2: Mukta
- **Mukta**: https://fonts.google.com/specimen/Mukta
- Download Regular and Bold variants

### Option 3: Poppins (Limited Unicode support)
- **Poppins**: https://fonts.google.com/specimen/Poppins
- Has some Unicode support but may not cover all characters

## Installation Steps

1. Download the font files from Google Fonts
2. Extract the TTF files
3. Place them in this `fonts` directory
4. The ID card generator will automatically detect and use them

## Font Priority

The ID card generator checks fonts in this order:
1. NotoSansGujarati-Regular.ttf / NotoSansGujarati-Bold.ttf
2. NotoSansDevanagari-Regular.ttf / NotoSansDevanagari-Bold.ttf
3. Mukta-Regular.ttf / Mukta-Bold.ttf
4. Poppins-Regular.ttf

If no Unicode fonts are found, the system will fall back to Helvetica (which may not render Hindi/Gujarati correctly but won't crash).

## Note

Without Unicode fonts, Hindi and Gujarati text may appear as garbled characters. The system includes fallback mechanisms to prevent errors, but for proper rendering, Unicode fonts are required.
