import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, X, Download, CreditCard } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { membersApi, CreateMemberRequest } from "@/lib/api/members";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberRegistrationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (member: any) => void;
}

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

export function MemberRegistrationForm({
  open,
  onOpenChange,
  onSuccess,
}: MemberRegistrationFormProps) {
  const queryClient = useQueryClient();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState<CreateMemberRequest>({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
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
    familyMembersCount: 1,
    interests: [],
    availability: "",
    memberType: "volunteer",
    status: "active",
  });

  const createMutation = useMutation({
    mutationFn: membersApi.createMember,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      
      // If volunteer was created, show credentials
      if (response.data.memberType === 'volunteer' && response.data.volunteerCredentials) {
        const creds = response.data.volunteerCredentials;
        toast.success(
          `Volunteer registered! Registration ID: ${creds.registrationId}, Password: ${creds.password}`,
          { duration: 10000 }
        );
        // Also show in alert for better visibility
        setTimeout(() => {
          alert(`Volunteer Registration Successful!\n\nRegistration ID: ${creds.registrationId}\nPassword: ${creds.password}\n\nPlease note these credentials and share with the volunteer.`);
        }, 500);
      } else {
        toast.success("Member registered successfully!");
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to register member");
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingPhoto(true);
    try {
      const response = await membersApi.uploadPhoto(file);
      setFormData({ ...formData, photo: response.data.photoUrl });
      setPhotoPreview(URL.createObjectURL(file));
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleClose = () => {
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      age: "",
      gender: "",
      parentsName: "",
      fatherBusiness: "",
      motherBusiness: "",
      email: "",
      mobile: "",
      whatsappNumber: "",
      emergencyContact: { name: "", number: "", relation: "" },
      address: { street: "", city: "", state: "", country: "India", pincode: "" },
      aadharNumber: "",
      idProofType: "Aadhaar",
      photo: "",
      occupation: "",
      business: "",
      educationDetails: "",
      familyMembersCount: 1,
      interests: [],
      availability: "",
      memberType: "volunteer",
      status: "active",
    });
    setPhotoPreview(null);
    onOpenChange(false);
  };

  const handleDownload = async (memberId: string, type: "form" | "card") => {
    try {
      const blob = type === "form"
        ? await membersApi.downloadRegistrationForm(memberId)
        : await membersApi.downloadIdCard(memberId);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "form" ? `registration_${memberId}.pdf` : `idcard_${memberId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Downloaded ${type === "form" ? "registration form" : "ID card"}`);
    } catch (error: any) {
      toast.error("Failed to download file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Member Registration Form</DialogTitle>
          <DialogDescription className="text-base">
            Fill in all the details to register a new member. This form is used to generate official registration documents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-4">
          {/* Personal Information */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 text-primary">1. Personal Information</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentsName">Father's / Husband's Name</Label>
                <Input
                  id="parentsName"
                  value={formData.parentsName}
                  onChange={(e) => setFormData({ ...formData, parentsName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idProofType">ID Proof Submitted</Label>
                <Select
                  value={formData.idProofType || "Aadhaar"}
                  onValueChange={(value) => setFormData({ ...formData, idProofType: value })}
                >
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadharNumber">Aadhaar No.</Label>
              <Input
                id="aadharNumber"
                value={formData.aadharNumber}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 12) {
                    setFormData({ ...formData, aadharNumber: value });
                  }
                }}
                maxLength={12}
                placeholder="4805-7517-4180"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    const dob = e.target.value;
                    setFormData({ ...formData, dateOfBirth: dob });
                    // Calculate age
                    if (dob) {
                      const birthDate = new Date(dob);
                      const today = new Date();
                      const age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                      setFormData(prev => ({ ...prev, dateOfBirth: dob, age: age.toString() }));
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="150"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Gender</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="gender-male"
                    name="gender"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="gender-male" className="cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="gender-female"
                    name="gender"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="gender-female" className="cursor-pointer">Female</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    id="gender-other"
                    name="gender"
                    value="other"
                    checked={formData.gender === "other"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="gender-other" className="cursor-pointer">Other</Label>
                </div>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={photoPreview || formData.photo || undefined} />
                  <AvatarFallback>Photo</AvatarFallback>
                </Avatar>
                <div className="flex-1">
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
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 text-primary">2. Contact Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber || ""}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email ID (if any)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Volunteer Interest Details (only for volunteers) */}
          {formData.memberType === "volunteer" && (
            <div className="space-y-4 p-4 rounded-lg border bg-card">
              <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 text-primary">3. Volunteer Interest Details</h3>
              
              <div className="space-y-2">
                <Label>Area of Interest (Tick✔)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Social Service',
                    'Blood Donation Camps',
                    'Women Empowerment',
                    'Education & Awareness',
                    'Medical/Health Camps',
                    'Event Management',
                    'Religious & Cultural Activities'
                  ].map((interest) => (
                    <div key={interest} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`interest-${interest}`}
                        checked={formData.interests?.includes(interest.toLowerCase()) || false}
                        onChange={(e) => {
                          const currentInterests = formData.interests || [];
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              interests: [...currentInterests, interest.toLowerCase()]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              interests: currentInterests.filter(i => i !== interest.toLowerCase())
                            });
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
                <div className="flex items-center gap-2 mt-2">
                  <Label>Other:</Label>
                  <Input
                    placeholder="Specify other interests"
                    className="flex-1"
                    onBlur={(e) => {
                      if (e.target.value) {
                        const currentInterests = formData.interests || [];
                        if (!currentInterests.includes(e.target.value.toLowerCase())) {
                          setFormData({
                            ...formData,
                            interests: [...currentInterests, e.target.value.toLowerCase()]
                          });
                        }
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="flex items-center gap-6">
                  {[
                    { label: 'Full-Time', value: 'full-time' },
                    { label: 'Part-Time', value: 'part-time' },
                    { label: 'Event-Based', value: 'event-based' }
                  ].map((option) => (
                    <div key={option.value} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`availability-${option.value}`}
                        name="availability"
                        value={option.value}
                        checked={formData.availability === option.value}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                        className="h-4 w-4"
                      />
                      <Label htmlFor={`availability-${option.value}`} className="cursor-pointer font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact Details */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 text-primary">4. Emergency Contact Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyName">Name</Label>
                <Input
                  id="emergencyName"
                  value={formData.emergencyContact?.name || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        name: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">Relation</Label>
                <Input
                  id="emergencyRelation"
                  value={formData.emergencyContact?.relation || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      emergencyContact: {
                        ...formData.emergencyContact,
                        relation: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g., Brother, Father, Mother"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyNumber">Mobile No.</Label>
              <Input
                id="emergencyNumber"
                value={formData.emergencyContact?.number || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: {
                      ...formData.emergencyContact,
                      number: e.target.value,
                    },
                  })
                }
                maxLength={10}
                pattern="[0-9]{10}"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 text-primary">5. Address Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Textarea
                id="street"
                value={formData.address?.street || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address?.city || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.address?.state || ""}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address?.country || "India"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, country: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.address?.pincode || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, pincode: e.target.value },
                    })
                  }
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 text-primary">6. Professional Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business">Business</Label>
                <Input
                  id="business"
                  value={formData.business}
                  onChange={(e) => setFormData({ ...formData, business: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="educationDetails">Education Details</Label>
              <Textarea
                id="educationDetails"
                value={formData.educationDetails}
                onChange={(e) => setFormData({ ...formData, educationDetails: e.target.value })}
                rows={3}
                placeholder="e.g., B.Tech, MBA, etc."
              />
            </div>
          </div>

          {/* Family Information */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 text-primary">7. Family Information</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fatherBusiness">Father's Business</Label>
                <Input
                  id="fatherBusiness"
                  value={formData.fatherBusiness}
                  onChange={(e) => setFormData({ ...formData, fatherBusiness: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherBusiness">Mother's Business</Label>
                <Input
                  id="motherBusiness"
                  value={formData.motherBusiness}
                  onChange={(e) => setFormData({ ...formData, motherBusiness: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyMembersCount">Family Members Count</Label>
                <Input
                  id="familyMembersCount"
                  type="number"
                  min="1"
                  value={formData.familyMembersCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      familyMembersCount: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Member Type */}
          <div className="space-y-4 p-4 rounded-lg border bg-card">
            <h3 className="text-lg font-semibold border-b-2 border-primary pb-2 text-primary">8. Member Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="memberType">Member Type *</Label>
                <Select
                  value={formData.memberType}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, memberType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="volunteer">Volunteer</SelectItem>
                    <SelectItem value="donor">Donor</SelectItem>
                    <SelectItem value="beneficiary">Beneficiary</SelectItem>
                    <SelectItem value="core">Core Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

