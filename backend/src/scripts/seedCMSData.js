const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const PageContent = require('../models/PageContent');
const DurgaContent = require('../models/DurgaContent');
const ImpactNumber = require('../models/ImpactNumber');
const SiteSettings = require('../models/SiteSettings');
const Testimonial = require('../models/Testimonial');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kss');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed Page Content
const seedPageContent = async () => {
  console.log('\n📄 Seeding Page Content...');

  const pages = [
    {
      pageId: 'home',
      sections: [
        {
          sectionId: 'hero',
          title: 'Krushna Sada Sahayate',
          subtitle: 'Humanity through Dharma',
          content: 'Serving humanity, animals and society through the path of Dharma and Seva. Five divine paths of service through the Durga Seva System.',
          order: 1,
          isActive: true,
        },
        {
          sectionId: 'mission',
          title: 'Our Purpose',
          subtitle: 'सेवा परमो धर्मः',
          content: 'Under the guidance of Lord Shri Krishna, we selflessly serve humanity, animals and the environment. Social service through five divine paths via the Durga Seva System - this is our Dharma.',
          order: 2,
          isActive: true,
        },
        {
          sectionId: 'durga-system',
          title: 'Durga Seva System',
          subtitle: 'Service through five divine paths',
          content: 'Each Durga represents a different path of service, blessed by the divine energy of the Goddess.',
          order: 3,
          isActive: true,
        },
      ],
      metaTags: {
        title: 'Krushna Sada Sahayate - Humanity through Dharma',
        description: 'Serving humanity, animals and society through the path of Dharma and Seva. Five divine paths of service through the Durga Seva System.',
        keywords: 'NGO, charity, seva, dharma, krishna, gujarat, donation, volunteer',
      },
    },
    {
      pageId: 'about',
      sections: [
        {
          sectionId: 'hero',
          title: 'About Us',
          subtitle: 'Krushna Sada Sahayate - Serving humanity through Dharma',
          content: 'Established on the land of Gujarat, this organization is based on the values of Dharma, Seva and compassion.',
          order: 1,
          isActive: true,
        },
        {
          sectionId: 'meaning',
          title: 'The Meaning of "Krushna Sada Sahayate"',
          content: '"Krushna Sada Sahayate" - means Lord Shri Krishna always helps. This Sanskrit phrase is both the name and ideal of our organization.',
          order: 2,
          isActive: true,
        },
        {
          sectionId: 'vision',
          title: 'Our Vision',
          content: 'A society where every being receives love, respect and assistance. Where Dharma and service go together. Where humanity is supreme.',
          order: 3,
          isActive: true,
        },
        {
          sectionId: 'mission',
          title: 'Our Mission',
          content: 'Selfless service through five paths via the Durga Seva System - education, food, cleanliness, blood donation and transparent donation management.',
          order: 4,
          isActive: true,
        },
      ],
      metaTags: {
        title: 'About Us - Krushna Sada Sahayate',
        description: 'Learn about Krushna Sada Sahayate, our vision, mission, and values. Serving humanity through Dharma and Seva.',
        keywords: 'about, NGO, mission, vision, values, gujarat',
      },
    },
    {
      pageId: 'contact',
      sections: [
        {
          sectionId: 'hero',
          title: 'Contact Us',
          subtitle: 'Get in touch with us',
          content: 'We would love to hear from you. Reach out to us for any queries, suggestions, or to join our mission.',
          order: 1,
          isActive: true,
        },
      ],
      metaTags: {
        title: 'Contact Us - Krushna Sada Sahayate',
        description: 'Contact Krushna Sada Sahayate. Get in touch for queries, donations, or to become a volunteer.',
        keywords: 'contact, address, phone, email, gujarat',
      },
    },
    {
      pageId: 'donate',
      sections: [
        {
          sectionId: 'hero',
          title: 'Donate',
          subtitle: 'Your donation reaches the needy directly',
          content: 'Every rupee is spent in sacred service. Your donation - your devotion.',
          order: 1,
          isActive: true,
        },
        {
          sectionId: 'transparency',
          title: '100% Transparency',
          content: 'Receipt provided for every donation. Tax benefit available under 80G. Monthly expense reports are published.',
          order: 2,
          isActive: true,
        },
      ],
      metaTags: {
        title: 'Donate - Krushna Sada Sahayate',
        description: 'Donate to Krushna Sada Sahayate. 100% transparent donation management. Tax benefits under 80G.',
        keywords: 'donate, donation, charity, 80G, tax benefit',
      },
    },
    {
      pageId: 'volunteer',
      sections: [
        {
          sectionId: 'hero',
          title: 'Become a Volunteer',
          subtitle: 'Your time and skills - for social service',
          content: 'Join us and become a partner in social service. Every service is worship of God.',
          order: 1,
          isActive: true,
        },
      ],
      metaTags: {
        title: 'Volunteer - Krushna Sada Sahayate',
        description: 'Become a volunteer with Krushna Sada Sahayate. Join our mission to serve humanity through Dharma.',
        keywords: 'volunteer, seva, service, join',
      },
    },
    {
      pageId: 'durga',
      sections: [
        {
          sectionId: 'hero',
          title: 'Durga Seva System',
          subtitle: 'Service through five divine paths',
          content: 'Each Durga represents a different path of service, blessed by the divine energy of the Goddess.',
          order: 1,
          isActive: true,
        },
      ],
      metaTags: {
        title: 'Durga Seva System - Krushna Sada Sahayate',
        description: 'Learn about our Durga Seva System - five divine paths of service.',
        keywords: 'durga, seva, service paths, saraswati, annapurna, ganga, kali, lakshmi',
      },
    },
    {
      pageId: 'events',
      sections: [
        {
          sectionId: 'hero',
          title: 'Events',
          subtitle: 'Our upcoming and past service programs',
          content: 'Join our service programs and events. Together we can make a difference.',
          order: 1,
          isActive: true,
        },
      ],
      metaTags: {
        title: 'Events - Krushna Sada Sahayate',
        description: 'View upcoming and past events organized by Krushna Sada Sahayate.',
        keywords: 'events, programs, service, camps',
      },
    },
    {
      pageId: 'gallery',
      sections: [
        {
          sectionId: 'hero',
          title: 'Gallery',
          subtitle: 'Moments of our service',
          content: 'Photos and videos from our various service activities and events.',
          order: 1,
          isActive: true,
        },
      ],
      metaTags: {
        title: 'Gallery - Krushna Sada Sahayate',
        description: 'View photos and videos from our service activities.',
        keywords: 'gallery, photos, videos, service',
      },
    },
  ];

  const languages = ['en', 'gu', 'hi'];
  const translations = {
    gu: {
      home: {
        hero: { title: 'કૃષ્ણ સદા સહાયતે', subtitle: 'Humanity through Dharma', content: 'ધર્મ અને સેવાના માર્ગે માનવતા, પ્રાણીઓ અને સમાજની સેવા. દુર્ગા સેવા પ્રણાલી દ્વારા પાંચ દિવ્ય માર્ગે સેવા.' },
        mission: { title: 'અમારો ઉદ્દેશ્ય', content: 'ભગવાન શ્રી કૃષ્ણના માર્ગદર્શનમાં, અમે માનવતા, પ્રાણીઓ અને પર્યાવરણની નિઃસ્વાર્થ સેવા કરીએ છીએ.' },
        durga: { title: 'દુર્ગા સેવા પ્રણાલી', subtitle: 'પાંચ દિવ્ય માર્ગે સેવા', content: 'દરેક દુર્ગા એક અલગ સેવા માર્ગનું પ્રતિનિધિત્વ કરે છે.' },
      },
      about: {
        hero: { title: 'અમારા વિશે', subtitle: 'કૃષ્ણ સદા સહાયતે - ધર્મ દ્વારા માનવતાની સેવા', content: 'ગુજરાતની ધરતી પર સ્થાપિત આ સંસ્થા ધર્મ, સેવા અને કરુણાના મૂલ્યો પર આધારિત છે.' },
        meaning: { title: '"કૃષ્ણ સદા સહાયતે" નો અર્થ', content: '"કૃષ્ણ સદા સહાયતે" - એટલે ભગવાન શ્રી કૃષ્ણ હંમેશા સહાય કરે છે.' },
        vision: { title: 'અમારું વિઝન', content: 'એક એવો સમાજ જ્યાં દરેક જીવને પ્રેમ, સન્માન અને સહાય મળે.' },
        mission: { title: 'અમારું મિશન', content: 'દુર્ગા સેવા પ્રણાલી દ્વારા શિક્ષણ, ભોજન, સ્વચ્છતા, રક્તદાન અને પારદર્શી દાન વ્યવસ્થાપન.' },
      },
      contact: { hero: { title: 'સંપર્ક કરો', subtitle: 'અમારી સાથે જોડાવા માટે સંપર્ક કરો', content: 'કોઈપણ પ્રશ્ન, સૂચન અથવા અમારા મિશનમાં જોડાવા માટે અમારો સંપર્ક કરો.' } },
      donate: { hero: { title: 'દાન કરો', subtitle: 'તમારું દાન સીધું જરૂરિયાતમંદો સુધી પહોંચે છે', content: 'દરેક રૂપિયો પવિત્ર સેવામાં વપરાય છે. તમારું દાન - તમારી ભક્તિ.' } },
      volunteer: { hero: { title: 'સ્વયંસેવક બનો', subtitle: 'તમારો સમય અને કુશળતા - સમાજ સેવા માટે', content: 'અમારી સાથે જોડાઈને સમાજ સેવામાં ભાગીદાર બનો.' } },
      durga: { hero: { title: 'દુર્ગા સેવા પ્રણાલી', subtitle: 'પાંચ દિવ્ય માર્ગે સેવા', content: 'દરેક દુર્ગા એક અલગ સેવા માર્ગનું પ્રતિનિધિત્વ કરે છે.' } },
      events: { hero: { title: 'ઇવેન્ટ્સ', subtitle: 'અમારા આગામી અને ભૂતકાળના સેવા કાર્યક્રમો', content: 'અમારા સેવા કાર્યક્રમો અને ઇવેન્ટ્સમાં જોડાઓ.' } },
      gallery: { hero: { title: 'ગેલેરી', subtitle: 'અમારી સેવાના ક્ષણો', content: 'અમારી વિવિધ સેવા પ્રવૃત્તિઓ અને ઇવેન્ટ્સના ફોટો અને વિડીઓ.' } },
    },
    hi: {
      home: {
        hero: { title: 'कृष्ण सदा सहायते', subtitle: 'Humanity through Dharma', content: 'धर्म और सेवा के मार्ग पर मानवता, पशुओं और समाज की सेवा। दुर्गा सेवा प्रणाली द्वारा पांच दिव्य मार्गों पर सेवा।' },
        mission: { title: 'हमारा उद्देश्य', content: 'भगवान श्री कृष्ण के मार्गदर्शन में, हम मानवता, पशुओं और पर्यावरण की निस्वार्थ सेवा करते हैं।' },
        durga: { title: 'दुर्गा सेवा प्रणाली', subtitle: 'पांच दिव्य मार्गों पर सेवा', content: 'हर दुर्गा एक अलग सेवा मार्ग का प्रतिनिधित्व करती है।' },
      },
      about: {
        hero: { title: 'हमारे बारे में', subtitle: 'कृष्ण सदा सहायते - धर्म द्वारा मानवता की सेवा', content: 'गुजरात की धरती पर स्थापित यह संस्था धर्म, सेवा और करुणा के मूल्यों पर आधारित है।' },
        meaning: { title: '"कृष्ण सदा सहायते" का अर्थ', content: '"कृष्ण सदा सहायते" - अर्थात भगवान श्री कृष्ण हमेशा सहायता करते हैं।' },
        vision: { title: 'हमारा विज़न', content: 'एक ऐसा समाज जहां हर जीव को प्रेम, सम्मान और सहायता मिले।' },
        mission: { title: 'हमारा मिशन', content: 'दुर्गा सेवा प्रणाली द्वारा शिक्षा, भोजन, स्वच्छता, रक्तदान और पारदर्शी दान प्रबंधन।' },
      },
      contact: { hero: { title: 'संपर्क करें', subtitle: 'हमसे जुड़ने के लिए संपर्क करें', content: 'किसी भी प्रश्न, सुझाव या हमारे मिशन में शामिल होने के लिए हमसे संपर्क करें।' } },
      donate: { hero: { title: 'दान करें', subtitle: 'आपका दान सीधे जरूरतमंदों तक पहुंचता है', content: 'हर रुपया पवित्र सेवा में खर्च होता है। आपका दान - आपकी भक्ति।' } },
      volunteer: { hero: { title: 'स्वयंसेवक बनें', subtitle: 'आपका समय और कौशल - समाज सेवा के लिए', content: 'हमारे साथ जुड़कर समाज सेवा में भागीदार बनें।' } },
      durga: { hero: { title: 'दुर्गा सेवा प्रणाली', subtitle: 'पांच दिव्य मार्गों पर सेवा', content: 'हर दुर्गा एक अलग सेवा मार्ग का प्रतिनिधित्व करती है।' } },
      events: { hero: { title: 'इवेंट्स', subtitle: 'हमारे आगामी और पिछले सेवा कार्यक्रम', content: 'हमारे सेवा कार्यक्रमों और इवेंट्स में शामिल हों।' } },
      gallery: { hero: { title: 'गैलरी', subtitle: 'हमारी सेवा के पल', content: 'हमारी विभिन्न सेवा गतिविधियों और इवेंट्स के फोटो और वीडियो।' } },
    },
  };

  for (const page of pages) {
    for (const lang of languages) {
      const pageData = { ...page };
      
      // Apply translations
      if (translations[lang] && translations[lang][page.pageId]) {
        const trans = translations[lang][page.pageId];
        pageData.sections = pageData.sections.map((section, idx) => {
          const sectionKey = Object.keys(trans)[idx];
          if (trans[sectionKey]) {
            return { ...section, ...trans[sectionKey] };
          }
          return section;
        });
      }

      // Update meta tags
      if (lang === 'gu') {
        pageData.metaTags.title = pageData.metaTags.title.replace('Krushna Sada Sahayate', 'કૃષ્ણ સદા સહાયતે');
      } else if (lang === 'hi') {
        pageData.metaTags.title = pageData.metaTags.title.replace('Krushna Sada Sahayate', 'कृष्ण सदा सहायते');
      }

      pageData.language = lang;
      pageData.status = 'published';
      pageData.publishedAt = new Date();

      try {
        await PageContent.findOneAndUpdate(
          { pageId: page.pageId, language: lang },
          pageData,
          { upsert: true, new: true }
        );
        console.log(`  ✅ ${page.pageId} (${lang})`);
      } catch (error) {
        console.error(`  ❌ Error seeding ${page.pageId} (${lang}):`, error.message);
      }
    }
  }
};

