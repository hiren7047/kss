# KSS Main Site - Complete Site Index

## 📋 Table of Contents
1. [Site Overview](#site-overview)
2. [Technology Stack](#technology-stack)
3. [Site Structure & Routes](#site-structure--routes)
4. [Page-by-Page Content Index](#page-by-page-content-index)
5. [Components Index](#components-index)
6. [Data & Content](#data--content)
7. [Features & Functionality](#features--functionality)
8. [Multilingual Support](#multilingual-support)
9. [Assets & Resources](#assets--resources)

---

## Site Overview

**Organization Name:** Krushna Sada Sahayate (કૃષ્ણ સદા સહાયતે / कृष्ण सदा सहायते)

**Tagline:** "Humanity through Dharma"

**Purpose:** A non-profit organization serving humanity, animals, and society through the path of Dharma and Seva (service). The organization operates through a unique "Durga Seva System" with five divine service paths.

**Base URL Structure:** `/` (React Router SPA)

---

## Technology Stack

- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite 5.4.19
- **Routing:** React Router DOM 6.30.1
- **Styling:** Tailwind CSS 3.4.17
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Animations:** Framer Motion 12.29.0
- **State Management:** React Query (TanStack Query) 5.83.0
- **Icons:** Lucide React 0.462.0
- **Forms:** React Hook Form 7.61.1 with Zod validation

---

## Site Structure & Routes

### Main Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Index.tsx` | Homepage - Hero, Mission, Durga System Overview, Impact, Events, Testimonials, CTA |
| `/about` | `About.tsx` | About Us - Organization story, vision, mission, values, team, why different |
| `/durga` | `Durga.tsx` | Durga System - Overview of all 5 Durga service paths |
| `/durga/:id` | `DurgaDetail.tsx` | Individual Durga detail page (saraswati, annapurna, ganga, kali, lakshmi) |
| `/events` | `Events.tsx` | Events - Upcoming and past service programs, festivals |
| `/gallery` | `Gallery.tsx` | Photo and video gallery with category filters |
| `/donate` | `Donate.tsx` | Donation page with payment options and transparency info |
| `/volunteer` | `Volunteer.tsx` | Volunteer registration and information |
| `/contact` | `Contact.tsx` | Contact form, location map, office hours |
| `*` | `NotFound.tsx` | 404 error page |

---

## Page-by-Page Content Index

### 1. Homepage (`/` - Index.tsx)

#### Sections:
1. **Hero Section**
   - Sanskrit Quote: "कृष्णं वन्दे जगद्गुरुम्"
   - Title: "Krushna Sada Sahayate" (multilingual)
   - Tagline: "Humanity through Dharma"
   - Description: Mission statement about serving through Dharma and Seva
   - CTAs: "Become Volunteer" and "Donate" buttons
   - Background: Hero image with gradient overlay

2. **Mission Statement**
   - Sanskrit Quote: "सेवा परमो धर्मः"
   - Title: "Our Purpose"
   - Text: Detailed mission about serving under Lord Krishna's guidance

3. **Durga System Overview**
   - Title: "Durga Seva System"
   - Subtitle: "Service through five divine paths"
   - Sanskrit Quote: "सर्वे भवन्तु सुखिनः"
   - Cards: 5 Durga cards (Saraswati, Annapurna, Ganga, Kali, Lakshmi)
   - CTA: "View All Durga" button

4. **Impact Counters**
   - 4 animated counters:
     - 10,000+ Meals Served
     - 5,000+ Animals Fed
     - 500+ Blood Units
     - 100+ Events

5. **Upcoming Events**
   - Title: "Upcoming Events"
   - 2 sample events:
     - Holi Bhajan Sandhya (March 14, 2024)
     - Blood Donation Camp (March 21, 2024)
   - CTA: "View All Events" button

6. **Testimonials**
   - Title: "Our Supporters"
   - 3 testimonials from:
     - Rameshbhai Patel (Local Citizen)
     - Priya Shah (Volunteer)
     - Maheshbhai Joshi (Teacher)

7. **CTA Section**
   - Title: "Join in Service"
   - Text: Call to action for donations and volunteering
   - Buttons: "Donate" and "Become Volunteer"

---

### 2. About Page (`/about` - About.tsx)

#### Sections:
1. **Hero Section**
   - Sanskrit Quote: "वसुधैव कुटुम्बकम्"
   - Title: "About Us"
   - Subtitle: Organization description

2. **Story Section**
   - Organization logo
   - Title: "The Meaning of 'Krushna Sada Sahayate'"
   - Quote and explanation
   - Text about organization's foundation in Gujarat

3. **Vision & Mission Cards**
   - **Vision Card:**
     - Title: "Our Vision"
     - Text: Society where every being receives love, respect, and assistance
   - **Mission Card:**
     - Title: "Our Mission"
     - Text: Five paths of service through Durga Seva System

4. **Values Section**
   - Title: "Our Values"
   - Sanskrit Quote: "धर्मो रक्षति रक्षितः"
   - 4 Value Cards:
     - Compassion (करुणा)
     - Transparency (पारदर्शिता)
     - Community (समुदाय)
     - Dharma (धर्म)

5. **Team Section**
   - Title: "Our Team"
   - 3 Team Members:
     - Founder (President)
     - Chief Servant (Secretary)
     - Volunteer Head (Coordinator)

6. **Why Different Section**
   - Title: "Why We Are Different?"
   - 5 Key Points:
     - 100% Transparent Donation Management
     - Dharma-based service
     - Durga Seva System
     - Strong local community connection
     - Animal service (dogs and birds)

---

### 3. Durga System Page (`/durga` - Durga.tsx)

#### Sections:
1. **Hero Section**
   - Sanskrit Quote: "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता"
   - Title: "Durga Seva System"
   - Subtitle: Explanation of five divine service paths

2. **Explanation Section**
   - Quote explaining the meaning of "Durga" as divine power

3. **All Durga Cards**
   - Grid display of 5 Durga cards:
     - Saraswati Durga (Education)
     - Annapurna Durga (Food)
     - Ganga Durga (Cleanliness)
     - Maa Kali Durga (Blood Donation)
     - Lakshmi Durga (Donation Management)

4. **Future Durga Section**
   - Title: "Future Durga"
   - Coming Soon:
     - Environment Durga
     - Health Durga
     - Elderly Care Durga

---

### 4. Durga Detail Page (`/durga/:id` - DurgaDetail.tsx)

#### Dynamic Content Based on Durga ID:

#### 1. Saraswati Durga (`/durga/saraswati`)
- **Name:** Saraswati Durga (સરસ્વતી દુર્ગા)
- **Meaning:** Path of Knowledge & Education
- **Description:** Education, awareness, and knowledge support
- **Activities:**
  - Education Support (शिक्षण सहाय)
  - Book Distribution (पुस्तक वितरण)
  - Awareness Programs (जागृति कार्यक्रम)
  - Computer Education (कंप्यूटर शिक्षण)
- **Impact Numbers:**
  - 500 Students Helped
  - 2,000 Books Distributed
- **Color:** Golden gradient

#### 2. Annapurna Durga (`/durga/annapurna`)
- **Name:** Annapurna Durga (अन्नपूर्णा दुर्गा)
- **Meaning:** Path of Food & Nourishment
- **Description:** Food donation, dog-bird feeding, hunger relief
- **Activities:**
  - Dog Feeding (कुत्ता खोराक)
  - Bird Feeding (पक्षी खोराक)
  - Food Distribution (भोजन वितरण)
  - Community Kitchen (सामुदायिक रसोई)
- **Impact Numbers:**
  - 10,000 Meals Served
  - 5,000 Animals Fed
- **Color:** Orange gradient

#### 3. Ganga Durga (`/durga/ganga`)
- **Name:** Ganga Durga (गंगा दुर्गा)
- **Meaning:** Path of Purity & Cleanliness
- **Description:** Cleanliness drives, water awareness
- **Activities:**
  - Cleanliness Drives (स्वच्छता अभियान)
  - Water Awareness (जल जागृति)
  - Tree Plantation (वृक्षारोपण)
  - River Cleaning (नदी सफाई)
- **Impact Numbers:**
  - 150 Places Cleaned
  - 1,000 Trees Planted
- **Color:** Blue gradient

#### 4. Maa Kali Durga (`/durga/kali`)
- **Name:** Maa Kali Durga (मां काली दुर्गा)
- **Meaning:** Path of Protection & Emergency Help
- **Description:** Blood donation camps, emergency help
- **Activities:**
  - Blood Donation Camps (रक्तदान शिविर)
  - Emergency Help (कटोकटी सहाय)
  - Health Camps (आरोग्य शिविर)
  - Medicine Support (दवा सहाय)
- **Impact Numbers:**
  - 500 Blood Units
  - 200 Lives Saved
- **Color:** Red gradient

#### 5. Lakshmi Durga (`/durga/lakshmi`)
- **Name:** Lakshmi Durga (लक्ष्मी दुर्गा)
- **Meaning:** Path of Prosperity & Transparency
- **Description:** Donation management, financial transparency
- **Activities:**
  - Donation Management (दान व्यवस्थापन)
  - Tax Benefits (टैक्स लाभ)
  - Monthly Reports (मासिक रिपोर्ट)
  - Online Donation (ऑनलाइन दान)
- **Impact Numbers:**
  - 300 Donors
  - 25L+ Donations
- **Color:** Gold gradient

---

### 5. Events Page (`/events` - Events.tsx)

#### Sections:
1. **Hero Section**
   - Sanskrit Quote: "संघे शक्तिः कलौ युगे"
   - Title: "Events"
   - Subtitle: Upcoming and past service programs

2. **Filter Tabs**
   - "Upcoming Events" tab
   - "Past Events" tab

3. **Events Grid**
   - **Upcoming Events:**
     - Holi Bhajan Sandhya (March 14, 2024, 6:00 PM)
     - Blood Donation Camp (March 21, 2024, 9:00 AM)
   - **Past Events:**
     - Makar Sankranti Seva (January 14, 2024)

4. **Festivals Section**
   - Title: "Service on Religious Festivals"
   - 4 Festival Cards:
     - Diwali (Oct/Nov)
     - Holi (March)
     - Navratri (October)
     - Janmashtami (August)

---

### 6. Gallery Page (`/gallery` - Gallery.tsx)

#### Sections:
1. **Hero Section**
   - Title: "Gallery"
   - Subtitle: "Moments of our service - Photos and Videos"

2. **Filter Tabs**
   - Photos/Videos toggle
   - Category filters:
     - All
     - Annapurna
     - Ganga
     - Kali
     - Saraswati
     - Events

3. **Photo Grid**
   - 6 sample photos with categories:
     - Dog Feeding (Annapurna)
     - Street Dogs (Annapurna)
     - Blood Donation (Kali)
     - Cleanliness (Ganga)
     - Education (Saraswati)
     - Holi (Events)

4. **Lightbox Modal**
   - Full-screen image viewer
   - Click to close

---

### 7. Donate Page (`/donate` - Donate.tsx)

#### Sections:
1. **Hero Section**
   - Sanskrit Quote: "दानं च रक्षति"
   - Title: "Donate"
   - Subtitle: Donation reaches needy directly

2. **Emotional Appeal**
   - Quote about feeding God when feeding hungry

3. **Donation Options**
   - **Amount Selection:**
     - Pre-set amounts: ₹500, ₹1,000, ₹2,500, ₹5,000, ₹10,000, ₹25,000
     - Custom amount option
   - **Durga-wise Donation:**
     - 5 Durga cards for targeted donation

4. **Payment Methods**
   - **UPI:** kss@upi (Google Pay, PhonePe, Paytm)
   - **Bank Transfer:** Account details
   - **Card:** Online payment gateway

5. **Transparency Section**
   - Title: "100% Transparency"
   - 5 Points:
     - Receipt for every donation
     - Tax benefit under 80G
     - Monthly expense reports
     - Regular updates to donors
     - Registered Trust

6. **CTA Section**
   - Title: "Donate Today"
   - "Donate Now" button

---

### 8. Volunteer Page (`/volunteer` - Volunteer.tsx)

#### Sections:
1. **Hero Section**
   - Sanskrit Quote: "सेवा परमो धर्मः"
   - Title: "Become a Volunteer"
   - Subtitle: Time and skills for social service

2. **Why Join Section**
   - Title: "Why Join?"
   - 4 Benefit Cards:
     - Service Satisfaction
     - Community Connection
     - Flexible Time
     - Recognition

3. **What We Do Section**
   - Title: "What Do Volunteers Do?"
   - 8 Activity Cards:
     - Dog/Bird Feeding Campaign
     - Food Distribution
     - Cleanliness Drive
     - Blood Donation Camp
     - Education Support
     - Event Management
     - Photo/Video Team
     - Social Media

4. **Registration Form**
   - Fields:
     - Name (required)
     - Phone Number (required)
     - Email
     - City (required)
     - Age (required)
     - Occupation
     - Interests (checkboxes)
     - About You (textarea)
   - Submit button
   - Note: Contact after registration

---

### 9. Contact Page (`/contact` - Contact.tsx)

#### Sections:
1. **Hero Section**
   - Title: "Contact Us"
   - Subtitle: Connect with us

2. **Contact Info Cards**
   - **Phone:** +91 98765 43210
   - **WhatsApp:** +91 98765 43210
   - **Email:** info@kss.org
   - **Address:** Gujarat, India

3. **Contact Form & Map**
   - **Form Fields:**
     - Name (required)
     - Phone
     - Email (required)
     - Subject
     - Message (required)
   - **Map:** Google Maps embed (Ahmedabad, Gujarat)
   - **Office Hours:**
     - Monday - Saturday: 9:00 AM - 6:00 PM
     - Sunday: 10:00 AM - 2:00 PM

---

### 10. 404 Page (`*` - NotFound.tsx)

- **Title:** "404"
- **Message:** "Oops! Page not found"
- **Link:** "Return to Home"

---

## Components Index

### Layout Components

#### Header (`components/Header.tsx`)
- **Features:**
  - Fixed top navigation
  - Logo with organization name
  - Navigation links (8 items)
  - Language switcher
  - Donate CTA button
  - Mobile hamburger menu
  - Active route highlighting

#### Footer (`components/Footer.tsx`)
- **Sections:**
  - Spiritual quote banner
  - About section with logo
  - Quick links
  - Our Seva list (5 Durga)
  - Contact information
  - Social media links (Facebook, Instagram, YouTube, Twitter)
  - Copyright and registration info

### Page Components

#### SectionTitle (`components/SectionTitle.tsx`)
- Reusable section header component
- Supports title, subtitle, Sanskrit quote, light variant

#### DurgaCard (`components/DurgaCard.tsx`)
- Card component for Durga display
- Shows image, name, meaning, description
- Link to detail page

#### EventCard (`components/EventCard.tsx`)
- Event display card
- Shows title, date, time, location, description, image

#### TestimonialCard (`components/TestimonialCard.tsx`)
- Testimonial display card
- Shows quote, name, role

#### ImpactCounter (`components/ImpactCounter.tsx`)
- Animated counter component
- Shows number, suffix, label, icon

### UI Components (shadcn/ui)

Located in `components/ui/`:
- accordion, alert, alert-dialog, avatar, badge, breadcrumb
- button, calendar, card, carousel, chart, checkbox
- collapsible, command, context-menu, dialog, drawer
- dropdown-menu, form, hover-card, input, input-otp
- label, menubar, navigation-menu, pagination, popover
- progress, radio-group, resizable, scroll-area, select
- separator, sheet, sidebar, skeleton, slider, sonner
- switch, table, tabs, textarea, toast, toaster
- toggle, toggle-group, tooltip

### Utility Components

#### LanguageSwitcher (`components/LanguageSwitcher.tsx`)
- Language selection dropdown
- Supports: English (en), Gujarati (gu), Hindi (hi)

#### NavLink (`components/NavLink.tsx`)
- Navigation link component with active state

---

## Data & Content

### Durga Data (`data/durgas.ts`)

**5 Durga Objects:**

1. **Saraswati Durga**
   - ID: `saraswati`
   - Focus: Education & Knowledge
   - Image: `durga-saraswati.jpg`
   - Color: Golden gradient

2. **Annapurna Durga**
   - ID: `annapurna`
   - Focus: Food & Nourishment
   - Image: `durga-annapurna.jpg`
   - Color: Orange gradient

3. **Ganga Durga**
   - ID: `ganga`
   - Focus: Purity & Cleanliness
   - Image: `durga-ganga.jpg`
   - Color: Blue gradient

4. **Maa Kali Durga**
   - ID: `kali`
   - Focus: Protection & Emergency Help
   - Image: `durga-kali.jpg`
   - Color: Red gradient

5. **Lakshmi Durga**
   - ID: `lakshmi`
   - Focus: Prosperity & Transparency
   - Image: `durga-lakshmi.jpg`
   - Color: Gold gradient

### Translations (`data/translations.ts`)

**3 Languages Supported:**
- English (en)
- Gujarati (gu)
- Hindi (hi)

**Translation Keys Structure:**
- `common.*` - Common UI text
- `nav.*` - Navigation items
- `header.*` - Header content
- `footer.*` - Footer content
- `home.*` - Homepage content
- `about.*` - About page content
- `durga.*` - Durga pages content
- `durgas.*` - Individual Durga data
- `events.*` - Events page content
- `gallery.*` - Gallery page content
- `donate.*` - Donate page content
- `volunteer.*` - Volunteer page content
- `contact.*` - Contact page content
- `form.*` - Form labels
- `testimonials[]` - Testimonial array

---

## Features & Functionality

### 1. Multilingual Support
- **Languages:** English, Gujarati, Hindi
- **Implementation:** React Context API (`LanguageContext.tsx`)
- **Switching:** Language switcher in header
- **Content:** All text content translated

### 2. Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Mobile hamburger menu
- Responsive grids and layouts

### 3. Animations
- **Library:** Framer Motion
- **Features:**
  - Page transitions
  - Scroll-triggered animations
  - Hover effects
  - Counter animations
  - Image lightbox transitions

### 4. SEO & Meta Tags
- Meta tags in `index.html`
- Open Graph tags
- Twitter Card tags
- Description and author tags

### 5. Forms
- Contact form
- Volunteer registration form
- Form validation (React Hook Form + Zod)
- Required field indicators

### 6. Interactive Elements
- Image gallery with lightbox
- Event filtering (upcoming/past)
- Category filtering (gallery)
- Donation amount selection
- Durga-wise donation selection

### 7. External Integrations
- Google Maps embed (Contact page)
- Payment gateway integration (planned)
- Social media links

---

## Multilingual Support

### Language Context (`contexts/LanguageContext.tsx`)

**Provider:** `LanguageProvider`
**Hook:** `useLanguage()`

**Available Languages:**
- `en` - English
- `gu` - Gujarati (ગુજરાતી)
- `hi` - Hindi (हिन्दी)

**Usage Example:**
```tsx
const { t, language } = useLanguage();
const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';
```

**Translation Function:**
- `t('key.path')` - Returns translated string
- Supports nested keys (e.g., `t('home.heroTitle')`)

---

## Assets & Resources

### Images (`src/assets/`)
- `hero-bg.jpg` - Homepage hero background
- `logo_kss.jpg` - Organization logo
- `durga-saraswati.jpg` - Saraswati Durga image
- `durga-annapurna.jpg` - Annapurna Durga image
- `durga-ganga.jpg` - Ganga Durga image
- `durga-kali.jpg` - Kali Durga image
- `durga-lakshmi.jpg` - Lakshmi Durga image

### Public Assets (`public/`)
- `favicon.ico` - Site favicon
- `placeholder.svg` - Placeholder image
- `robots.txt` - SEO robots file

### Fonts
- System fonts with fallbacks
- Serif fonts for headings (Sanskrit quotes)
- Sans-serif for body text

### Colors & Themes
- Primary colors (golden/orange tones)
- Accent colors
- Background gradients:
  - Divine gradient
  - Gold gradient
  - Temple pattern background

---

## Content Summary

### Key Messages
1. **Mission:** Serving humanity through Dharma and Seva
2. **System:** Durga Seva System - 5 divine service paths
3. **Values:** Compassion, Transparency, Community, Dharma
4. **Impact:** 10,000+ meals, 5,000+ animals fed, 500+ blood units

### Sanskrit Quotes Used
- "कृष्णं वन्दे जगद्गुरुम्" - Homepage hero
- "सेवा परमो धर्मः" - Mission statement
- "सर्वे भवन्तु सुखिनः" - Durga system
- "संघे शक्तिः कलौ युगे" - Events
- "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता" - Durga page
- "वसुधैव कुटुम्बकम्" - About page
- "धर्मो रक्षति रक्षितः" - Values
- "दानं च रक्षति" - Donate page
- "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन" - Footer

### Contact Information
- **Phone:** +91 98765 43210
- **WhatsApp:** +91 98765 43210
- **Email:** info@kss.org
- **Location:** Gujarat, India
- **Office Hours:**
  - Mon-Sat: 9:00 AM - 6:00 PM
  - Sunday: 10:00 AM - 2:00 PM

### Payment Information
- **UPI ID:** kss@upi
- **Bank Account:** (Details in donate page)
- **Tax Benefits:** 80G registration

---

## File Structure

```
mainsite/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── assets/
│   │   ├── durga-*.jpg (5 images)
│   │   ├── hero-bg.jpg
│   │   └── logo_kss.jpg
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── DurgaCard.tsx
│   │   ├── EventCard.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── ImpactCounter.tsx
│   │   ├── LanguageSwitcher.tsx
│   │   ├── NavLink.tsx
│   │   ├── SectionTitle.tsx
│   │   └── TestimonialCard.tsx
│   ├── contexts/
│   │   └── LanguageContext.tsx
│   ├── data/
│   │   ├── durgas.ts
│   │   └── translations.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   └── utils.ts
│   ├── pages/
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Donate.tsx
│   │   ├── Durga.tsx
│   │   ├── DurgaDetail.tsx
│   │   ├── Events.tsx
│   │   ├── Gallery.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   └── Volunteer.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── README.md
└── SITE_INDEX.md (this file)
```

---

## Development Notes

### Running the Site
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
npm run preview
```

### Testing
```bash
npm test
npm run test:watch
```

---

## SEO Considerations

### Meta Tags (Current)
- Title: "Lovable App" (needs update)
- Description: "Lovable Generated Project" (needs update)
- Author: "Lovable" (needs update)

### Recommended Updates
- Update `index.html` meta tags with:
  - Proper title: "Krushna Sada Sahayate - Humanity through Dharma"
  - Description: Organization description
  - Keywords: NGO, charity, seva, dharma, Gujarat
  - Open Graph images
  - Canonical URLs

### Sitemap
- Consider adding `sitemap.xml`
- All routes should be included

### Robots.txt
- Currently basic
- May need updates for production

---

## Future Enhancements

### Planned Features (from code comments)
- Environment Durga
- Health Durga
- Elderly Care Durga

### Potential Improvements
- Blog/News section
- Donation tracking for donors
- Volunteer dashboard
- Event registration system
- Newsletter subscription
- Social media feed integration
- Online payment gateway integration
- Donor testimonials section
- Annual report downloads
- Impact stories section

---

**Document Generated:** January 25, 2026
**Site Version:** Based on current codebase structure
**Last Updated:** Based on file analysis

---

*This index document provides a comprehensive overview of the KSS mainsite. For specific implementation details, refer to the source code files.*
