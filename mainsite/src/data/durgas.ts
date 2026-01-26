import durgaSaraswati from '@/assets/durga-saraswati.jpg';
import durgaAnnapurna from '@/assets/durga-annapurna.jpg';
import durgaGanga from '@/assets/durga-ganga.jpg';
import durgaKali from '@/assets/durga-kali.jpg';
import durgaLakshmi from '@/assets/durga-lakshmi.jpg';

export interface Durga {
  id: string;
  name: string;
  nameGujarati: string;
  meaning: string;
  meaningGujarati: string;
  description: string;
  descriptionLong: string;
  image: string;
  activities: string[];
  activitiesDetailed: { name: string; description: string }[];
  color: string;
  impactNumbers: { label: string; value: number; suffix?: string }[];
}

export const durgas: Durga[] = [
  {
    id: 'saraswati',
    name: 'Saraswati Durga',
    nameGujarati: 'સરસ્વતી દુર્ગા',
    meaning: 'Path of Knowledge & Education',
    meaningGujarati: 'જ્ઞાન અને શિક્ષણનો માર્ગ',
    description: 'શિક્ષણ, જાગૃતિ અને જ્ઞાન સહાય દ્વારા સમાજના વિકાસમાં યોગદાન.',
    descriptionLong: 'સરસ્વતી દુર્ગા જ્ઞાન અને શિક્ષણનો દિવ્ય માર્ગ છે. અમે ગરીબ બાળકોને શિક્ષણ સામગ્રી, કોચિંગ અને માર્ગદર્શન પ્રદાન કરીએ છીએ. વિદ્યાની દેવી સરસ્વતીના આશીર્વાદથી અમે સમાજમાં જ્ઞાનનો પ્રકાશ ફેલાવીએ છીએ.',
    image: durgaSaraswati,
    activities: ['શિક્ષણ સહાય', 'પુસ્તક વિતરણ', 'જાગૃતિ કાર્યક્રમ'],
    activitiesDetailed: [
      { name: 'શિક્ષણ સહાય', description: 'ગરીબ વિદ્યાર્થીઓને શાળા ફી અને શિક્ષણ ખર્ચમાં મદદ' },
      { name: 'પુસ્તક વિતરણ', description: 'જરૂરિયાતમંદ વિદ્યાર્થીઓને મફત પુસ્તકો અને નોટબુક' },
      { name: 'જાગૃતિ કાર્યક્રમ', description: 'સ્વાસ્થ્ય, સ્વચ્છતા અને સામાજિક જાગૃતિ' },
      { name: 'કમ્પ્યુટર શિક્ષણ', description: 'ડિજિટલ સાક્ષરતા માટે મફત કોર્સ' },
    ],
    color: 'linear-gradient(135deg, hsl(43, 70%, 55%) 0%, hsl(35, 80%, 45%) 100%)',
    impactNumbers: [
      { label: 'વિદ્યાર્થીઓને મદદ', value: 500 },
      { label: 'પુસ્તકો વિતરિત', value: 2000 },
    ],
  },
  {
    id: 'annapurna',
    name: 'Annapurna Durga',
    nameGujarati: 'અન્નપૂર્ણા દુર્ગા',
    meaning: 'Path of Food & Nourishment',
    meaningGujarati: 'અન્ન અને પોષણનો માર્ગ',
    description: 'ભોજન દાન, કૂતરા-પક્ષી ખોરાક, અને ભૂખ નિવારણ કાર્યક્રમ.',
    descriptionLong: 'અન્નપૂર્ણા દુર્ગા અન્નદાનનો પવિત્ર માર્ગ છે. અમે ગરીબો, વૃદ્ધો, અને પશુ-પક્ષીઓને ખોરાક પ્રદાન કરીએ છીએ. દરરોજ કૂતરા અને પક્ષીઓને ખવડાવવું એ અમારી મુખ્ય સેવા છે. અન્ન એ બ્રહ્મ છે.',
    image: durgaAnnapurna,
    activities: ['કૂતરા ખોરાક', 'પક્ષી ખોરાક', 'ભોજન વિતરણ'],
    activitiesDetailed: [
      { name: 'કૂતરા ખોરાક', description: 'શેરી કૂતરાઓને દરરોજ ખોરાક આપવો' },
      { name: 'પક્ષી ખોરાક', description: 'પક્ષીઓ માટે દાણા અને પાણી' },
      { name: 'ભોજન વિતરણ', description: 'ગરીબો અને બેઘર લોકોને ભોજન' },
      { name: 'સામુદાયિક રસોડું', description: 'તહેવારો પર મફત ભોજન' },
    ],
    color: 'linear-gradient(135deg, hsl(22, 95%, 55%) 0%, hsl(35, 90%, 50%) 100%)',
    impactNumbers: [
      { label: 'ભોજન પીરસાયા', value: 10000 },
      { label: 'પ્રાણીઓને ખવડાવ્યા', value: 5000 },
    ],
  },
  {
    id: 'ganga',
    name: 'Ganga Durga',
    nameGujarati: 'ગંગા દુર્ગા',
    meaning: 'Path of Purity & Cleanliness',
    meaningGujarati: 'પવિત્રતા અને સ્વચ્છતાનો માર્ગ',
    description: 'સ્વચ્છતા અભિયાન, ગંદા સ્થળો સાફ કરવા, જળ જાગૃતિ.',
    descriptionLong: 'ગંગા દુર્ગા પવિત્રતા અને સ્વચ્છતાનો માર્ગ છે. અમે મંદિરો, શાળાઓ અને સાર્વજનિક સ્થળોની સફાઈ કરીએ છીએ. જળ સંરક્ષણ અને પર્યાવરણ જાગૃતિ અમારું લક્ષ્ય છે.',
    image: durgaGanga,
    activities: ['સ્વચ્છતા અભિયાન', 'જળ જાગૃતિ', 'વૃક્ષારોપણ'],
    activitiesDetailed: [
      { name: 'સ્વચ્છતા અભિયાન', description: 'સાર્વજનિક સ્થળો અને મંદિરોની સફાઈ' },
      { name: 'જળ જાગૃતિ', description: 'પાણી બચાવો અભિયાન' },
      { name: 'વૃક્ષારોપણ', description: 'પર્યાવરણ રક્ષણ માટે વૃક્ષો વાવવા' },
      { name: 'નદી સફાઈ', description: 'નદીઓ અને તળાવોની સફાઈ' },
    ],
    color: 'linear-gradient(135deg, hsl(200, 70%, 50%) 0%, hsl(180, 60%, 45%) 100%)',
    impactNumbers: [
      { label: 'સ્થળો સાફ કર્યા', value: 150 },
      { label: 'વૃક્ષો વાવ્યા', value: 1000 },
    ],
  },
  {
    id: 'kali',
    name: 'Maa Kali Durga',
    nameGujarati: 'મા કાલી દુર્ગા',
    meaning: 'Path of Protection & Emergency Help',
    meaningGujarati: 'રક્ષણ અને કટોકટી સહાયનો માર્ગ',
    description: 'રક્તદાન શિબિર, કટોકટી સહાય, સંકટ સમયે મદદ.',
    descriptionLong: 'મા કાલી દુર્ગા રક્ષણ અને સહાયનો શક્તિશાળી માર્ગ છે. અમે રક્તદાન શિબિરો યોજીએ છીએ અને કટોકટીના સમયે લોકોને મદદ કરીએ છીએ. રક્તદાન મહાદાન છે.',
    image: durgaKali,
    activities: ['રક્તદાન શિબિર', 'કટોકટી સહાય', 'આરોગ્ય શિબિર'],
    activitiesDetailed: [
      { name: 'રક્તદાન શિબિર', description: 'નિયમિત રક્તદાન કેમ્પનું આયોજન' },
      { name: 'કટોકટી સહાય', description: 'દુર્ઘટના અને આપત્તિ સમયે મદદ' },
      { name: 'આરોગ્ય શિબિર', description: 'મફત આરોગ્ય તપાસ' },
      { name: 'દવા સહાય', description: 'ગરીબ દર્દીઓને દવા સહાય' },
    ],
    color: 'linear-gradient(135deg, hsl(0, 72%, 35%) 0%, hsl(340, 70%, 30%) 100%)',
    impactNumbers: [
      { label: 'રક્ત એકમો', value: 500 },
      { label: 'જીવન બચાવ્યા', value: 200 },
    ],
  },
  {
    id: 'lakshmi',
    name: 'Lakshmi Durga',
    nameGujarati: 'લક્ષ્મી દુર્ગા',
    meaning: 'Path of Prosperity & Transparency',
    meaningGujarati: 'સમૃદ્ધિ અને પારદર્શિતાનો માર્ગ',
    description: 'દાન વ્યવસ્થાપન, સહાયક યોગદાન, નાણાકીય પારદર્શિતા.',
    descriptionLong: 'લક્ષ્મી દુર્ગા દાન અને પારદર્શિતાનો માર્ગ છે. દાતાઓના યોગદાનને પવિત્ર માનીને અમે દરેક રૂપિયાનો હિસાબ રાખીએ છીએ. તમારું દાન સીધું જરૂરિયાતમંદો સુધી પહોંચે છે.',
    image: durgaLakshmi,
    activities: ['દાન વ્યવસ્થાપન', 'પારદર્શિતા', 'દાતા સહાય'],
    activitiesDetailed: [
      { name: 'દાન વ્યવસ્થાપન', description: 'દાનનું પારદર્શક વ્યવસ્થાપન' },
      { name: 'ટેક્સ લાભ', description: '80G અંતર્ગત ટેક્સ લાભ' },
      { name: 'માસિક રિપોર્ટ', description: 'દાતાઓને નિયમિત અહેવાલ' },
      { name: 'ઓનલાઈન દાન', description: 'સરળ ઓનલાઈન દાન વ્યવસ્થા' },
    ],
    color: 'linear-gradient(135deg, hsl(43, 70%, 55%) 0%, hsl(22, 90%, 50%) 100%)',
    impactNumbers: [
      { label: 'દાતાઓ', value: 300 },
      { label: 'દાન (લાખમાં)', value: 25, suffix: 'L+' },
    ],
  },
];

export const getDurgaById = (id: string): Durga | undefined => {
  return durgas.find((durga) => durga.id === id);
};