// Seed Durga Content
const seedDurgaContent = async () => {
  console.log('\n🌟 Seeding Durga Content...');

  const durgas = [
    {
      durgaId: 'saraswati',
      name: 'Saraswati Durga',
      nameGujarati: 'સરસ્વતી દુર્ગા',
      meaning: 'Path of Knowledge & Education',
      meaningGujarati: 'જ્ઞાન અને શિક્ષણનો માર્ગ',
      description: 'Contributing to social development through education, awareness and knowledge support.',
      descriptionLong: 'Saraswati Durga is the divine path of knowledge and education. We provide educational materials, coaching and guidance to underprivileged children. With the blessings of Goddess Saraswati, we spread the light of knowledge in society.',
      imageUrl: '/assets/durga-saraswati.jpg',
      activities: ['Education Support', 'Book Distribution', 'Awareness Programs', 'Computer Education'],
      activitiesDetailed: [
        { name: 'Education Support', description: 'Financial assistance for school fees and educational expenses for poor students' },
        { name: 'Book Distribution', description: 'Free books and notebooks for needy students' },
        { name: 'Awareness Programs', description: 'Health, cleanliness and social awareness programs' },
        { name: 'Computer Education', description: 'Free courses for digital literacy' },
      ],
      impactNumbers: [
        { label: 'Students Helped', value: 500, suffix: '+' },
        { label: 'Books Distributed', value: 2000, suffix: '+' },
      ],
      color: 'linear-gradient(135deg, hsl(43, 70%, 55%) 0%, hsl(35, 80%, 45%) 100%)',
      isActive: true,
      order: 1,
    },
    {
      durgaId: 'annapurna',
      name: 'Annapurna Durga',
      nameGujarati: 'અન્નપૂર્ણા દુર્ગા',
      meaning: 'Path of Food & Nourishment',
      meaningGujarati: 'અન્ન અને પોષણનો માર્ગ',
      description: 'Food donation, dog-bird feeding, and hunger relief programs.',
      descriptionLong: 'Annapurna Durga is the sacred path of food donation. We provide food to the poor, elderly, and animals. Feeding dogs and birds daily is our main service. Food is Brahma.',
      imageUrl: '/assets/durga-annapurna.jpg',
      activities: ['Dog Feeding', 'Bird Feeding', 'Food Distribution', 'Community Kitchen'],
      activitiesDetailed: [
        { name: 'Dog Feeding', description: 'Daily feeding of street dogs' },
        { name: 'Bird Feeding', description: 'Grains and water for birds' },
        { name: 'Food Distribution', description: 'Food for the poor and homeless' },
        { name: 'Community Kitchen', description: 'Free meals on festivals' },
      ],
      impactNumbers: [
        { label: 'Meals Served', value: 10000, suffix: '+' },
        { label: 'Animals Fed', value: 5000, suffix: '+' },
      ],
      color: 'linear-gradient(135deg, hsl(22, 95%, 55%) 0%, hsl(35, 90%, 50%) 100%)',
      isActive: true,
      order: 2,
    },
    {
      durgaId: 'ganga',
      name: 'Ganga Durga',
      nameGujarati: 'ગંગા દુર્ગા',
      meaning: 'Path of Purity & Cleanliness',
      meaningGujarati: 'પવિત્રતા અને સ્વચ્છતાનો માર્ગ',
      description: 'Cleanliness drives, cleaning dirty places, water awareness.',
      descriptionLong: 'Ganga Durga is the path of purity and cleanliness. We clean temples, schools and public places. Water conservation and environmental awareness is our goal.',
      imageUrl: '/assets/durga-ganga.jpg',
      activities: ['Cleanliness Drives', 'Water Awareness', 'Tree Plantation', 'River Cleaning'],
      activitiesDetailed: [
        { name: 'Cleanliness Drives', description: 'Cleaning of public places and temples' },
        { name: 'Water Awareness', description: 'Water conservation campaigns' },
        { name: 'Tree Plantation', description: 'Planting trees for environmental protection' },
        { name: 'River Cleaning', description: 'Cleaning of rivers and ponds' },
      ],
      impactNumbers: [
        { label: 'Places Cleaned', value: 150, suffix: '+' },
        { label: 'Trees Planted', value: 1000, suffix: '+' },
      ],
      color: 'linear-gradient(135deg, hsl(200, 70%, 50%) 0%, hsl(180, 60%, 45%) 100%)',
      isActive: true,
      order: 3,
    },
    {
      durgaId: 'kali',
      name: 'Maa Kali Durga',
      nameGujarati: 'મા કાલી દુર્ગા',
      meaning: 'Path of Protection & Emergency Help',
      meaningGujarati: 'રક્ષણ અને કટોકટી સહાયનો માર્ગ',
      description: 'Blood donation camps, emergency help, crisis support.',
      descriptionLong: 'Maa Kali Durga is the powerful path of protection and assistance. We organize blood donation camps and help people during emergencies. Blood donation is the greatest donation.',
      imageUrl: '/assets/durga-kali.jpg',
      activities: ['Blood Donation Camps', 'Emergency Help', 'Health Camps', 'Medicine Support'],
      activitiesDetailed: [
        { name: 'Blood Donation Camps', description: 'Regular blood donation camp organization' },
        { name: 'Emergency Help', description: 'Help during accidents and disasters' },
        { name: 'Health Camps', description: 'Free health checkups' },
        { name: 'Medicine Support', description: 'Medicine assistance for poor patients' },
      ],
      impactNumbers: [
        { label: 'Blood Units', value: 500, suffix: '+' },
        { label: 'Lives Saved', value: 200, suffix: '+' },
      ],
      color: 'linear-gradient(135deg, hsl(0, 72%, 35%) 0%, hsl(340, 70%, 30%) 100%)',
      isActive: true,
      order: 4,
    },
    {
      durgaId: 'lakshmi',
      name: 'Lakshmi Durga',
      nameGujarati: 'લક્ષ્મી દુર્ગા',
      meaning: 'Path of Prosperity & Transparency',
      meaningGujarati: 'સમૃદ્ધિ અને પારદર્શિતાનો માર્ગ',
      description: 'Donation management, supporter contribution, financial transparency.',
      descriptionLong: 'Lakshmi Durga is the path of donation and transparency. Considering the contribution of donors as sacred, we keep account of every rupee. Your donation reaches the needy directly.',
      imageUrl: '/assets/durga-lakshmi.jpg',
      activities: ['Donation Management', 'Transparency', 'Donor Support', 'Online Donation'],
      activitiesDetailed: [
        { name: 'Donation Management', description: 'Transparent management of donations' },
        { name: 'Tax Benefit', description: 'Tax benefits under 80G' },
        { name: 'Monthly Reports', description: 'Regular reports to donors' },
        { name: 'Online Donation', description: 'Easy online donation system' },
      ],
      impactNumbers: [
        { label: 'Donors', value: 300, suffix: '+' },
        { label: 'Donations (Lakhs)', value: 25, suffix: 'L+' },
      ],
      color: 'linear-gradient(135deg, hsl(43, 70%, 55%) 0%, hsl(22, 90%, 50%) 100%)',
      isActive: true,
      order: 5,
    },
  ];

  for (const durga of durgas) {
    try {
      await DurgaContent.findOneAndUpdate(
        { durgaId: durga.durgaId },
        { ...durga, language: 'en' },
        { upsert: true, new: true }
      );
      console.log(`  ✅ ${durga.name}`);
    } catch (error) {
      console.error(`  ❌ Error seeding ${durga.name}:`, error.message);
    }
  }
};

