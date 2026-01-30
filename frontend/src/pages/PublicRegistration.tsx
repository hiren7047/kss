import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload, CheckCircle2, ArrowLeft, ArrowRight, ChevronRight, ChevronLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { publicMembersApi, CreateMemberRequest } from "@/lib/api/members";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignatureCanvas } from "@/components/SignatureCanvas";
import { Progress } from "@/components/ui/progress";

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

// Zod validation schema
const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(50),
  middleName: z.string().max(50).optional().or(z.literal("")),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(50),
  dateOfBirth: z.string().optional().or(z.literal("")),
  age: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  parentsName: z.string().max(100).optional().or(z.literal("")),
  fatherBusiness: z.string().max(100).optional().or(z.literal("")),
  motherBusiness: z.string().max(100).optional().or(z.literal("")),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),
  whatsappNumber: z.string().optional().refine((val) => !val || /^[0-9]{10}$/.test(val), {
    message: "WhatsApp number must be exactly 10 digits"
  }).or(z.literal("")),
  emergencyContact: z.object({
    name: z.string().max(100).optional().or(z.literal("")),
    number: z.string().optional().refine((val) => !val || /^[0-9]{10}$/.test(val), {
      message: "Emergency contact number must be exactly 10 digits"
    }).or(z.literal("")),
    relation: z.string().max(50).optional().or(z.literal("")),
  }).optional(),
  address: z.object({
    street: z.string().max(200).optional().or(z.literal("")),
    city: z.string().max(100).optional().or(z.literal("")),
    state: z.string().max(100).optional().or(z.literal("")),
    country: z.string().max(100).optional().or(z.literal("")),
    pincode: z.string().optional().refine((val) => !val || /^[0-9]{6}$/.test(val), {
      message: "Pincode must be exactly 6 digits"
    }).or(z.literal("")),
  }).optional(),
  aadharNumber: z.string().optional().refine((val) => !val || /^[0-9]{12}$/.test(val), {
    message: "Aadhaar number must be exactly 12 digits"
  }).or(z.literal("")),
  idProofType: z.enum(["Aadhaar", "Passport", "PAN", "Driving License", "Voter ID", "Other"]).optional(),
  photo: z.string().optional().or(z.literal("")),
  occupation: z.string().max(100).optional().or(z.literal("")),
  business: z.string().max(100).optional().or(z.literal("")),
  educationDetails: z.string().max(500).optional().or(z.literal("")),
  familyMembersCount: z.number().int().min(1).optional(),
  interests: z.array(z.string()).optional(),
  availability: z.enum(["full-time", "part-time", "event-based"]).optional(),
  memberType: z.enum(["donor", "volunteer", "beneficiary", "core"]),
  notes: z.string().max(500).optional().or(z.literal("")),
  signature: z.string().min(1, "Signature is required"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function PublicRegistration() {
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState<{
    memberId: string;
    name: string;
    memberType: string;
    approvalStatus?: string;
  } | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      age: "",
      gender: undefined,
      parentsName: "",
      fatherBusiness: "",
      motherBusiness: "",
      email: "",
      mobile: "",
      whatsappNumber: "",
      emergencyContact: {
        name: "",
        number: "",
        relation: "",
      },
      address: {
        street: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
      },
      aadharNumber: "",
      idProofType: "Aadhaar",
      photo: "",
      occupation: "",
      business: "",
      educationDetails: "",
      familyMembersCount: undefined,
      interests: [],
      availability: undefined,
      memberType: "volunteer",
      notes: "",
      signature: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Step 1: Personal, Step 2: Contact, Step 3: Address/Professional, Step 4: Member Details, Step 5: Signature

  const memberType = form.watch("memberType");

  const fieldToStep = (key: string): number => {
    const step1 = ["firstName", "middleName", "lastName", "parentsName", "idProofType", "aadharNumber", "dateOfBirth", "age", "gender", "mobile", "photo"];
    const step2 = ["mobile", "whatsappNumber", "email"];
    const step3 = ["emergencyContact", "address", "occupation", "business", "educationDetails", "fatherBusiness", "motherBusiness", "familyMembersCount"];
    const step4 = ["memberType", "interests", "availability", "notes"];
    const step5 = ["signature"];
    if (step1.includes(key) || step1.some((f) => key.startsWith(f + "."))) return 1;
    if (step2.includes(key) || step2.some((f) => key.startsWith(f + "."))) return 2;
    if (step3.includes(key) || step3.some((f) => key.startsWith(f + "."))) return 3;
    if (step4.includes(key) || step4.some((f) => key.startsWith(f + "."))) return 4;
    if (step5.includes(key) || step5.some((f) => key.startsWith(f + "."))) return 5;
    return 1;
  };

  const flattenErrors = (errors: Record<string, unknown>, prefix = ""): string[] => {
    const keys: string[] = [];
    for (const [k, v] of Object.entries(errors)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v && typeof v === "object" && !Array.isArray(v)) {
        if ("message" in v && typeof (v as { message?: unknown }).message === "string") keys.push(path);
        else keys.push(...flattenErrors(v as Record<string, unknown>, path));
      }
    }
    return keys;
  };

  const nextStep = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const fieldsToValidate = getFieldsForStep(currentStep);
      if (fieldsToValidate.length === 0) {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }
      const isValid = await form.trigger(fieldsToValidate as any, { shouldFocus: true });
      if (!isValid) {
        const errors = form.formState.errors as Record<string, unknown>;
        const errorKeys = flattenErrors(errors);
        const stepKeys = errorKeys.filter((key) => {
          const f = key.split(".")[0];
          return fieldsToValidate.includes(f as keyof RegistrationFormData) || fieldsToValidate.includes(key as keyof RegistrationFormData);
        });
        const fieldLabels: Record<string, string> = {
          firstName: "First Name",
          lastName: "Last Name",
          mobile: "Mobile Number",
          whatsappNumber: "WhatsApp Number",
          email: "Email",
          aadharNumber: "Aadhaar Number",
          emergencyContact: "Emergency Contact",
          "emergencyContact.number": "Emergency Contact Number",
          address: "Address",
          "address.pincode": "Pincode",
          familyMembersCount: "Family Members Count",
          memberType: "Member Type",
          signature: "Signature",
        };
        const labels = [...new Set(stepKeys.map((k) => fieldLabels[k] || k))].join(", ");
        toast.error(labels ? `Please fix: ${labels}` : "Please fix all errors on this step before proceeding.");
        return;
      }
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Error in nextStep:", err);
      toast.error("An error occurred. Please try again.");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getFieldsForStep = (step: number): (keyof RegistrationFormData)[] => {
    switch (step) {
      case 1:
        return [
          "firstName", "middleName", "lastName", "parentsName", "idProofType",
          "aadharNumber", "dateOfBirth", "age", "gender", "mobile", "photo",
        ];
      case 2:
        return ["mobile", "whatsappNumber", "email"];
      case 3:
        return [
          "emergencyContact", "address",
          "occupation", "business", "educationDetails",
          "fatherBusiness", "motherBusiness", "familyMembersCount",
        ];
      case 4:
        return ["memberType", "interests", "availability", "notes"];
      case 5:
        return ["signature"];
      default:
        return [];
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const response = await publicMembersApi.uploadPhoto(file);
      form.setValue("photo", response.data.photoUrl);
      setPhotoPreview(URL.createObjectURL(file));
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    try {
      // Clean up empty strings and convert to proper format
      const submitData: CreateMemberRequest = {
        ...data,
        middleName: data.middleName || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        age: data.age ? (isNaN(Number(data.age)) ? data.age : Number(data.age)) : undefined,
        email: data.email || undefined,
        whatsappNumber: data.whatsappNumber || undefined,
        emergencyContact: data.emergencyContact?.name || data.emergencyContact?.number || data.emergencyContact?.relation
          ? {
              name: data.emergencyContact.name || undefined,
              number: data.emergencyContact.number || undefined,
              relation: data.emergencyContact.relation || undefined,
            }
          : undefined,
        address: data.address?.street || data.address?.city || data.address?.state || data.address?.pincode
          ? {
              street: data.address.street || undefined,
              city: data.address.city || undefined,
              state: data.address.state || undefined,
              country: data.address.country || "India",
              pincode: data.address.pincode || undefined,
            }
          : undefined,
        aadharNumber: data.aadharNumber || undefined,
        photo: data.photo || undefined,
        occupation: data.occupation || undefined,
        business: data.business || undefined,
        educationDetails: data.educationDetails || undefined,
        interests: data.interests && data.interests.length > 0 ? data.interests : undefined,
        availability: data.availability || undefined,
        notes: data.notes || undefined,
        signature: data.signature || undefined,
        status: "active",
      };

      const response = await publicMembersApi.register(submitData);
      setRegistrationSuccess({
        memberId: response.data.memberId,
        name: response.data.name,
        memberType: response.data.memberType,
        approvalStatus: response.data.approvalStatus || 'pending',
      });
      toast.success(response.message || "Registration submitted successfully!");
      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 py-6 sm:py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header with Logo */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <img 
                  src="/logo_kss-removebg-preview.png" 
                  alt="KSS Logo" 
                  className="h-10 w-10 sm:h-14 sm:w-14 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-base sm:text-lg hidden">
                  KSS
                </div>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-muted-foreground">
              KSS - Krishna Sada Sahayate
            </h2>
          </div>

          {/* Success Card */}
          <Card className="border-2 border-success/30 shadow-xl bg-card">
            <CardHeader className="text-center space-y-4 pb-4 sm:pb-6 pt-6 sm:pt-8">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-success/10 flex items-center justify-center border-4 border-success/20 shadow-lg">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-success" />
              </div>
              
              {/* Success Title */}
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                Registration Submitted!
              </CardTitle>
              
              {/* Thank You Message */}
              <CardDescription className="text-base sm:text-lg text-muted-foreground px-4">
                Thank you for registering with KSS - Krishna Sada Sahayate
              </CardDescription>

              {/* Pending Status Badge */}
              <div className="flex justify-center mt-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/20">
                  <div className="w-2 h-2 rounded-full bg-warning animate-pulse"></div>
                  <span className="text-sm font-semibold text-warning">Pending Admin Approval</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
              {/* Registration Details Card */}
              <div className="bg-gradient-to-br from-muted/80 to-muted/50 rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4 border border-border/50 shadow-sm">
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4 pb-2 border-b border-border/50">
                  Registration Details
                </h3>
                
                <div className="space-y-3 sm:space-y-4">
                  {/* Member ID */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-3 bg-background/50 rounded-lg border border-border/30">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Member ID
                    </span>
                    <span className="font-mono font-bold text-base sm:text-lg text-primary break-all">
                      {registrationSuccess.memberId}
                    </span>
                  </div>

                  {/* Name */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-3 bg-background/50 rounded-lg border border-border/30">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Name
                    </span>
                    <span className="font-semibold text-sm sm:text-base text-foreground break-words text-right sm:text-left">
                      {registrationSuccess.name}
                    </span>
                  </div>

                  {/* Member Type */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-3 bg-background/50 rounded-lg border border-border/30">
                    <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Member Type
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold bg-primary/10 text-primary capitalize">
                      {registrationSuccess.memberType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4 sm:p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-bold">!</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Important Note
                    </p>
                    <p className="text-xs sm:text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                      Your registration is <strong>pending admin approval</strong>. Please save your <strong>Member ID</strong> for future reference. Our team will review your registration, verify the details, and contact you once approved. You will receive your registration form and ID card after approval.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                <Button
                  onClick={() => {
                    setRegistrationSuccess(null);
                    form.reset();
                    setCurrentStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  Register Another Member
                </Button>
                <Button
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  variant="outline"
                  className="w-full sm:flex-1"
                  size="lg"
                >
                  Go to Home
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer Note */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Need help? Contact us at{" "}
              <a href="mailto:support@krushnasadasahayte.org" className="text-primary hover:underline font-medium">
                support@krushnasadasahayte.org
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="flex items-center justify-center gap-3">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                <img 
                  src="/logo_kss-removebg-preview.png" 
                  alt="KSS Logo" 
                  className="h-12 w-12 md:h-16 md:w-16 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="h-12 w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg md:text-xl hidden">
                  KSS
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">
                KSS Member Registration
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground font-medium">
                Krishna Sada Sahayate
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Join KSS - Krishna Sada Sahayate. Fill in your details to become a member.
          </p>
          <p className="text-xs sm:text-sm text-muted-foreground">
            All fields marked with <span className="text-destructive font-semibold">*</span> are required
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 sm:mb-8 bg-card rounded-lg border p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm sm:text-base font-semibold text-foreground">Step {currentStep} of {totalSteps}</span>
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2.5 mb-4" />
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex flex-col items-center flex-1 ${
                  step < currentStep ? "text-success" : step === currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                    step < currentStep
                      ? "bg-success text-white shadow-md"
                      : step === currentStep
                      ? "bg-primary text-white shadow-lg scale-110"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step < currentStep ? "✓" : step}
                </div>
                <span className="text-[10px] sm:text-xs mt-1.5 text-center leading-tight">
                  {step === 1 ? "Personal" : step === 2 ? "Contact" : step === 3 ? "Details" : step === 4 ? "Member" : "Signature"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (err) => {
              const errors = form.formState.errors as Record<string, unknown>;
              const allKeys = flattenErrors(errors);
              const firstStep = allKeys.length
                ? Math.min(...allKeys.map((k) => fieldToStep(k)))
                : 1;
              setCurrentStep(firstStep);
              window.scrollTo({ top: 0, behavior: "smooth" });
              toast.error("Please fix all errors before submitting. Check the highlighted step.");
            })}
            className="space-y-6"
          >
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter middle name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parentsName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's / Husband's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idProofType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID Proof Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID proof type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Aadhaar">Aadhaar</SelectItem>
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="PAN">PAN</SelectItem>
                            <SelectItem value="Driving License">Driving License</SelectItem>
                            <SelectItem value="Voter ID">Voter ID</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="aadharNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aadhaar Number</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter 12-digit Aadhaar number"
                          maxLength={12}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 12) field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Enter 12 digits without spaces</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              if (e.target.value) {
                                const birthDate = new Date(e.target.value);
                                const today = new Date();
                                const age = Math.floor(
                                  (today.getTime() - birthDate.getTime()) /
                                    (365.25 * 24 * 60 * 60 * 1000)
                                );
                                form.setValue("age", age.toString());
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="150"
                            placeholder="Auto-calculated or enter manually"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <div className="flex flex-wrap gap-6">
                        {(["male", "female", "other"] as const).map((gender) => (
                          <div key={gender} className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`gender-${gender}`}
                              checked={field.value === gender}
                              onChange={() => field.onChange(gender)}
                              className="h-4 w-4"
                            />
                            <Label htmlFor={`gender-${gender}`} className="cursor-pointer font-normal capitalize">
                              {gender}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 10) field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>This is required for registration</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Photo</FormLabel>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={photoPreview || field.value || undefined} />
                          <AvatarFallback>Photo</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 w-full">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                            className="cursor-pointer"
                          />
                          {uploadingPhoto && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <Loader2 className="inline h-3 w-3 animate-spin mr-1" />
                              Uploading...
                            </p>
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            )}

            {/* Step 2: Contact Information */}
            {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter 10-digit mobile number"
                            maxLength={10}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 10) field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsappNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter 10-digit WhatsApp number"
                            maxLength={10}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 10) {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            )}

            {/* Step 3: Address, Professional & Family Information */}
            {currentStep === 3 && (
            <>
            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3a</span>
                  Emergency Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter emergency contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact.relation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relation</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Brother, Father, Mother" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="emergencyContact.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 10) field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3b</span>
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter street address" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {INDIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.pincode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pincode</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter 6-digit pincode"
                            maxLength={6}
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 6) field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3c</span>
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter occupation" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="business"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter business details" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="educationDetails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., B.Tech, MBA, etc."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Family Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3d</span>
                  Family Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="fatherBusiness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Father's Business</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter father's business" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherBusiness"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Business</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mother's business" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="familyMembersCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Family Members Count</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter count (optional)"
                            value={field.value === undefined || field.value === null ? "" : String(field.value)}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/\D/g, "");
                              if (raw === "") {
                                field.onChange(undefined);
                                return;
                              }
                              const n = parseInt(raw, 10);
                              if (!isNaN(n) && n >= 1) field.onChange(n);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Numbers only. Leave blank if not applicable.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            </>
            )}

            {/* Step 4: Member Details & Volunteer Interests */}
            {currentStep === 4 && (
            <>
            {/* Volunteer Interest Details (only for volunteers) */}
            {memberType === "volunteer" && (
            <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                    Volunteer Interest Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area of Interest (Select all that apply)</FormLabel>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            "Social Service",
                            "Blood Donation Camps",
                            "Women Empowerment",
                            "Education & Awareness",
                            "Medical/Health Camps",
                            "Event Management",
                            "Religious & Cultural Activities",
                          ].map((interest) => (
                            <div key={interest} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`interest-${interest}`}
                                checked={field.value?.includes(interest.toLowerCase()) || false}
                                onChange={(e) => {
                                  const currentInterests = field.value || [];
                                  if (e.target.checked) {
                                    field.onChange([...currentInterests, interest.toLowerCase()]);
                                  } else {
                                    field.onChange(
                                      currentInterests.filter((i) => i !== interest.toLowerCase())
                                    );
                                  }
                                }}
                                className="h-4 w-4"
                              />
                              <Label htmlFor={`interest-${interest}`} className="cursor-pointer font-normal">
                                {interest}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <div className="flex flex-wrap gap-6">
                          {[
                            { label: "Full-Time", value: "full-time" },
                            { label: "Part-Time", value: "part-time" },
                            { label: "Event-Based", value: "event-based" },
                          ].map((option) => (
                            <div key={option.value} className="flex items-center gap-2">
                              <input
                                type="radio"
                                id={`availability-${option.value}`}
                                checked={field.value === option.value}
                                onChange={() => field.onChange(option.value)}
                                className="h-4 w-4"
                              />
                              <Label htmlFor={`availability-${option.value}`} className="cursor-pointer font-normal">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}

            {/* Member Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Member Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="memberType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Member Type <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select member type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="volunteer">Volunteer</SelectItem>
                          <SelectItem value="donor">Donor</SelectItem>
                          <SelectItem value="beneficiary">Beneficiary</SelectItem>
                          <SelectItem value="core">Core Team</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information you'd like to share..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            </>
            )}

            {/* Step 5: Signature */}
            {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Signature
                </CardTitle>
                <CardDescription>
                  Please draw your signature in the box below. This signature will be used for official registration documents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="signature"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SignatureCanvas
                          onSignatureChange={(signature) => {
                            field.onChange(signature);
                          }}
                          initialSignature={field.value || undefined}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            )}

            {/* Navigation Buttons */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-4 pb-4 mt-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:static sm:bg-transparent sm:border-0 sm:pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-4xl mx-auto">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={prevStep}
                    className="w-full sm:w-auto sm:min-w-[120px] order-2 sm:order-1"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    size="lg"
                    onClick={nextStep}
                    className="w-full sm:flex-1 order-1 sm:order-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all"
                  >
                    Next Step
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 order-1 sm:order-2 bg-success hover:bg-success/90 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Registration
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
