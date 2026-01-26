const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const JsBarcode = require('jsbarcode');
const { uploadDir } = require('../config/env');

// ============================================================================
// KSS BRAND COLORS
// ============================================================================
const COLORS = {
  red: [220, 20, 60],           // Crimson Red #DC143C
  darkRed: [139, 0, 0],         // Dark Red #8B0000
  gold: [255, 215, 0],          // Gold #FFD700
  white: [255, 255, 255],       // White
  black: [0, 0, 0],             // Black
  textDark: [50, 50, 50],       // Dark text
  lightGray: [245, 245, 245]    // Light gray for backgrounds
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate barcode image as base64
 */
const generateBarcode = (data) => {
  try {
    const canvas = createCanvas(200, 80);
    JsBarcode(canvas, data, {
      format: 'CODE128',
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 14,
      margin: 5
    });
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Barcode generation error:', error);
    return null;
  }
};

/**
 * Safe text - preserves Unicode characters (Hindi, Gujarati, etc.)
 * Only removes control characters that could break PDF
 */
const safeText = (text) => {
  if (!text) return '';
  // Preserve all Unicode characters including Hindi, Gujarati, etc.
  // Only remove control characters (except newlines and tabs)
  return String(text).replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim() || '';
};

/**
 * Safe date creation helper
 */
const safeDate = () => {
  try {
    if (typeof Date !== 'undefined' && typeof Date === 'function') {
      const date = new Date();
      if (date && !isNaN(date.getTime())) {
        return date;
      }
    }
  } catch (error) {
    console.error('Error creating date:', error);
  }
  return new Date('2026-01-01');
};

/**
 * Format date to Indian format (DD/MM/YYYY)
 */
const formatDate = (date) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  return '';
};

/**
 * Format Aadhaar number (XXXX-XXXX-XXXX)
 */
const formatAadhaar = (aadhar) => {
  if (!aadhar) return '';
  const cleaned = String(aadhar).replace(/\D/g, '');
  if (cleaned.length === 12) {
    return `${cleaned.substring(0,4)}-${cleaned.substring(4,8)}-${cleaned.substring(8,12)}`;
  }
  return cleaned;
};

// ============================================================================
// MAIN PDF GENERATION FUNCTION
// ============================================================================

/**
 * Generate Professional Member Registration Form PDF
 * Fixed: Unicode support, proper page breaks, professional layout
 */