// Seed Impact Numbers
const seedImpactNumbers = async () => {
  console.log('\n📊 Seeding Impact Numbers...');

  const impactNumbers = [
    { label: 'Meals Served', value: 10000, suffix: '+', language: 'en', isActive: true, displayOrder: 1 },
    { label: 'Animals Fed', value: 5000, suffix: '+', language: 'en', isActive: true, displayOrder: 2 },
    { label: 'Blood Units', value: 500, suffix: '+', language: 'en', isActive: true, displayOrder: 3 },
    { label: 'Events', value: 100, suffix: '+', language: 'en', isActive: true, displayOrder: 4 },
    { label: 'ભોજન પીરસાયા', value: 10000, suffix: '+', language: 'gu', isActive: true, displayOrder: 1 },
    { label: 'પ્રાણીઓને ખવડાવ્યા', value: 5000, suffix: '+', language: 'gu', isActive: true, displayOrder: 2 },
    { label: 'રક્ત એકમો', value: 500, suffix: '+', language: 'gu', isActive: true, displayOrder: 3 },
    { label: 'ઇવેન્ટ્સ', value: 100, suffix: '+', language: 'gu', isActive: true, displayOrder: 4 },
    { label: 'भोजन परोसे गए', value: 10000, suffix: '+', language: 'hi', isActive: true, displayOrder: 1 },
    { label: 'पशुओं को खिलाया', value: 5000, suffix: '+', language: 'hi', isActive: true, displayOrder: 2 },
    { label: 'रक्त इकाइयां', value: 500, suffix: '+', language: 'hi', isActive: true, displayOrder: 3 },
    { label: 'इवेंट्स', value: 100, suffix: '+', language: 'hi', isActive: true, displayOrder: 4 },
  ];

  for (const impact of impactNumbers) {
    try {
      await ImpactNumber.findOneAndUpdate(
        { label: impact.label, language: impact.language },
        impact,
        { upsert: true, new: true }
      );
      console.log(`  ✅ ${impact.label} (${impact.language})`);
    } catch (error) {
      console.error(`  ❌ Error seeding ${impact.label}:`, error.message);
    }
  }
};

