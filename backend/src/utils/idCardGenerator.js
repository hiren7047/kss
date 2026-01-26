const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { uploadDir } = require('../config/env');

// ============================================================================
// KSS BRAND COLORS - Professional Classic Design
// ============================================================================
const COLORS = {
  white: [255, 255, 255],
  black: [0, 0, 0],
  darkRed: [139, 0, 0],          // Dark Red for professional look
  gold: [255, 215, 0],           // Gold for accents
  textDark: [50, 50, 50],        // Dark gray for text
  lightGray: [245, 245, 245]    // Light gray for backgrounds
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safe text - properly handles Unicode characters (Hindi, Gujarati, etc.)
 * Ensures proper encoding for PDFKit
 */
const safeText = (text) => {
  if (!text) return '';
  // Preserve all Unicode characters including Hindi, Gujarati, etc.
  // Only remove control characters that could break PDF
  const cleaned = String(text).replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
  return cleaned || '';
};

/**
 * Format date for Valid Until
 */
const formatValidUntil = (date) => {
  if (!date) {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 5);
    return futureDate;
  }
  return new Date(date);
};

/**
 * Format date to readable string
 */
const formatDateString = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  return '';
};

// ============================================================================
// MAIN ID CARD GENERATION FUNCTION - PROFESSIONAL CLASSIC DESIGN
// ============================================================================

/**
 * Generate Professional Member ID Card as PDF
 * Fixed: Unicode support, proper dimensions, single page, classic design
 * ID Card size: Standard ID card size (3.375" x 2.125" = 243 x 153 points)
 */