const generateRegistrationForm = async (member) => {
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
      const fileName = `registration_${safeMemberId}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsPath, fileName);
      const stream = fs.createWriteStream(filePath);
      
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        reject(error);
      });

      // ========================================================================
      // CREATE PDF DOCUMENT
      // ========================================================================
      const doc = new PDFDocument({ 
        margin: 0,  // We'll handle margins manually
        size: 'A4',
        autoFirstPage: true,
        bufferPages: false
      });
      
      doc.on('error', (error) => {
        console.error('PDF generation error:', error);
        reject(error);
      });
      
      doc.pipe(stream);

      // ========================================================================
      // CONSTANTS
      // ========================================================================
      const PAGE_MARGIN = 25;
      const PAGE_WIDTH = doc.page.width;
      const PAGE_HEIGHT = doc.page.height;
      const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2);
      const FOOTER_HEIGHT = 40;
      const HEADER_HEIGHT = 100;
      const MAX_CONTENT_HEIGHT = PAGE_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;
      
      let pageNumber = 1;
      const docId = safeText(member.memberId || 'KSS/VOL/2026/1');
      let currentY = PAGE_MARGIN;

      // ========================================================================
      // HELPER: Check if we need a new page
      // ========================================================================
      const checkPageBreak = (requiredHeight) => {
        const availableHeight = PAGE_HEIGHT - currentY - FOOTER_HEIGHT;
        if (availableHeight < requiredHeight) {
          // Draw footer on current page
          drawFooter();
          // Add new page
          doc.addPage();
          pageNumber++;
          drawBackgroundLogo();
          currentY = drawKSSHeader();
          drawDocNumber(PAGE_MARGIN + 5);
          return true;
        }
        return false;
      };

      // ========================================================================
      // HELPER: Draw background logo watermark
      // ========================================================================
      const drawBackgroundLogo = () => {
        const logoPath = path.join(__dirname, '../../referance_image/logo_kss-removebg-preview.png');
        if (fs.existsSync(logoPath)) {
          try {
            const logoSize = 200;
            const centerX = PAGE_WIDTH / 2;
            const centerY = PAGE_HEIGHT / 2;
            
            doc.save();
            doc.opacity(0.05);
            doc.image(logoPath, centerX - logoSize/2, centerY - logoSize/2, {
              width: logoSize,
              height: logoSize,
              fit: [logoSize, logoSize]
            });
            doc.restore();
          } catch (error) {
            console.error('Error drawing background logo:', error);
          }
        }
      };

      // ========================================================================
      // HELPER: Draw footer on every page
      // ========================================================================
      const drawFooter = () => {
        const footerY = PAGE_HEIGHT - FOOTER_HEIGHT + 10;
        
        // Footer line
        doc.strokeColor(COLORS.darkRed)
           .lineWidth(0.5)
           .moveTo(PAGE_MARGIN, footerY - 5)
           .lineTo(PAGE_WIDTH - PAGE_MARGIN, footerY - 5)
           .stroke();
        
        // Page number (left)
        doc.fillColor(COLORS.textDark)
           .fontSize(9)
           .font('Helvetica');
        doc.text(`Page ${pageNumber}`, PAGE_MARGIN, footerY);
        
        // Document ID (right)
        const docIdText = `Doc ID: ${docId}`;
        const docIdWidth = doc.widthOfString(docIdText);
        doc.text(docIdText, PAGE_WIDTH - PAGE_MARGIN - docIdWidth, footerY);
        
        // Disclaimer (center)
        const disclaimer = 'This is a computer-generated document. For official purposes, please contact KSS - Krishna Sada Sahayate.';
        doc.fillColor(COLORS.textDark)
           .fontSize(7)
           .font('Helvetica-Oblique');
        const disclaimerWidth = doc.widthOfString(disclaimer);
        doc.text(disclaimer, PAGE_WIDTH/2 - disclaimerWidth/2, footerY + 12);
      };

      // ========================================================================
      // HELPER: Draw document number at top right
      // ========================================================================
      const drawDocNumber = (y) => {
        try {
          doc.fillColor(COLORS.darkRed)
             .fontSize(10)
             .font('Helvetica-Bold');
          const docNumberText = `Document No.: ${docId}`;
          const docNumberWidth = doc.widthOfString(docNumberText);
          const docNumberX = PAGE_WIDTH - PAGE_MARGIN - docNumberWidth;
          doc.text(docNumberText, docNumberX, y);
        } catch (error) {
          console.error('Error drawing document number:', error);
        }
      };

      // ========================================================================
      // HELPER: Draw KSS Header (Logo + Text + Subtitle)
      // ========================================================================
      const drawKSSHeader = () => {
        const logoPath = path.join(__dirname, '../../referance_image/logo_kss-removebg-preview.png');
        const logoX = PAGE_MARGIN;
        const logoY = PAGE_MARGIN;
        const logoWidth = 65;
        const logoHeight = 65;
        
        // Draw logo image
        if (fs.existsSync(logoPath)) {
          try {
            doc.image(logoPath, logoX, logoY, { 
              width: logoWidth, 
              height: logoHeight, 
              fit: [logoWidth, logoHeight] 
            });
          } catch (error) {
            console.error('Error loading logo image:', error);
          }
        }
        
        // Organization name and subtitle
        const textX = logoX + logoWidth + 12;
        doc.fillColor(COLORS.darkRed)
           .fontSize(12)
           .font('Helvetica-Bold');
        doc.text('Krishna Sada Sahayate', textX, logoY + 5);
        
        doc.fillColor(COLORS.darkRed)
           .fontSize(10)
           .font('Helvetica-Oblique');
        doc.text('Where Compassion Becomes Dharma', textX, logoY + 20);
        
        doc.fillColor(COLORS.darkRed)
           .fontSize(9)
           .font('Helvetica');
        doc.text('Vadodara, Gujarat, India', textX, logoY + 33);
        
        return logoY + logoHeight + 15;
      };

      // ========================================================================
      // HELPER: Draw form field with label, value, and red underline
      // ========================================================================
      const drawFormField = (label, value, x, y, width, isMultiline = false) => {
        const lineHeight = 12;
        const fieldSpacing = 3;
        
        // Label
        doc.fillColor(COLORS.textDark)
           .fontSize(9)
           .font('Helvetica');
        doc.text(label, x, y);
        
        // Value
        const valueY = y + lineHeight;
        if (value) {
          doc.fillColor(COLORS.black)
             .fontSize(10)
             .font('Helvetica-Bold');
          if (isMultiline) {
            const textHeight = doc.heightOfString(value, { width: width - 10 });
            doc.text(value, x + 5, valueY, { width: width - 10 });
            const underlineY = valueY + textHeight + fieldSpacing;
            doc.strokeColor(COLORS.red)
               .lineWidth(0.8)
               .moveTo(x, underlineY)
               .lineTo(x + width, underlineY)
               .stroke();
            return underlineY + 8;
          } else {
            doc.text(value, x + 5, valueY);
            const underlineY = valueY + lineHeight + fieldSpacing;
            doc.strokeColor(COLORS.red)
               .lineWidth(0.8)
               .moveTo(x, underlineY)
               .lineTo(x + width, underlineY)
               .stroke();
            return underlineY + 8;
          }
        } else {
          // Empty field - just underline
          const underlineY = valueY + lineHeight + fieldSpacing;
          doc.strokeColor(COLORS.red)
             .lineWidth(0.8)
             .moveTo(x, underlineY)
             .lineTo(x + width, underlineY)
             .stroke();
          return underlineY + 8;
        }
      };

      // ========================================================================
      // HELPER: Draw checkbox
      // ========================================================================
      const drawCheckbox = (x, y, checked = false) => {
        const boxSize = 10;
        doc.rect(x, y, boxSize, boxSize)
           .strokeColor(COLORS.darkRed)
           .lineWidth(1.2)
           .stroke();
        
        if (checked) {
          doc.rect(x + 1.5, y + 1.5, boxSize - 3, boxSize - 3)
             .fillColor(COLORS.red)
             .fill();
          doc.fillColor(COLORS.white)
             .fontSize(8)
             .font('Helvetica-Bold')
             .text('✓', x + 2, y + 1);
        }
      };

      // ========================================================================
      // PAGE 1: PERSONAL INFORMATION
      // ========================================================================
      drawBackgroundLogo();
      currentY = drawKSSHeader();
      drawDocNumber(PAGE_MARGIN + 5);

      // Page Title
      doc.fillColor(COLORS.darkRed)
         .fontSize(16)
         .font('Helvetica-Bold');
      const page1Title = 'VOLUNTEER REGISTRATION FORM';
      const title1Width = doc.widthOfString(page1Title);
      doc.text(page1Title, PAGE_WIDTH/2 - title1Width/2, currentY);
      currentY += 30;

      // Section divider
      doc.strokeColor(COLORS.darkRed)
         .lineWidth(1)
         .moveTo(PAGE_MARGIN, currentY)
         .lineTo(PAGE_WIDTH - PAGE_MARGIN, currentY)
         .stroke();
      currentY += 15;

      // --- Personal Information Section ---
      doc.fillColor(COLORS.darkRed)
         .fontSize(12)
         .font('Helvetica-Bold');
      doc.text('1. Personal Information', PAGE_MARGIN, currentY);
      currentY += 20;

      // Full Name (As per Aadhaar)
      const fullName = [
        safeText(member.firstName || ''),
        safeText(member.middleName || ''),
        safeText(member.lastName || '')
      ].filter(Boolean).join(' ');
      
      checkPageBreak(30);
      currentY = drawFormField(
        'Full Name (As per Aadhaar):',
        fullName,
        PAGE_MARGIN, currentY, CONTENT_WIDTH - 140
      );
      currentY += 3;

      // Father's / Husband's Name
      checkPageBreak(30);
      currentY = drawFormField(
        "Father's / Husband's Name:",
        safeText(member.parentsName || ''),
        PAGE_MARGIN, currentY, CONTENT_WIDTH - 140
      );
      currentY += 3;

      // Date of Birth and Age (same line)
      checkPageBreak(30);
      const dobY = currentY;
      const dobValue = formatDate(member.dateOfBirth);
      currentY = drawFormField('Date of Birth:', dobValue, PAGE_MARGIN, currentY, 180);
      const ageValue = member.age ? String(member.age) : '';
      drawFormField('Age:', ageValue, PAGE_MARGIN + 200, dobY, 120);
      currentY = Math.max(currentY, dobY + 25);
      currentY += 3;

      // Gender checkboxes
      checkPageBreak(25);
      doc.fillColor(COLORS.textDark)
         .fontSize(9)
         .font('Helvetica');
      doc.text('Gender:', PAGE_MARGIN, currentY);
      const genderX = PAGE_MARGIN + 80;
      doc.text('Male', genderX, currentY);
      drawCheckbox(genderX + 35, currentY - 2, member.gender === 'male');
      doc.text('Female', genderX + 60, currentY);
      drawCheckbox(genderX + 105, currentY - 2, member.gender === 'female');
      doc.text('Other', genderX + 140, currentY);
      drawCheckbox(genderX + 175, currentY - 2, member.gender === 'other');
      currentY += 25;

      // --- Contact Information Section ---
      checkPageBreak(50);
      doc.fillColor(COLORS.darkRed)
         .fontSize(12)
         .font('Helvetica-Bold');
      doc.text('2. Contact Information', PAGE_MARGIN, currentY);
      currentY += 20;

      // Mobile No.
      checkPageBreak(30);
      currentY = drawFormField(
        'Mobile No.:',
        safeText(member.mobile || ''),
        PAGE_MARGIN, currentY, 220
      );
      currentY += 3;

      // WhatsApp No.
      checkPageBreak(30);
      currentY = drawFormField(
        'WhatsApp No.:',
        safeText(member.whatsappNumber || member.mobile || ''),
        PAGE_MARGIN, currentY, 220
      );
      currentY += 3;

      // Email ID
      checkPageBreak(30);
      currentY = drawFormField(
        'Email ID (if any):',
        safeText(member.email || ''),
        PAGE_MARGIN, currentY, CONTENT_WIDTH - 140
      );
      currentY += 20;

      // --- Address Information Section ---
      checkPageBreak(60);
      doc.fillColor(COLORS.darkRed)
         .fontSize(12)
         .font('Helvetica-Bold');
      doc.text('3. Address Information', PAGE_MARGIN, currentY);
      currentY += 20;

      // Full Residential Address
      checkPageBreak(50);
      const addressStreet = member.address?.street || '';
      currentY = drawFormField(
        'Full Residential Address:',
        safeText(addressStreet),
        PAGE_MARGIN, currentY, CONTENT_WIDTH - 140, true
      );
      currentY += 3;

      // City and State (same line)
      checkPageBreak(30);
      const cityY = currentY;
      currentY = drawFormField(
        'City:',
        safeText(member.address?.city || ''),
        PAGE_MARGIN, currentY, 200
      );
      drawFormField(
        'State:',
        safeText(member.address?.state || ''),
        PAGE_MARGIN + 220, cityY, 200
      );
      currentY = Math.max(currentY, cityY + 25);
      currentY += 20;

      // --- Identification & Photograph Section ---
      checkPageBreak(120);
      doc.fillColor(COLORS.darkRed)
         .fontSize(12)
         .font('Helvetica-Bold');
      doc.text('4. Identification & Photograph', PAGE_MARGIN, currentY);
      currentY += 20;

      // ID Proof Submitted
      checkPageBreak(30);
      const idProofType = member.idProofType || (member.aadharNumber ? 'Aadhaar' : '');
      currentY = drawFormField(
        'ID Proof Submitted:',
        safeText(idProofType),
        PAGE_MARGIN, currentY, 200
      );
      currentY += 3;

      // Aadhaar No.
      checkPageBreak(30);
      const formattedAadhar = formatAadhaar(member.aadharNumber);
      currentY = drawFormField(
        'Aadhaar No.:',
        formattedAadhar,
        PAGE_MARGIN, currentY, 250
      );
      currentY += 5;

      // Photo placeholder (right side)
      const photoX = PAGE_WIDTH - PAGE_MARGIN - 120;
      const photoY = currentY - 90;
      
      // Photo frame with border
      doc.rect(photoX, photoY, 115, 145)
         .fillColor(COLORS.lightGray)
         .fill()
         .strokeColor(COLORS.darkRed)
         .lineWidth(1.5)
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
              doc.image(photoPath, photoX + 5, photoY + 5, {
                width: 105,
                height: 135,
                fit: [105, 135],
                align: 'center',
                valign: 'center'
              });
              photoAdded = true;
            } catch (imgError) {
              console.error('Error loading image file:', imgError);
            }
          }
        } catch (error) {
          console.error('Error adding photo to PDF:', error);
        }
      }
      
      // Placeholder text if no photo
      if (!photoAdded) {
        doc.fillColor(COLORS.textDark)
           .fontSize(8)
           .font('Helvetica');
        const placeholderText = 'Passport Size\nPhotograph';
        const textWidth = doc.widthOfString('Passport Size');
        doc.text(placeholderText, photoX + (115 - textWidth)/2, photoY + 55);
      }
      
      // Photo label
      doc.fillColor(COLORS.textDark)
         .fontSize(8)
         .font('Helvetica');
      doc.text(photoAdded ? '✓ Photo Attached' : '□ Photo Attached', photoX + 20, photoY + 125);
      
      // Footer for page 1
      drawFooter();

      // ========================================================================
      // PAGE 2: VOLUNTEER INTEREST DETAILS
      // ========================================================================
      doc.addPage();
      pageNumber = 2;
      
      drawBackgroundLogo();
      currentY = drawKSSHeader();
      drawDocNumber(PAGE_MARGIN + 5);

      // Page Title
      doc.fillColor(COLORS.darkRed)
         .fontSize(16)
         .font('Helvetica-Bold');
      const page2Title = 'VOLUNTEER INTEREST DETAILS';
      const title2Width = doc.widthOfString(page2Title);
      doc.text(page2Title, PAGE_WIDTH/2 - title2Width/2, currentY);
      currentY += 30;

      // Section divider
      doc.strokeColor(COLORS.darkRed)
         .lineWidth(1)
         .moveTo(PAGE_MARGIN, currentY)
         .lineTo(PAGE_WIDTH - PAGE_MARGIN, currentY)
         .stroke();
      currentY += 15;

      // --- Area of Interest ---
      doc.fillColor(COLORS.darkRed)
         .fontSize(12)
         .font('Helvetica-Bold');
      doc.text('5. Area of Interest (Tick✔):', PAGE_MARGIN, currentY);
      currentY += 20;

      const interests = [
        'Social Service',
        'Blood Donation Camps',
        'Women Empowerment',
        'Education & Awareness',
        'Medical/Health Camps',
        'Event Management',
        'Religious & Cultural Activities'
      ];

      interests.forEach((interest) => {
        checkPageBreak(20);
        const checkX = PAGE_MARGIN + 10;
        const textX = PAGE_MARGIN + 25;
        const isChecked = member.interests && 
          Array.isArray(member.interests) && 
          member.interests.some(i => i.toLowerCase() === interest.toLowerCase());
        drawCheckbox(checkX, currentY - 2, isChecked);
        doc.fillColor(COLORS.textDark)
           .fontSize(9)
           .font('Helvetica');
        doc.text(interest, textX, currentY);
        currentY += 18;
      });

      // Other option
      checkPageBreak(25);
      doc.fillColor(COLORS.textDark)
         .fontSize(9)
         .font('Helvetica');
      doc.text('Other:', PAGE_MARGIN + 10, currentY);
      doc.strokeColor(COLORS.red)
         .lineWidth(0.8)
         .moveTo(PAGE_MARGIN + 50, currentY + 10)
         .lineTo(PAGE_WIDTH - PAGE_MARGIN - 50, currentY + 10)
         .stroke();
      currentY += 25;

      // --- Availability ---
      checkPageBreak(50);
      doc.fillColor(COLORS.darkRed)
         .fontSize(12)
         .font('Helvetica-Bold');
      doc.text('6. Availability:', PAGE_MARGIN, currentY);
      currentY += 20;

      const availabilityOptions = [
        { label: 'Full-Time', value: 'full-time' },
        { label: 'Part-Time', value: 'part-time' },
        { label: 'Event-Based', value: 'event-based' }
      ];
      
      availabilityOptions.forEach((option) => {
        checkPageBreak(20);
        const isChecked = member.availability && 
          member.availability.toLowerCase() === option.value.toLowerCase();
        drawCheckbox(PAGE_MARGIN + 10, currentY - 2, isChecked);
        doc.fillColor(COLORS.textDark)
           .fontSize(9)
           .font('Helvetica');
        doc.text(option.label, PAGE_MARGIN + 25, currentY);
        currentY += 18;
      });
      currentY += 10;
      
      // --- Emergency Contact Details ---
      checkPageBreak(100);
      // Add separator line
      doc.strokeColor(COLORS.red)
         .lineWidth(0.5)
         .moveTo(PAGE_MARGIN, currentY)
         .lineTo(PAGE_WIDTH - PAGE_MARGIN, currentY)
         .stroke();
      currentY += 15;

      doc.fillColor(COLORS.darkRed)
         .fontSize(14)
         .font('Helvetica-Bold');
      const emergencyTitle = '7. EMERGENCY CONTACT DETAILS';
      const emergencyTitleWidth = doc.widthOfString(emergencyTitle);
      doc.text(emergencyTitle, PAGE_WIDTH/2 - emergencyTitleWidth/2, currentY);
      currentY += 25;

      const emergencyName = member.emergencyContact?.name || '';
      const emergencyRelation = member.emergencyContact?.relation || '';
      const emergencyNumber = member.emergencyContact?.number || '';
      
      checkPageBreak(30);
      currentY = drawFormField('Name:', safeText(emergencyName), PAGE_MARGIN, currentY, CONTENT_WIDTH - 140);
      currentY += 3;
      
      checkPageBreak(30);
      currentY = drawFormField('Relation:', safeText(emergencyRelation), PAGE_MARGIN, currentY, CONTENT_WIDTH - 140);
      currentY += 3;
      
      checkPageBreak(30);
      currentY = drawFormField('Mobile No.:', safeText(emergencyNumber), PAGE_MARGIN, currentY, CONTENT_WIDTH - 140);
      currentY += 10;
      
      // Footer for current page
      drawFooter();

      // ========================================================================
      // PAGE 3: TERMS & CONDITIONS
      // ========================================================================
      doc.addPage();
      pageNumber = 3;
      
      drawBackgroundLogo();
      currentY = drawKSSHeader();
      drawDocNumber(PAGE_MARGIN + 5);

      // Page Title
      doc.fillColor(COLORS.darkRed)
         .fontSize(16)
         .font('Helvetica-Bold');
      const termsTitle = 'TERMS & CONDITIONS';
      const termsTitleWidth = doc.widthOfString(termsTitle);
      doc.text(termsTitle, PAGE_WIDTH/2 - termsTitleWidth/2, currentY);
      currentY += 30;

      // Section divider
      doc.strokeColor(COLORS.darkRed)
         .lineWidth(1)
         .moveTo(PAGE_MARGIN, currentY)
         .lineTo(PAGE_WIDTH - PAGE_MARGIN, currentY)
         .stroke();
      currentY += 20;

      // Terms list
      const terms = [
        'I am joining Krushna Sada Sahayte (KSS) as a Volunteer only.',
        'I understand that I am NOT a Director, Member, Shareholder, or Legal Authority of the NGO.',
        'I shall not claim any ownership, voting rights, or financial rights in the NGO.',
        'I will not collect donations, sponsorships, or funds without written authorization from KSS.',
        'I shall not misuse the NGO name, logo, identity, or goodwill for personal, political, or commercial benefit.',
        'I agree to maintain discipline, honesty, dignity, and ethical conduct during all NGO activities.',
        'KSS has the full right to terminate my volunteer association at any time without prior notice.',
        'Volunteer service is voluntary and unpaid, unless officially approved for a specific assignment.',
        'All information provided by me is true and correct.',
        'Any dispute shall be subject to Vadodara, Gujarat jurisdiction only.'
      ];

      terms.forEach((term) => {
        checkPageBreak(25);
        // Red bullet point
        doc.circle(PAGE_MARGIN + 8, currentY + 4, 2.5)
           .fillColor(COLORS.red)
           .fill();
        
        // Term text
        doc.fillColor(COLORS.textDark)
           .fontSize(9)
           .font('Helvetica');
        doc.text(term, PAGE_MARGIN + 18, currentY, { width: CONTENT_WIDTH - 30 });
        currentY += 22;
      });

      currentY += 15;

      // Acknowledgment
      checkPageBreak(60);
      doc.fillColor(COLORS.textDark)
         .fontSize(9)
         .font('Helvetica');
      const ackText = `I, __________, hereby declare that I have read, understood, and accepted all the Terms & Conditions of Krushna Sada Sahayte (KSS).`;
      doc.text(ackText, PAGE_MARGIN, currentY, { width: CONTENT_WIDTH });
      currentY += 18;
      
      doc.text('I agree to serve the NGO with honesty, discipline, and dedication.', PAGE_MARGIN, currentY);
      currentY += 25;

      // Place, Date, Signature
      checkPageBreak(50);
      const placeY = currentY;
      currentY = drawFormField('Place:', '', PAGE_MARGIN, currentY, 200);
      
      // Current date
      let currentDate = '';
      try {
        const now = safeDate();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        currentDate = `${day}/${month}/${year}`;
      } catch (error) {
        currentDate = '23/01/2026';
      }
      
      drawFormField('Date:', currentDate, PAGE_MARGIN + 220, placeY, 200);
      currentY = Math.max(currentY, placeY + 25);
      currentY += 5;
      
      checkPageBreak(80);
      
      // Signature Label
      doc.fillColor(COLORS.textDark)
         .fontSize(9)
         .font('Helvetica');
      doc.text('Signature of Volunteer:', PAGE_MARGIN, currentY);
      currentY += 15;
      
      // Signature Image Box
      const signatureX = PAGE_MARGIN;
      const signatureY = currentY;
      const signatureWidth = CONTENT_WIDTH - 140;
      const signatureHeight = 60;
      
      // Draw signature box border
      doc.rect(signatureX, signatureY, signatureWidth, signatureHeight)
         .strokeColor(COLORS.darkRed)
         .lineWidth(1.5)
         .stroke();
      
      // Add signature image if available
      let signatureAdded = false;
      if (member.signature) {
        try {
          // Check if signature is base64 data URL
          let signatureBuffer;
          if (member.signature.startsWith('data:image')) {
            // Extract base64 data from data URL
            const base64Data = member.signature.split(',')[1] || member.signature;
            signatureBuffer = Buffer.from(base64Data, 'base64');
          } else if (member.signature.startsWith('/uploads/')) {
            // Signature is a file path
            const signaturePath = path.join(uploadsPath, path.basename(member.signature));
            if (fs.existsSync(signaturePath)) {
              signatureBuffer = fs.readFileSync(signaturePath);
            }
          } else {
            // Try as direct base64
            signatureBuffer = Buffer.from(member.signature, 'base64');
          }
          
          if (signatureBuffer) {
            // Add signature image to PDF
            doc.image(signatureBuffer, signatureX + 5, signatureY + 5, {
              width: signatureWidth - 10,
              height: signatureHeight - 10,
              fit: [signatureWidth - 10, signatureHeight - 10],
              align: 'center',
              valign: 'center'
            });
            signatureAdded = true;
          }
        } catch (error) {
          console.error('Error adding signature to PDF:', error);
        }
      }
      
      // If no signature, show placeholder
      if (!signatureAdded) {
        doc.fillColor(COLORS.textDark)
           .fontSize(8)
           .font('Helvetica-Oblique');
        const placeholderText = 'Signature';
        const textWidth = doc.widthOfString(placeholderText);
        doc.text(placeholderText, signatureX + (signatureWidth - textWidth)/2, signatureY + signatureHeight/2 - 4);
      }
      
      currentY = signatureY + signatureHeight + 10;
      
      // Footer for page 3
      drawFooter();

      // ========================================================================
      // PAGE 4: APPROVAL & VERIFICATION
      // ========================================================================
      doc.addPage();
      pageNumber = 4;
      
      drawBackgroundLogo();
      currentY = drawKSSHeader();
      drawDocNumber(PAGE_MARGIN + 5);

      // Page Title
      doc.fillColor(COLORS.darkRed)
         .fontSize(16)
         .font('Helvetica-Bold');
      const approvalTitle = 'APPROVAL & VERIFICATION';
      const approvalTitleWidth = doc.widthOfString(approvalTitle);
      doc.text(approvalTitle, PAGE_WIDTH/2 - approvalTitleWidth/2, currentY);
      currentY += 30;

      // Section divider
      doc.strokeColor(COLORS.darkRed)
         .lineWidth(1)
         .moveTo(PAGE_MARGIN, currentY)
         .lineTo(PAGE_WIDTH - PAGE_MARGIN, currentY)
         .stroke();
      currentY += 20;

      // Volunteer ID
      checkPageBreak(30);
      currentY = drawFormField(
        'Volunteer ID No.:',
        safeText(member.memberId || ''),
        PAGE_MARGIN, currentY, CONTENT_WIDTH - 140
      );
      currentY += 10;

      // Approval fields
      checkPageBreak(30);
      currentY = drawFormField('Approved By:', '', PAGE_MARGIN, currentY, CONTENT_WIDTH - 140);
      currentY += 3;
      
      checkPageBreak(30);
      currentY = drawFormField('Name:', '', PAGE_MARGIN, currentY, CONTENT_WIDTH - 140);
      currentY += 3;
      
      checkPageBreak(30);
      currentY = drawFormField('Designation: Director / Authorized Person', '', PAGE_MARGIN, currentY, CONTENT_WIDTH - 140);
      currentY += 3;
      
      checkPageBreak(30);
      currentY = drawFormField('Signature & NGO Seal:', '', PAGE_MARGIN, currentY, CONTENT_WIDTH - 140);
      currentY += 30;

      // Generate barcode
      let barcodeDate = '';
      try {
        const now = safeDate();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        barcodeDate = `${year}-${month}-${day}`;
      } catch (error) {
        barcodeDate = '2026-01-23';
      }
      
      const barcodeData = [
        safeText(member.memberId || 'KSS'),
        safeText(member.firstName || '') + ' ' + safeText(member.lastName || ''),
        safeText(member.mobile || ''),
        barcodeDate
      ].join('|');
      
      const barcodeBase64 = generateBarcode(barcodeData);
      if (barcodeBase64) {
        try {
          const barcodeBuffer = Buffer.from(barcodeBase64.split(',')[1], 'base64');
          const barcodeX = PAGE_WIDTH / 2 - 100;
          const barcodeY = PAGE_HEIGHT - 160;
          
          doc.image(barcodeBuffer, barcodeX, barcodeY, { 
            width: 200, 
            height: 80
          });
          
          // Barcode label
          doc.fillColor(COLORS.textDark)
             .fontSize(8)
             .font('Helvetica');
          const labelText = 'Registration Barcode';
          const labelWidth = doc.widthOfString(labelText);
          doc.text(labelText, PAGE_WIDTH/2 - labelWidth/2, barcodeY + 85);
        } catch (error) {
          console.error('Error adding barcode image:', error);
        }
      }
      
      // Footer for page 4
      drawFooter();

      // ========================================================================
      // FINALIZE DOCUMENT
      // ========================================================================
      doc.end();

      stream.on('finish', () => {
        const relativePath = `/uploads/${fileName}`;
        resolve(relativePath);
      });

      stream.on('error', (error) => {
        console.error('Stream error in PDF generation:', error);
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
      console.error('Error in generateRegistrationForm:', error);
      reject(error);
    }
  });
};

/**
 * Generate Professional Donation Receipt PDF
 */
const generateDonationSlip = async (donation) => {
  return new Promise((resolve, reject) => {
    try {
      // ========================================================================
      // SETUP: File paths and streams
      // ========================================================================
      const uploadsPath = path.resolve(uploadDir);
      if (!fs.existsSync(uploadsPath)) {
        fs.mkdirSync(uploadsPath, { recursive: true });
      }

      const safeReceiptNumber = (donation.receiptNumber || 'receipt').replace(/[\/\\]/g, '_');
      const fileName = `donation_${safeReceiptNumber}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsPath, fileName);
      const stream = fs.createWriteStream(filePath);
      
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        reject(error);
      });

      // ========================================================================
      // CREATE PDF DOCUMENT
      // ========================================================================
      const doc = new PDFDocument({ 
        margin: 0,
        size: 'A4',
        autoFirstPage: true,
        bufferPages: false
      });
      
      doc.on('error', (error) => {
        console.error('PDF generation error:', error);
        reject(error);
      });
      
      doc.pipe(stream);

      // ========================================================================
      // CONSTANTS
      // ========================================================================
      const PAGE_MARGIN = 30;
      const PAGE_WIDTH = doc.page.width;
      const PAGE_HEIGHT = doc.page.height;
      const CONTENT_WIDTH = PAGE_WIDTH - (PAGE_MARGIN * 2);
      
      let currentY = PAGE_MARGIN;

      // ========================================================================
      // HELPER: Draw background logo watermark
      // ========================================================================
      const drawBackgroundLogo = () => {
        const logoPath = path.join(__dirname, '../../referance_image/logo_kss-removebg-preview.png');
        if (fs.existsSync(logoPath)) {
          try {
            const logoSize = 150;
            const centerX = PAGE_WIDTH / 2;
            const centerY = PAGE_HEIGHT / 2;
            
            doc.save();
            doc.opacity(0.05);
            doc.image(logoPath, centerX - logoSize/2, centerY - logoSize/2, {
              width: logoSize,
              height: logoSize,
              fit: [logoSize, logoSize]
            });
            doc.restore();
          } catch (error) {
            console.error('Error drawing background logo:', error);
          }
        }
      };

      // ========================================================================
      // HEADER: Logo + Organization Info
      // ========================================================================
      drawBackgroundLogo();
      
      const logoPath = path.join(__dirname, '../../referance_image/logo_kss-removebg-preview.png');
      const logoX = PAGE_MARGIN;
      const logoY = PAGE_MARGIN;
      const logoWidth = 60;
      const logoHeight = 60;
      
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, logoX, logoY, { 
            width: logoWidth, 
            height: logoHeight, 
            fit: [logoWidth, logoHeight] 
          });
        } catch (error) {
          console.error('Error loading logo image:', error);
        }
      }
      
      // Organization name and details
      const textX = logoX + logoWidth + 15;
      doc.fillColor(COLORS.darkRed)
         .fontSize(16)
         .font('Helvetica-Bold');
      doc.text('Krishna Sada Sahayate', textX, logoY + 5);
      
      doc.fillColor(COLORS.darkRed)
         .fontSize(11)
         .font('Helvetica-Oblique');
      doc.text('Where Compassion Becomes Dharma', textX, logoY + 22);
      
      doc.fillColor(COLORS.textDark)
         .fontSize(9)
         .font('Helvetica');
      doc.text('Vadodara, Gujarat, India', textX, logoY + 35);
      
      // Receipt title (right side)
      doc.fillColor(COLORS.darkRed)
         .fontSize(18)
         .font('Helvetica-Bold');
      const receiptTitle = 'DONATION RECEIPT';
      const receiptTitleWidth = doc.widthOfString(receiptTitle);
      doc.text(receiptTitle, PAGE_WIDTH - PAGE_MARGIN - receiptTitleWidth, logoY + 20);
      
      currentY = logoY + logoHeight + 25;

      // ========================================================================
      // SEPARATOR LINE
      // ========================================================================
      doc.strokeColor(COLORS.darkRed)
         .lineWidth(1.5)
         .moveTo(PAGE_MARGIN, currentY)
         .lineTo(PAGE_WIDTH - PAGE_MARGIN, currentY)
         .stroke();
      currentY += 20;

      // ========================================================================
      // RECEIPT DETAILS
      // ========================================================================
      const detailsLeftX = PAGE_MARGIN;
      const detailsRightX = PAGE_WIDTH / 2 + 20;
      let leftY = currentY;
      let rightY = currentY;

      // Left column
      doc.fillColor(COLORS.textDark)
         .fontSize(10)
         .font('Helvetica');
      doc.text('Receipt Number:', detailsLeftX, leftY);
      doc.fillColor(COLORS.black)
         .fontSize(11)
         .font('Helvetica-Bold');
      doc.text(safeText(donation.receiptNumber || ''), detailsLeftX + 100, leftY);
      leftY += 18;

      doc.fillColor(COLORS.textDark)
         .fontSize(10)
         .font('Helvetica');
      doc.text('Date:', detailsLeftX, leftY);
      doc.fillColor(COLORS.black)
         .fontSize(11)
         .font('Helvetica-Bold');
      const receiptDate = formatDate(donation.createdAt || new Date());
      doc.text(receiptDate, detailsLeftX + 100, leftY);
      leftY += 18;

      // Right column
      doc.fillColor(COLORS.textDark)
         .fontSize(10)
         .font('Helvetica');
      doc.text('Payment Mode:', detailsRightX, rightY);
      doc.fillColor(COLORS.black)
         .fontSize(11)
         .font('Helvetica-Bold');
      const paymentMode = donation.paymentMode || '';
      const paymentModeText = paymentMode.charAt(0).toUpperCase() + paymentMode.slice(1);
      doc.text(paymentModeText, detailsRightX + 90, rightY);
      rightY += 18;

      if (donation.transactionId || donation.razorpayPaymentId) {
        doc.fillColor(COLORS.textDark)
           .fontSize(10)
           .font('Helvetica');
        doc.text('Transaction ID:', detailsRightX, rightY);
        doc.fillColor(COLORS.black)
           .fontSize(10)
           .font('Helvetica');
        const txnId = donation.razorpayPaymentId || donation.transactionId || '';
        doc.text(safeText(txnId), detailsRightX + 90, rightY);
        rightY += 18;
      }

      currentY = Math.max(leftY, rightY) + 20;

      // ========================================================================
      // DONOR INFORMATION
      // ========================================================================
      doc.fillColor(COLORS.darkRed)
         .fontSize(12)
         .font('Helvetica-Bold');
      doc.text('Donor Information', PAGE_MARGIN, currentY);
      currentY += 20;

      // Donor name
      doc.fillColor(COLORS.textDark)
         .fontSize(10)
         .font('Helvetica');
      doc.text('Name:', PAGE_MARGIN, currentY);
      doc.fillColor(COLORS.black)
         .fontSize(12)
         .font('Helvetica-Bold');
      const donorName = donation.isAnonymous ? 'Anonymous Donor' : safeText(donation.donorName || '');
      doc.text(donorName, PAGE_MARGIN + 60, currentY);
      currentY += 20;

      // Member ID (if available)
      if (donation.memberId && donation.memberId.memberId) {
        doc.fillColor(COLORS.textDark)
           .fontSize(10)
           .font('Helvetica');
        doc.text('Member ID:', PAGE_MARGIN, currentY);
        doc.fillColor(COLORS.black)
           .fontSize(11)
           .font('Helvetica');
        doc.text(safeText(donation.memberId.memberId), PAGE_MARGIN + 60, currentY);
        currentY += 20;
      }

      // Email (if available from member)
      if (donation.memberId && donation.memberId.email) {
        doc.fillColor(COLORS.textDark)
           .fontSize(10)
           .font('Helvetica');
        doc.text('Email:', PAGE_MARGIN, currentY);
        doc.fillColor(COLORS.black)
           .fontSize(10)
           .font('Helvetica');
        doc.text(safeText(donation.memberId.email), PAGE_MARGIN + 60, currentY);
        currentY += 20;
      }

      currentY += 10;

      // ========================================================================
      // DONATION DETAILS
      // ========================================================================
      doc.fillColor(COLORS.darkRed)
         .fontSize(12)
         .font('Helvetica-Bold');
      doc.text('Donation Details', PAGE_MARGIN, currentY);
      currentY += 20;

      // Amount (highlighted)
      doc.fillColor(COLORS.textDark)
         .fontSize(10)
         .font('Helvetica');
      doc.text('Amount:', PAGE_MARGIN, currentY);
      doc.fillColor(COLORS.darkRed)
         .fontSize(18)
         .font('Helvetica-Bold');
      const amountText = `₹${(donation.amount || 0).toLocaleString('en-IN')}`;
      doc.text(amountText, PAGE_MARGIN + 60, currentY);
      currentY += 25;

      // Purpose
      doc.fillColor(COLORS.textDark)
         .fontSize(10)
         .font('Helvetica');
      doc.text('Purpose:', PAGE_MARGIN, currentY);
      doc.fillColor(COLORS.black)
         .fontSize(11)
         .font('Helvetica-Bold');
      const purposeMap = {
        'event': 'Event',
        'general': 'General Fund',
        'emergency': 'Emergency Fund'
      };
      const purposeText = purposeMap[donation.purpose] || donation.purpose || 'General Fund';
      doc.text(purposeText, PAGE_MARGIN + 60, currentY);
      currentY += 18;

      // Event (if applicable)
      if (donation.eventId && donation.eventId.name) {
        doc.fillColor(COLORS.textDark)
           .fontSize(10)
           .font('Helvetica');
        doc.text('Event:', PAGE_MARGIN, currentY);
        doc.fillColor(COLORS.black)
           .fontSize(11)
           .font('Helvetica');
        doc.text(safeText(donation.eventId.name), PAGE_MARGIN + 60, currentY);
        currentY += 18;
      }

      currentY += 20;

      // ========================================================================
      // AMOUNT IN WORDS
      // ========================================================================
      const numberToWords = (num) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
          'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        
        if (num === 0) return 'Zero';
        if (num < 20) return ones[num];
        if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
        if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
        if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + numberToWords(num % 1000) : '');
        if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToWords(num % 100000) : '');
        return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numberToWords(num % 10000000) : '');
      };

      doc.fillColor(COLORS.textDark)
         .fontSize(10)
         .font('Helvetica');
      doc.text('Amount in Words:', PAGE_MARGIN, currentY);
      doc.fillColor(COLORS.black)
         .fontSize(11)
         .font('Helvetica-Bold');
      const amountInWords = numberToWords(Math.floor(donation.amount || 0)) + ' Rupees Only';
      doc.text(amountInWords, PAGE_MARGIN + 100, currentY, { width: CONTENT_WIDTH - 100 });
      currentY += 25;

      // ========================================================================
      // SEPARATOR
      // ========================================================================
      doc.strokeColor(COLORS.red)
         .lineWidth(0.5)
         .moveTo(PAGE_MARGIN, currentY)
         .lineTo(PAGE_WIDTH - PAGE_MARGIN, currentY)
         .stroke();
      currentY += 20;

      // ========================================================================
      // FOOTER: Thank you message and signature
      // ========================================================================
      doc.fillColor(COLORS.textDark)
         .fontSize(10)
         .font('Helvetica');
      const thankYouText = 'Thank you for your generous contribution. Your donation helps us make a positive impact in the community.';
      doc.text(thankYouText, PAGE_MARGIN, currentY, { width: CONTENT_WIDTH, align: 'justify' });
      currentY += 30;

      // Signature area
      const signatureY = PAGE_HEIGHT - 100;
      doc.fillColor(COLORS.textDark)
         .fontSize(9)
         .font('Helvetica');
      doc.text('Authorized Signature', PAGE_MARGIN, signatureY);
      
      // Organization seal/name
      doc.fillColor(COLORS.darkRed)
         .fontSize(10)
         .font('Helvetica-Bold');
      doc.text('Krishna Sada Sahayate', PAGE_WIDTH - PAGE_MARGIN - 150, signatureY);

      // ========================================================================
      // BARCODE (if receipt number available)
      // ========================================================================
      if (donation.receiptNumber) {
        const barcodeData = [
          safeText(donation.receiptNumber),
          safeText(donorName),
          String(donation.amount || 0),
          formatDate(donation.createdAt || new Date())
        ].join('|');
        
        const barcodeBase64 = generateBarcode(barcodeData);
        if (barcodeBase64) {
          try {
            const barcodeBuffer = Buffer.from(barcodeBase64.split(',')[1], 'base64');
            const barcodeX = PAGE_WIDTH / 2 - 100;
            const barcodeY = signatureY + 30;
            
            doc.image(barcodeBuffer, barcodeX, barcodeY, { 
              width: 200, 
              height: 60
            });
            
            // Barcode label
            doc.fillColor(COLORS.textDark)
               .fontSize(8)
               .font('Helvetica');
            const labelText = 'Receipt Verification Code';
            const labelWidth = doc.widthOfString(labelText);
            doc.text(labelText, PAGE_WIDTH/2 - labelWidth/2, barcodeY + 65);
          } catch (error) {
            console.error('Error adding barcode image:', error);
          }
        }
      }

      // ========================================================================
      // FINALIZE DOCUMENT
      // ========================================================================
      doc.end();

      stream.on('finish', () => {
        const relativePath = `/uploads/${fileName}`;
        resolve(relativePath);
      });

      stream.on('error', (error) => {
        console.error('Stream error in PDF generation:', error);
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
      console.error('Error in generateDonationSlip:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateRegistrationForm,
  generateDonationSlip
};