// Seed Site Settings
const seedSiteSettings = async () => {
  console.log('\n⚙️ Seeding Site Settings...');

  const settings = {
    organizationName: {
      en: 'Krushna Sada Sahayate',
      gu: 'કૃષ્ણ સદા સહાયતે',
      hi: 'कृष्ण सदा सहायते',
    },
    tagline: {
      en: 'Humanity through Dharma',
      gu: 'Humanity through Dharma',
      hi: 'Humanity through Dharma',
    },
    contactInfo: {
      phone: '+91-XXXXXXXXXX',
      whatsapp: '+91-XXXXXXXXXX',
      email: 'info@krushnasadasahayate.org',
      address: {
        en: 'Gujarat, India',
        gu: 'ગુજરાત, ભારત',
        hi: 'गुजरात, भारत',
      },
      officeHours: {
        monSat: 'Monday - Saturday: 9:00 AM - 6:00 PM',
        sunday: 'Sunday: 10:00 AM - 2:00 PM',
      },
    },
    socialMedia: {
      facebook: 'https://facebook.com/krushnasadasahayate',
      instagram: 'https://instagram.com/krushnasadasahayate',
      youtube: 'https://youtube.com/@krushnasadasahayate',
      twitter: 'https://twitter.com/krushnasadasahayate',
    },
    paymentInfo: {
      upiId: 'kss@upi',
      bankAccount: 'XXXXXXXXXXXX',
      bankName: 'Bank Name',
      ifscCode: 'XXXX0000000',
      taxInfo: 'Registered Trust. Tax benefits available under 80G.',
    },
    seoSettings: {
      defaultTitle: 'Krushna Sada Sahayate - Humanity through Dharma',
      defaultDescription: 'Serving humanity, animals and society through the path of Dharma and Seva. Five divine paths of service through the Durga Seva System.',
      defaultKeywords: 'NGO, charity, seva, dharma, krishna, gujarat, donation, volunteer',
    },
    maintenanceMode: false,
  };

  try {
    await SiteSettings.findOneAndUpdate({}, settings, { upsert: true, new: true });
    console.log('  ✅ Site Settings');
  } catch (error) {
    console.error('  ❌ Error seeding Site Settings:', error.message);
  }
};

