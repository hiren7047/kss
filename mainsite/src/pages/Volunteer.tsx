import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Heart, Clock, Award, Check, Loader2, CheckCircle2, ArrowLeft, ArrowRight, Upload } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SectionTitle from '@/components/SectionTitle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { publicApi } from '@/lib/api';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands",
  "Chandigarh", "Dadra and Nagar Haveli", "Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Volunteer = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    memberId: string;
    name: string;
    memberType: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    parentsName: '',
    fatherBusiness: '',
    motherBusiness: '',
    email: '',
    mobile: '',
    whatsappNumber: '',
    emergencyContact: {
      name: '',
      number: '',
      relation: '',
    },
    address: {
      street: '',
      city: '',
      state: '',
      country: 'India',
      pincode: '',
    },
    aadharNumber: '',
    idProofType: 'Aadhaar',
    photo: '',
    occupation: '',
    business: '',
    educationDetails: '',
    familyMembersCount: '',
    interests: [] as string[],
    availability: '',
    memberType: 'volunteer',
    notes: '',
    signature: '',
  });

  // Fetch page content
  const { data: pageContent } = useQuery({
    queryKey: ['pageContent', 'volunteer', language],
    queryFn: () => publicApi.getPageContent('volunteer', language),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const benefits = [
    { icon: <Heart className="w-6 h-6" />, title: t('volunteer.benefits.satisfaction'), description: t('volunteer.benefits.satisfactionDesc') },
    { icon: <Users className="w-6 h-6" />, title: t('volunteer.benefits.community'), description: t('volunteer.benefits.communityDesc') },
    { icon: <Clock className="w-6 h-6" />, title: t('volunteer.benefits.flexibility'), description: t('volunteer.benefits.flexibilityDesc') },
    { icon: <Award className="w-6 h-6" />, title: t('volunteer.benefits.recognition'), description: t('volunteer.benefits.recognitionDesc') },
  ];

  const activities = [
    t('volunteer.activities.dogFeeding'),
    t('volunteer.activities.foodDistribution'),
    t('volunteer.activities.cleanliness'),
    t('volunteer.activities.bloodDonation'),
    t('volunteer.activities.education'),
    t('volunteer.activities.eventManagement'),
    t('volunteer.activities.photoVideo'),
    t('volunteer.activities.socialMedia'),
  ];

  const heroSection = pageContent?.data?.sections?.find((s: any) => s.sectionId === 'hero');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo size must be less than 2MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('photo', file);
      const response = await axios.post(`${API_BASE_URL}/members/public/upload-photo`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFormData({ ...formData, photo: response.data.data.photoUrl });
      setPhotoPreview(URL.createObjectURL(file));
      toast.success('Photo uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const registrationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.post(`${API_BASE_URL}/members/public/register`, data);
      return response.data;
    },
    onSuccess: (data) => {
      setRegistrationSuccess({
        memberId: data.data.memberId,
        name: data.data.name,
        memberType: data.data.memberType,
      });
      toast.success('Registration submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit registration');
    },
  });

  const handleSubmit = async () => {
    if (!formData.signature) {
      toast.error('Please provide your signature');
      return;
    }

    const submitData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
      familyMembersCount: formData.familyMembersCount ? parseInt(formData.familyMembersCount) : undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
    };

    registrationMutation.mutate(submitData);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <Card className="p-8">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className={`text-2xl font-bold mb-4 ${langClass}`}>
                  {t('register.successTitle')}
                </h2>
                <p className={`text-muted-foreground mb-6 ${langClass}`}>
                  {t('register.successMessage')}
                </p>
                <div className="bg-muted p-4 rounded-lg mb-6 text-left">
                  <p className="text-sm text-muted-foreground mb-1">Member ID</p>
                  <p className="font-mono font-bold text-lg">{registrationSuccess.memberId}</p>
                  <p className="text-sm text-muted-foreground mt-4 mb-1">Name</p>
                  <p className="font-semibold">{registrationSuccess.name}</p>
                  <p className="text-sm text-muted-foreground mt-4 mb-1">Member Type</p>
                  <p className="font-semibold capitalize">{registrationSuccess.memberType}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" onClick={() => navigate('/')}>
                    {t('common.home')}
                  </Button>
                  <Button onClick={() => {
                    setRegistrationSuccess(null);
                    setCurrentStep(1);
                    setFormData({
                      firstName: '', middleName: '', lastName: '', dateOfBirth: '', age: '', gender: '',
                      parentsName: '', fatherBusiness: '', motherBusiness: '', email: '', mobile: '',
                      whatsappNumber: '', emergencyContact: { name: '', number: '', relation: '' },
                      address: { street: '', city: '', state: '', country: 'India', pincode: '' },
                      aadharNumber: '', idProofType: 'Aadhaar', photo: '', occupation: '', business: '',
                      educationDetails: '', familyMembersCount: '', interests: [], availability: '',
                      memberType: 'volunteer', notes: '', signature: '',
                    });
                  }}>
                    {t('register.registerAnother')}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-divine-gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-primary-foreground/80 font-serif text-lg mb-4 lang-hi">
              ॥ {t('volunteer.heroQuote')} ॥
            </p>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-primary-foreground mb-6 ${langClass}`}>
              {heroSection?.title || t('volunteer.heroTitle')}
            </h1>
            <p className={`text-xl text-primary-foreground/80 max-w-2xl mx-auto ${langClass}`}>
              {heroSection?.subtitle || t('volunteer.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('volunteer.whyJoinTitle')}
            subtitle={t('volunteer.whyJoinSubtitle')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background rounded-xl p-6 text-center shadow-card border border-border"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  {benefit.icon}
                </div>
                <h3 className={`font-semibold text-foreground mb-2 ${langClass}`}>{benefit.title}</h3>
                <p className={`text-sm text-muted-foreground ${langClass}`}>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-background temple-pattern">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('volunteer.whatWeDoTitle')}
            subtitle={t('volunteer.whatWeDoSubtitle')}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-4 text-center shadow-card border border-border hover:border-primary/50 transition-colors"
              >
                <Check className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className={`text-sm font-medium text-foreground ${langClass}`}>{activity}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <SectionTitle
            title={t('volunteer.formTitle')}
            subtitle={t('volunteer.formSubtitle')}
          />

          <div className="max-w-4xl mx-auto">
            <Card className="p-6 md:p-8">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-medium ${langClass}`}>
                    {t('register.step')} {currentStep} {t('common.of')} {totalSteps}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((currentStep / totalSteps) * 100)}%
                  </span>
                </div>
                <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
              </div>

              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className={`text-2xl font-bold mb-6 ${langClass}`}>
                    {t('register.personalInfo')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className={langClass}>{t('form.firstName')} *</Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.middleName')}</Label>
                      <Input
                        value={formData.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.lastName')} *</Label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.mobile')} *</Label>
                      <Input
                        type="tel"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        required
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.dateOfBirth')}</Label>
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.age')}</Label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        min="1"
                        max="150"
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.gender')}</Label>
                      <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.selectGender')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">{t('form.male')}</SelectItem>
                          <SelectItem value="female">{t('form.female')}</SelectItem>
                          <SelectItem value="other">{t('form.other')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.idProofType')}</Label>
                      <Select value={formData.idProofType} onValueChange={(value) => setFormData({ ...formData, idProofType: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aadhaar">Aadhaar</SelectItem>
                          <SelectItem value="Passport">Passport</SelectItem>
                          <SelectItem value="PAN">PAN</SelectItem>
                          <SelectItem value="Driving License">Driving License</SelectItem>
                          <SelectItem value="Voter ID">Voter ID</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.aadharNumber')}</Label>
                      <Input
                        value={formData.aadharNumber}
                        onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                        maxLength={12}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className={langClass}>{t('form.photo')}</Label>
                    <div className="flex items-center gap-4">
                      {photoPreview ? (
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={photoPreview} />
                          <AvatarFallback>Photo</AvatarFallback>
                        </Avatar>
                      ) : (
                        <Avatar className="h-20 w-20">
                          <AvatarFallback>No Photo</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                          id="photo-upload"
                        />
                        <Label htmlFor="photo-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" disabled={uploadingPhoto} asChild>
                            <span>
                              {uploadingPhoto ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  {t('form.uploading')}
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  {t('form.uploadPhoto')}
                                </>
                              )}
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Contact Information */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className={`text-2xl font-bold mb-6 ${langClass}`}>
                    {t('register.contactInfo')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className={langClass}>{t('form.email')}</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.whatsappNumber')}</Label>
                      <Input
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.emergencyContactName')}</Label>
                      <Input
                        value={formData.emergencyContact.name}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.emergencyContactNumber')}</Label>
                      <Input
                        type="tel"
                        value={formData.emergencyContact.number}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: { ...formData.emergencyContact, number: e.target.value.replace(/\D/g, '').slice(0, 10) }
                        })}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.relation')}</Label>
                      <Input
                        value={formData.emergencyContact.relation}
                        onChange={(e) => setFormData({
                          ...formData,
                          emergencyContact: { ...formData.emergencyContact, relation: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Address & Professional */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className={`text-2xl font-bold mb-6 ${langClass}`}>
                    {t('register.addressProfessional')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label className={langClass}>{t('form.street')}</Label>
                      <Input
                        value={formData.address.street}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, street: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.city')} *</Label>
                      <Input
                        value={formData.address.city}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, city: e.target.value }
                        })}
                        required
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.state')}</Label>
                      <Select
                        value={formData.address.state}
                        onValueChange={(value) => setFormData({
                          ...formData,
                          address: { ...formData.address, state: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.selectState')} />
                        </SelectTrigger>
                        <SelectContent>
                          {INDIAN_STATES.map((state) => (
                            <SelectItem key={state} value={state}>{state}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.pincode')}</Label>
                      <Input
                        value={formData.address.pincode}
                        onChange={(e) => setFormData({
                          ...formData,
                          address: { ...formData.address, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }
                        })}
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.occupation')}</Label>
                      <Input
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.business')}</Label>
                      <Input
                        value={formData.business}
                        onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className={langClass}>{t('form.educationDetails')}</Label>
                      <Textarea
                        value={formData.educationDetails}
                        onChange={(e) => setFormData({ ...formData, educationDetails: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Member Type & Interests */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className={`text-2xl font-bold mb-6 ${langClass}`}>
                    {t('register.memberDetails')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className={langClass}>{t('form.memberType')} *</Label>
                      <Select
                        value={formData.memberType}
                        onValueChange={(value) => setFormData({ ...formData, memberType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="volunteer">{t('form.volunteer')}</SelectItem>
                          <SelectItem value="donor">{t('form.donor')}</SelectItem>
                          <SelectItem value="beneficiary">{t('form.beneficiary')}</SelectItem>
                          <SelectItem value="core">{t('form.core')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className={langClass}>{t('form.availability')}</Label>
                      <Select
                        value={formData.availability}
                        onValueChange={(value) => setFormData({ ...formData, availability: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('form.selectAvailability')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">{t('form.fullTime')}</SelectItem>
                          <SelectItem value="part-time">{t('form.partTime')}</SelectItem>
                          <SelectItem value="event-based">{t('form.eventBased')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <Label className={langClass}>{t('form.notes')}</Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        placeholder={t('form.notesPlaceholder')}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Signature */}
              {currentStep === 5 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h2 className={`text-2xl font-bold mb-6 ${langClass}`}>
                    {t('register.signature')}
                  </h2>

                  <div>
                    <Label className={langClass}>{t('form.signature')} *</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 bg-muted/50">
                      <canvas
                        ref={(canvas) => {
                          if (canvas) {
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              const rect = canvas.getBoundingClientRect();
                              canvas.width = rect.width;
                              canvas.height = 200;
                              ctx.strokeStyle = '#000';
                              ctx.lineWidth = 2;
                              ctx.lineCap = 'round';
                              ctx.lineJoin = 'round';
                            }
                          }
                        }}
                        className="w-full border rounded bg-white cursor-crosshair"
                        style={{ height: '200px', touchAction: 'none' }}
                        onMouseDown={(e) => {
                          const canvas = e.currentTarget;
                          const ctx = canvas.getContext('2d');
                          if (!ctx) return;

                          const rect = canvas.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;

                          ctx.beginPath();
                          ctx.moveTo(x, y);

                          const draw = (e: MouseEvent) => {
                            const x2 = e.clientX - rect.left;
                            const y2 = e.clientY - rect.top;
                            ctx.lineTo(x2, y2);
                            ctx.stroke();
                            const dataUrl = canvas.toDataURL();
                            setSignature(dataUrl);
                            setFormData({ ...formData, signature: dataUrl });
                          };

                          const stop = () => {
                            canvas.removeEventListener('mousemove', draw);
                            canvas.removeEventListener('mouseup', stop);
                            const dataUrl = canvas.toDataURL();
                            setSignature(dataUrl);
                            setFormData({ ...formData, signature: dataUrl });
                          };

                          canvas.addEventListener('mousemove', draw);
                          canvas.addEventListener('mouseup', stop);
                        }}
                        onTouchStart={(e) => {
                          const canvas = e.currentTarget;
                          const ctx = canvas.getContext('2d');
                          if (!ctx) return;

                          const touch = e.touches[0];
                          const rect = canvas.getBoundingClientRect();
                          const x = touch.clientX - rect.left;
                          const y = touch.clientY - rect.top;

                          ctx.beginPath();
                          ctx.moveTo(x, y);

                          const draw = (e: TouchEvent) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const x2 = touch.clientX - rect.left;
                            const y2 = touch.clientY - rect.top;
                            ctx.lineTo(x2, y2);
                            ctx.stroke();
                            const dataUrl = canvas.toDataURL();
                            setSignature(dataUrl);
                            setFormData({ ...formData, signature: dataUrl });
                          };

                          const stop = () => {
                            canvas.removeEventListener('touchmove', draw);
                            canvas.removeEventListener('touchend', stop);
                            const dataUrl = canvas.toDataURL();
                            setSignature(dataUrl);
                            setFormData({ ...formData, signature: dataUrl });
                          };

                          canvas.addEventListener('touchmove', draw, { passive: false });
                          canvas.addEventListener('touchend', stop);
                        }}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
                        if (canvas) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            setSignature('');
                            setFormData({ ...formData, signature: '' });
                          }
                        }
                      }}
                    >
                      {t('form.clear')}
                    </Button>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className={`text-sm ${langClass}`}>
                      {t('register.terms')}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('common.previous')}
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && (!formData.firstName || !formData.lastName || !formData.mobile)) ||
                      (currentStep === 3 && !formData.address.city) ||
                      (currentStep === 4 && !formData.memberType)
                    }
                  >
                    {t('common.next')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={registrationMutation.isPending || !signature}
                  >
                    {registrationMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('form.submitting')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {t('form.submit')}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Volunteer;