const generateIdCard = async (member) => {
  return new Promise((resolve, reject) => {
    try {
      // ========================================================================
      // SETUP: File paths and streams
      // ========================================================================
      const uploadsPath = path.resolve(uploadDir);
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }

      const safeMemberId = (member.memberId || 'member').replace(/[\/\\]/g, '_');
      const fileName = `idcard_${safeMemberId}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsPath, fileName);
      const stream = fs.createWriteStream(filePath);
      
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        reject(error);
      });

      // ========================================================================
      // CREATE PDF DOCUMENT - SINGLE PAGE, PORTRAIT ORIENTATION
      // ========================================================================
      // Standard ID card dimensions: 3.375" x 2.125" (Portrait)
      // In points: 243 x 153 (72 points per inch)
      const CARD_WIDTH = 243;    // 3.375 inches
      const CARD_HEIGHT = 153;   // 2.125 inches
      
      const doc = new PDFDocument({ 
        size: [CARD_WIDTH, CARD_HEIGHT], 
        margin: 0,
        layout: 'portrait',
        autoFirstPage: true,   // Auto-create first page
        bufferPages: false      // Don't buffer pages to avoid blank pages
      });
      
      doc.on('error', (error) => {
        console.error('PDF generation error:', error);
        reject(error);
      });
      
      // Pipe the document to the stream BEFORE drawing
      doc.pipe(stream);

      // ========================================================================
      // DESIGN CONSTANTS - PROFESSIONAL SPACING SYSTEM
      // ========================================================================
      const MARGIN = 8;                    // Outer margin
      const CONTENT_WIDTH = CARD_WIDTH - (MARGIN * 2);
      const SECTION_SPACING = 6;           // Space between sections
      
      // Calculate precise vertical positions
      let currentY = MARGIN;
      
      // Top section: Logo and branding
      const LOGO_SIZE = 20;
      const LOGO_Y = currentY;
      currentY += LOGO_SIZE + 3;
      
      // Hindi/Gujarati text below logo
      const HINDI_TEXT_Y = currentY;
      currentY += 8;
      
      // Organization name
      const ORG_NAME_Y = currentY;
      currentY += 10;
      
      // First separator line
      const SEPARATOR_1_Y = currentY;
      currentY += SECTION_SPACING;
      
      // Photo section (centered)
      const PHOTO_SIZE = 50;
      const PHOTO_Y = currentY;
      currentY += PHOTO_SIZE + 8;
      
      // Member name
      const NAME_Y = currentY;
      currentY += 12;
      
      // Member role
      const ROLE_Y = currentY;
      currentY += 10;
      
      // Second separator line
      const SEPARATOR_2_Y = currentY;
      currentY += SECTION_SPACING;
      
      // Bottom section: Signature and details
      const SIGNATURE_Y = currentY;
      currentY += 8;
      
      const ID_NUMBER_Y = currentY;
      currentY += 10;
      
      const VALID_UNTIL_Y = currentY;
      currentY += 10;
      
      // Final separator line
      const SEPARATOR_3_Y = currentY;

      // ========================================================================
      // BACKGROUND - PURE WHITE
      // ========================================================================
      doc.rect(0, 0, CARD_WIDTH, CARD_HEIGHT)
         .fillColor(COLORS.white)
         .fill();

      // ========================================================================
      // TOP SECTION - LOGO & BRANDING
      // ========================================================================
      const logoPath = path.join(__dirname, '../../referance_image/logo_kss-removebg-preview.png');
      const logoX = (CARD_WIDTH - LOGO_SIZE) / 2;
      
      // Logo - centered
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, logoX, LOGO_Y, {
            width: LOGO_SIZE,
            height: LOGO_SIZE,
            fit: [LOGO_SIZE, LOGO_SIZE]
          });
        } catch (error) {
          console.error('Error loading logo:', error);
        }
      }

      // Hindi/Gujarati text: "કૃષ્ણ સદા સહાયતે" or "कृष्णं सदा सहायते"
      // Try to use a Unicode-supporting font if available, otherwise use Helvetica
      doc.fillColor(COLORS.black)
         .fontSize(7);
      
      // Try to register and use a Unicode font for Devanagari/Gujarati
      // Check for common font paths that support Unicode
      const unicodeFontPaths = [
        path.join(__dirname, '../../fonts/NotoSansGujarati-Regular.ttf'),
        path.join(__dirname, '../../fonts/NotoSansDevanagari-Regular.ttf'),
        path.join(__dirname, '../../fonts/Mukta-Regular.ttf'),
        path.join(__dirname, '../../fonts/Poppins-Regular.ttf')
      ];
      
      let unicodeFontFound = false;
      let fontName = 'Helvetica';
      
      for (const fontPath of unicodeFontPaths) {
        if (fs.existsSync(fontPath)) {
          try {
            doc.registerFont('UnicodeFont', fontPath);
            doc.font('UnicodeFont');
            fontName = 'UnicodeFont';
            unicodeFontFound = true;
            break;
          } catch (error) {
            console.error('Error registering font:', fontPath, error);
          }
        }
      }
      
      if (!unicodeFontFound) {
        doc.font('Helvetica');
      }
      
      // Gujarati text (properly encoded Unicode)
      const gujaratiText = 'કૃષ્ણ સદા સહાયતે';
      try {
        // Ensure text is properly encoded
        const encodedText = Buffer.from(gujaratiText, 'utf8').toString('utf8');
        const gujaratiWidth = doc.widthOfString(encodedText);
        doc.text(encodedText, (CARD_WIDTH - gujaratiWidth) / 2, HINDI_TEXT_Y);
      } catch (error) {
        // Fallback: Use English text if Unicode rendering fails
        console.warn('Gujarati text rendering failed, using English fallback:', error);
        const fallbackText = 'Krishna Sada Sahayate';
        const fallbackWidth = doc.widthOfString(fallbackText);
        doc.text(fallbackText, (CARD_WIDTH - fallbackWidth) / 2, HINDI_TEXT_Y);
      }

      // Organization name - bold, prominent
      // Reset to standard font for English text
      if (unicodeFontFound) {
        // Try to use bold variant if available
        const boldFontPaths = [
          path.join(__dirname, '../../fonts/NotoSansGujarati-Bold.ttf'),
          path.join(__dirname, '../../fonts/NotoSansDevanagari-Bold.ttf'),
          path.join(__dirname, '../../fonts/Mukta-Bold.ttf')
        ];
        
        let boldFontFound = false;
        for (const fontPath of boldFontPaths) {
          if (fs.existsSync(fontPath)) {
            try {
              doc.registerFont('UnicodeFontBold', fontPath);
              doc.font('UnicodeFontBold');
              boldFontFound = true;
              break;
            } catch (error) {
              // Continue to next font
            }
          }
        }
        if (!boldFontFound && fontName !== 'Helvetica') {
          doc.font(fontName); // Use regular Unicode font
        }
      } else {
        doc.font('Helvetica-Bold');
      }
      
      doc.fontSize(9)
         .fillColor(COLORS.darkRed);
      
      const orgName = 'KSS - Krishna Sada Sahayate';
      const orgNameWidth = doc.widthOfString(orgName);
      
      // Check if text fits, if not split into two lines
      if (orgNameWidth > CONTENT_WIDTH) {
        const part1 = 'KSS - Krishna Sada';
        const part2 = 'Sahayate';
        const part1Width = doc.widthOfString(part1);
        const part2Width = doc.widthOfString(part2);
        doc.text(part1, (CARD_WIDTH - part1Width) / 2, ORG_NAME_Y);
        doc.text(part2, (CARD_WIDTH - part2Width) / 2, ORG_NAME_Y + 8);
      } else {
        doc.text(orgName, (CARD_WIDTH - orgNameWidth) / 2, ORG_NAME_Y);
      }

      // First separator line - gold, professional
      doc.strokeColor(COLORS.gold)
         .lineWidth(1.5)
         .moveTo(MARGIN, SEPARATOR_1_Y)
         .lineTo(CARD_WIDTH - MARGIN, SEPARATOR_1_Y)
         .stroke();

      // ========================================================================
      // PHOTO SECTION - CENTERED WITH GOLD BORDER
      // ========================================================================
      const PHOTO_X = (CARD_WIDTH - PHOTO_SIZE) / 2;
      
      // Gold border frame
      doc.strokeColor(COLORS.gold)
         .lineWidth(2)
         .rect(PHOTO_X, PHOTO_Y, PHOTO_SIZE, PHOTO_SIZE)
         .stroke();
      
      // Try to add actual photo
      let photoAdded = false;
      if (member.photo) {
        try {
          let photoPath;
          if (member.photo.startsWith('/uploads/')) {
            photoPath = path.join(uploadsPath, path.basename(member.photo));
          } else if (member.photo.startsWith('uploads/')) {
            photoPath = path.join(uploadsPath, path.basename(member.photo));
          } else {
            photoPath = path.join(uploadsPath, member.photo);
          }
          
          if (fs.existsSync(photoPath)) {
            try {
              doc.image(photoPath, PHOTO_X + 2, PHOTO_Y + 2, {
                width: PHOTO_SIZE - 4,
                height: PHOTO_SIZE - 4,
                fit: [PHOTO_SIZE - 4, PHOTO_SIZE - 4],
                align: 'center',
                valign: 'center'
              });
              photoAdded = true;
            } catch (imgError) {
              console.error('Error loading image file:', imgError);
            }
          }
        } catch (error) {
          console.error('Error adding photo to ID card:', error);
        }
      }
      
      // Placeholder if no photo
      if (!photoAdded) {
        doc.fillColor(COLORS.textDark)
           .fontSize(6)
           .font('Helvetica');
        const placeholderText = 'Photo';
        const textWidth = doc.widthOfString(placeholderText);
        doc.text(placeholderText, PHOTO_X + (PHOTO_SIZE - textWidth) / 2, PHOTO_Y + PHOTO_SIZE / 2 - 2);
      }

      // ========================================================================
      // MEMBER NAME - BOLD, PROMINENT, CENTERED
      // ========================================================================
      const fullName = [
        safeText(member.firstName || ''),
        safeText(member.middleName || ''),
        safeText(member.lastName || '')
      ].filter(Boolean).join(' ');
      
      doc.fillColor(COLORS.black)
         .fontSize(11)
         .font('Helvetica-Bold');
      
      // Smart text truncation with proper width calculation
      let displayName = fullName;
      const maxNameWidth = CONTENT_WIDTH - 4;
      let nameWidth = doc.widthOfString(displayName);
      
      if (nameWidth > maxNameWidth) {
        // Try to keep first and last name
        const nameParts = fullName.split(' ');
        if (nameParts.length > 2) {
          displayName = nameParts[0] + ' ' + nameParts[nameParts.length - 1];
          nameWidth = doc.widthOfString(displayName);
          if (nameWidth > maxNameWidth) {
            // Truncate with ellipsis
            while (nameWidth > maxNameWidth && displayName.length > 0) {
              displayName = displayName.slice(0, -1);
              nameWidth = doc.widthOfString(displayName + '...');
            }
            displayName = displayName + '...';
          }
        } else {
          // Single name, truncate
          while (nameWidth > maxNameWidth && displayName.length > 0) {
            displayName = displayName.slice(0, -1);
            nameWidth = doc.widthOfString(displayName + '...');
          }
          displayName = displayName + '...';
        }
      }
      
      const finalNameWidth = doc.widthOfString(displayName);
      doc.text(displayName, (CARD_WIDTH - finalNameWidth) / 2, NAME_Y);

      // ========================================================================
      // MEMBER ROLE - CENTERED, REGULAR FONT
      // ========================================================================
      const memberTypeLabels = {
        'volunteer': 'Volunteer',
        'donor': 'Donor',
        'beneficiary': 'Beneficiary',
        'core': 'Core Team Member'
      };
      
      const role = memberTypeLabels[member.memberType] || member.memberType || 'Member';
      // Use appropriate font for role
      if (unicodeFontFound) {
        doc.font(fontName);
      } else {
        doc.font('Helvetica');
      }
      
      doc.fontSize(8)
         .fillColor(COLORS.textDark);
      const roleWidth = doc.widthOfString(role);
      doc.text(role, (CARD_WIDTH - roleWidth) / 2, ROLE_Y);

      // Second separator line
      doc.strokeColor(COLORS.gold)
         .lineWidth(1.5)
         .moveTo(MARGIN, SEPARATOR_2_Y)
         .lineTo(CARD_WIDTH - MARGIN, SEPARATOR_2_Y)
         .stroke();

      // ========================================================================
      // BOTTOM SECTION - ID DETAILS & SIGNATURE
      // ========================================================================
      // Use standard font for bottom section (English text)
      doc.font('Helvetica')
         .fontSize(6.5)
         .fillColor(COLORS.black);

      // Authorized Signature - centered
      const sigLabel = 'Authorized Signature';
      const sigLabelWidth = doc.widthOfString(sigLabel);
      doc.text(sigLabel, (CARD_WIDTH - sigLabelWidth) / 2, SIGNATURE_Y);
      
      // Signature line - centered, proper length
      const sigLineLength = 50;
      const sigLineX = (CARD_WIDTH - sigLineLength) / 2;
      doc.strokeColor(COLORS.black)
         .lineWidth(0.5)
         .moveTo(sigLineX, SIGNATURE_Y + 6)
         .lineTo(sigLineX + sigLineLength, SIGNATURE_Y + 6)
         .stroke();

      // ID Number - left-aligned with proper spacing
      doc.font('Helvetica-Bold')
         .fontSize(6.5);
      const idLabel = 'ID Number:';
      const idLabelWidth = doc.widthOfString(idLabel);
      doc.text(idLabel, MARGIN, ID_NUMBER_Y);
      
      doc.font('Helvetica')
         .fillColor(COLORS.textDark);
      const idValue = safeText(member.memberId || '');
      doc.text(idValue, MARGIN + idLabelWidth + 3, ID_NUMBER_Y, {
        width: CONTENT_WIDTH - idLabelWidth - 3
      });

      // Valid Until - left-aligned with proper spacing
      doc.font('Helvetica-Bold')
         .fillColor(COLORS.black);
      const validLabel = 'Valid Until:';
      const validLabelWidth = doc.widthOfString(validLabel);
      doc.text(validLabel, MARGIN, VALID_UNTIL_Y);
      
      doc.font('Helvetica')
         .fillColor(COLORS.textDark);
      const validDate = formatValidUntil(member.validUntil || member.joinDate);
      const validDateStr = formatDateString(validDate);
      doc.text(validDateStr, MARGIN + validLabelWidth + 3, VALID_UNTIL_Y, {
        width: CONTENT_WIDTH - validLabelWidth - 3
      });

      // Final separator line
      doc.strokeColor(COLORS.gold)
         .lineWidth(1.5)
         .moveTo(MARGIN, SEPARATOR_3_Y)
         .lineTo(CARD_WIDTH - MARGIN, SEPARATOR_3_Y)
         .stroke();

      // ========================================================================
      // FINALIZE DOCUMENT - ENSURE SINGLE PAGE, NO BLANK PAGES
      // ========================================================================
      // Explicitly end the document to prevent extra pages
      doc.end();

      stream.on('finish', () => {
        const relativePath = `/uploads/${fileName}`;
        resolve(relativePath);
      });

      stream.on('error', (error) => {
        console.error('Stream error in ID card generation:', error);
        reject(error);
      });

      doc.on('error', (error) => {
        console.error('PDFDocument error:', error);
        if (!stream.destroyed) {
          stream.destroy();
        }
        reject(error);
      });
    } catch (error) {
      console.error('Error in generateIdCard:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateIdCard
};