// Seed Testimonials
const seedTestimonials = async () => {
  console.log('\n💬 Seeding Testimonials...');

  const testimonials = [
    {
      quote: 'Krushna Sada Sahayate does great work in our village. They feed dogs daily and give food to the poor.',
      name: 'Rameshbhai Patel',
      role: 'Local Citizen',
      language: 'en',
      isActive: true,
      displayOrder: 1,
    },
    {
      quote: 'Participating in the blood donation camp gave me great satisfaction. The country needs such organizations.',
      name: 'Priya Shah',
      role: 'Volunteer',
      language: 'en',
      isActive: true,
      displayOrder: 2,
    },
    {
      quote: 'Children received books and educational support. This organization truly does God\'s work.',
      name: 'Maheshbhai Joshi',
      role: 'Teacher',
      language: 'en',
      isActive: true,
      displayOrder: 3,
    },
    {
      quote: 'કૃષ્ણ સદા સહાયતે એ અમારા ગામમાં ખૂબ સારું કામ કરે છે. તેઓ દરરોજ કૂતરાઓને ખવડાવે છે અને ગરીબોને ભોજન આપે છે.',
      name: 'રમેશભાઈ પટેલ',
      role: 'સ્થાનિક નાગરિક',
      language: 'gu',
      isActive: true,
      displayOrder: 1,
    },
    {
      quote: 'રક્તદાન શિબિરમાં ભાગ લઈને મને ખૂબ સંતોષ થયો. આવી સંસ્થાઓની દેશને જરૂર છે.',
      name: 'પ્રિયા શાહ',
      role: 'સ્વયંસેવક',
      language: 'gu',
      isActive: true,
      displayOrder: 2,
    },
    {
      quote: 'બાળકોને પુસ્તકો અને શિક્ષણ સહાય મળી. ખરેખર ભગવાનનું કામ કરે છે આ સંસ્થા.',
      name: 'મહેશભાઈ જોશી',
      role: 'શિક્ષક',
      language: 'gu',
      isActive: true,
      displayOrder: 3,
    },
    {
      quote: 'कृष्ण सदा सहायते हमारे गांव में बहुत अच्छा काम करती है। वे रोज़ कुत्तों को खिलाते हैं और गरीबों को भोजन देते हैं।',
      name: 'रमेशभाई पटेल',
      role: 'स्थानीय नागरिक',
      language: 'hi',
      isActive: true,
      displayOrder: 1,
    },
    {
      quote: 'रक्तदान शिविर में भाग लेकर मुझे बहुत संतोष मिला। ऐसी संस्थाओं की देश को जरूरत है।',
      name: 'प्रिया शाह',
      role: 'स्वयंसेवक',
      language: 'hi',
      isActive: true,
      displayOrder: 2,
    },
    {
      quote: 'बच्चों को किताबें और शिक्षा सहायता मिली। सच में भगवान का काम करती है यह संस्था।',
      name: 'महेशभाई जोशी',
      role: 'शिक्षक',
      language: 'hi',
      isActive: true,
      displayOrder: 3,
    },
  ];

  for (const testimonial of testimonials) {
    try {
      await Testimonial.create(testimonial);
      console.log(`  ✅ ${testimonial.name} (${testimonial.language})`);
    } catch (error) {
      console.error(`  ❌ Error seeding testimonial:`, error.message);
    }
  }
};

// Main seed function
const seedAll = async () => {
  try {
    await connectDB();
    console.log('\n🌱 Starting CMS Data Seeding...\n');

    await seedPageContent();
    await seedDurgaContent();
    await seedImpactNumbers();
    await seedSiteSettings();
    await seedTestimonials();

    console.log('\n✅ All CMS data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seed
seedAll();
