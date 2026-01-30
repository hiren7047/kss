import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Save,
  Loader2,
  Globe,
  Phone,
  Mail,
  MapPin,
  Clock,
  CreditCard,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
  Send,
  Linkedin,
  Palette,
  Users,
  FileSignature,
  Bell,
  Shield,
} from "lucide-react";
import { siteSettingsApi, SiteSettings } from "@/lib/api/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function SiteSettingsManagement() {
  const [editingSettings, setEditingSettings] = useState<Partial<SiteSettings>>({});
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: () => siteSettingsApi.get(),
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SiteSettings>) => siteSettingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      toast.success('Site settings updated successfully');
    },
  });

  useEffect(() => {
    if (data?.data) {
      setEditingSettings(data.data);
    }
  }, [data]);

  const handleSave = () => {
    updateMutation.mutate(editingSettings);
  };

  const updateNested = (path: string[], value: any) => {
    const newSettings = { ...editingSettings };
    let current: any = newSettings;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setEditingSettings(newSettings);
  };

  const updateLanguageField = (section: string, field: string, lang: string, value: string) => {
    const newSettings = { ...editingSettings };
    if (!newSettings[section as keyof SiteSettings]) {
      newSettings[section as keyof SiteSettings] = {} as any;
    }
    const sectionData = newSettings[section as keyof SiteSettings] as any;
    if (!sectionData[field]) sectionData[field] = {};
    sectionData[field][lang] = value;
    setEditingSettings(newSettings);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load site settings</p>
          <p className="text-sm text-muted-foreground">
            {(error as any)?.response?.data?.message || 'Please try again later'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Site Settings</h1>
            <p className="page-description">
              Manage global website settings and information
            </p>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="payment">Payment Info</TabsTrigger>
          <TabsTrigger value="donation">Donation</TabsTrigger>
          <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          <TabsTrigger value="governance">Governance & Signatories</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="finance">Finance & Receipts</TabsTrigger>
          <TabsTrigger value="communication">Communication & Alerts</TabsTrigger>
          <TabsTrigger value="system">System Preferences</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* Organization */}
        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="en">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="gu">Gujarati</TabsTrigger>
                  <TabsTrigger value="hi">Hindi</TabsTrigger>
                </TabsList>
                {['en', 'gu', 'hi'].map((lang) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Organization Name ({lang.toUpperCase()})</Label>
                        <Input
                          value={(editingSettings.organizationName as any)?.[lang] || ''}
                          onChange={(e) => updateLanguageField('organizationName', 'name', lang, e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tagline ({lang.toUpperCase()})</Label>
                        <Input
                          value={(editingSettings.tagline as any)?.[lang] || ''}
                          onChange={(e) => updateLanguageField('tagline', 'tagline', lang, e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Info */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={editingSettings.contactInfo?.phone || ''}
                    onChange={(e) => updateNested(['contactInfo', 'phone'], e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input
                    value={editingSettings.contactInfo?.whatsapp || ''}
                    onChange={(e) => updateNested(['contactInfo', 'whatsapp'], e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editingSettings.contactInfo?.email || ''}
                    onChange={(e) => updateNested(['contactInfo', 'email'], e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Address</Label>
                <Tabs defaultValue="en">
                  <TabsList>
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="gu">Gujarati</TabsTrigger>
                    <TabsTrigger value="hi">Hindi</TabsTrigger>
                  </TabsList>
                  {['en', 'gu', 'hi'].map((lang) => (
                    <TabsContent key={lang} value={lang}>
                      <Textarea
                        value={(editingSettings.contactInfo?.address as any)?.[lang] || ''}
                        onChange={(e) => {
                          const newSettings = { ...editingSettings };
                          if (!newSettings.contactInfo) newSettings.contactInfo = {} as any;
                          if (!newSettings.contactInfo.address) newSettings.contactInfo.address = {} as any;
                          (newSettings.contactInfo.address as any)[lang] = e.target.value;
                          setEditingSettings(newSettings);
                        }}
                        rows={3}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Office Hours (Mon-Sat)</Label>
                  <Input
                    value={editingSettings.contactInfo?.officeHours?.monSat || ''}
                    onChange={(e) => updateNested(['contactInfo', 'officeHours', 'monSat'], e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Office Hours (Sunday)</Label>
                  <Input
                    value={editingSettings.contactInfo?.officeHours?.sunday || ''}
                    onChange={(e) => updateNested(['contactInfo', 'officeHours', 'sunday'], e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Map Embed URL</Label>
                <Input
                  value={editingSettings.contactInfo?.mapEmbedUrl || ''}
                  onChange={(e) => updateNested(['contactInfo', 'mapEmbedUrl'], e.target.value)}
                  placeholder="Google Maps embed URL"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Facebook</Label>
                  <Input
                    value={editingSettings.socialMedia?.facebook || ''}
                    onChange={(e) => updateNested(['socialMedia', 'facebook'], e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    value={editingSettings.socialMedia?.instagram || ''}
                    onChange={(e) => updateNested(['socialMedia', 'instagram'], e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>YouTube</Label>
                  <Input
                    value={editingSettings.socialMedia?.youtube || ''}
                    onChange={(e) => updateNested(['socialMedia', 'youtube'], e.target.value)}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Twitter</Label>
                  <Input
                    value={editingSettings.socialMedia?.twitter || ''}
                    onChange={(e) => updateNested(['socialMedia', 'twitter'], e.target.value)}
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp Community Link
                  </Label>
                  <Input
                    value={editingSettings.socialMedia?.whatsappCommunity || ''}
                    onChange={(e) => updateNested(['socialMedia', 'whatsappCommunity'], e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Telegram Channel / Group
                  </Label>
                  <Input
                    value={editingSettings.socialMedia?.telegram || ''}
                    onChange={(e) => updateNested(['socialMedia', 'telegram'], e.target.value)}
                    placeholder="https://t.me/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn Page
                  </Label>
                  <Input
                    value={editingSettings.socialMedia?.linkedin || ''}
                    onChange={(e) => updateNested(['socialMedia', 'linkedin'], e.target.value)}
                    placeholder="https://linkedin.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Info */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input
                    value={editingSettings.paymentInfo?.upiId || ''}
                    onChange={(e) => updateNested(['paymentInfo', 'upiId'], e.target.value)}
                    placeholder="kss@upi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Account</Label>
                  <Input
                    value={editingSettings.paymentInfo?.bankAccount || ''}
                    onChange={(e) => updateNested(['paymentInfo', 'bankAccount'], e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    value={editingSettings.paymentInfo?.bankName || ''}
                    onChange={(e) => updateNested(['paymentInfo', 'bankName'], e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input
                    value={editingSettings.paymentInfo?.ifscCode || ''}
                    onChange={(e) => updateNested(['paymentInfo', 'ifscCode'], e.target.value)}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Tax Info (80G)</Label>
                  <Textarea
                    value={editingSettings.paymentInfo?.taxInfo || ''}
                    onChange={(e) => updateNested(['paymentInfo', 'taxInfo'], e.target.value)}
                    rows={3}
                    placeholder="Tax benefit information..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donation Settings */}
        <TabsContent value="donation">
          <Card>
            <CardHeader>
              <CardTitle>Donation Amounts</CardTitle>
              <CardDescription>
                Configure the predefined donation amounts shown on the donation page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Donation Amounts (₹)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter amounts separated by commas (e.g., 500,1000,2500,5000,10000,25000)
                </p>
                <Input
                  value={(editingSettings.donationAmounts || []).join(',')}
                  onChange={(e) => {
                    const amounts = e.target.value
                      .split(',')
                      .map(a => a.trim())
                      .filter(a => a)
                      .map(a => {
                        const num = parseInt(a);
                        return isNaN(num) ? null : num;
                      })
                      .filter(a => a !== null && a > 0) as number[];
                    setEditingSettings({ ...editingSettings, donationAmounts: amounts });
                  }}
                  placeholder="500, 1000, 2500, 5000, 10000, 25000"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {(editingSettings.donationAmounts || []).map((amount, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1 text-sm font-medium"
                    >
                      <span>₹{amount.toLocaleString('en-IN')}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newAmounts = [...(editingSettings.donationAmounts || [])];
                          newAmounts.splice(index, 1);
                          setEditingSettings({ ...editingSettings, donationAmounts: newAmounts });
                        }}
                        className="text-destructive hover:text-destructive/80"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                {(!editingSettings.donationAmounts || editingSettings.donationAmounts.length === 0) && (
                  <p className="text-sm text-muted-foreground">
                    Default amounts will be used: ₹500, ₹1,000, ₹2,500, ₹5,000, ₹10,000, ₹25,000
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Settings */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Title</Label>
                <Input
                  value={editingSettings.seoSettings?.defaultTitle || ''}
                  onChange={(e) => updateNested(['seoSettings', 'defaultTitle'], e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Description</Label>
                <Textarea
                  value={editingSettings.seoSettings?.defaultDescription || ''}
                  onChange={(e) => updateNested(['seoSettings', 'defaultDescription'], e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Default Keywords</Label>
                <Input
                  value={editingSettings.seoSettings?.defaultKeywords || ''}
                  onChange={(e) => updateNested(['seoSettings', 'defaultKeywords'], e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input
                    value={editingSettings.seoSettings?.ogImage || ''}
                    onChange={(e) => updateNested(['seoSettings', 'ogImage'], e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input
                    value={editingSettings.seoSettings?.favicon || ''}
                    onChange={(e) => updateNested(['seoSettings', 'favicon'], e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to show maintenance message on website
                  </p>
                </div>
                <Switch
                  checked={editingSettings.maintenanceMode || false}
                  onCheckedChange={(checked) => setEditingSettings({ ...editingSettings, maintenanceMode: checked })}
                />
              </div>
              {editingSettings.maintenanceMode && (
                <div className="space-y-2">
                  <Label>Maintenance Message</Label>
                  <Textarea
                    value={editingSettings.maintenanceMessage || ''}
                    onChange={(e) => setEditingSettings({ ...editingSettings, maintenanceMessage: e.target.value })}
                    rows={4}
                    placeholder="Website is under maintenance..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Governance & Signatories */}
        <TabsContent value="governance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Governance & Signatories
              </CardTitle>
              <CardDescription>
                Manage governing body members and authorised signatories for receipts and certificates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Governing Body</h3>
                <p className="text-xs text-muted-foreground">
                  Add trustees, directors and core team members. This information can be used on the About page and internal reports.
                </p>
                <div className="space-y-3">
                  {(editingSettings.governance?.governingBody || []).map((member, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-5 gap-3 rounded-md border bg-muted/40 p-3"
                    >
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={member.name || ""}
                          onChange={(e) => {
                            const next = { ...(editingSettings.governance || {}), governingBody: [...(editingSettings.governance?.governingBody || [])] };
                            next.governingBody![index] = { ...member, name: e.target.value };
                            setEditingSettings({ ...editingSettings, governance: next });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Designation</Label>
                        <Input
                          value={member.designation || ""}
                          onChange={(e) => {
                            const next = { ...(editingSettings.governance || {}), governingBody: [...(editingSettings.governance?.governingBody || [])] };
                            next.governingBody![index] = { ...member, designation: e.target.value };
                            setEditingSettings({ ...editingSettings, governance: next });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Photo URL</Label>
                        <Input
                          value={member.photoUrl || ""}
                          onChange={(e) => {
                            const next = { ...(editingSettings.governance || {}), governingBody: [...(editingSettings.governance?.governingBody || [])] };
                            next.governingBody![index] = { ...member, photoUrl: e.target.value };
                            setEditingSettings({ ...editingSettings, governance: next });
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="space-y-1">
                          <Label className="text-xs">Order</Label>
                          <Input
                            type="number"
                            value={member.order ?? index}
                            onChange={(e) => {
                              const order = parseInt(e.target.value) || 0;
                              const next = { ...(editingSettings.governance || {}), governingBody: [...(editingSettings.governance?.governingBody || [])] };
                              next.governingBody![index] = { ...member, order };
                              setEditingSettings({ ...editingSettings, governance: next });
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="self-end text-xs text-destructive hover:underline mt-1"
                          onClick={() => {
                            const nextMembers = [...(editingSettings.governance?.governingBody || [])];
                            nextMembers.splice(index, 1);
                            setEditingSettings({
                              ...editingSettings,
                              governance: {
                                ...(editingSettings.governance || {}),
                                governingBody: nextMembers,
                              },
                            });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="col-span-5 space-y-1">
                        <Label className="text-xs">Short Bio (optional)</Label>
                        <Textarea
                          rows={2}
                          value={member.bio || ""}
                          onChange={(e) => {
                            const next = { ...(editingSettings.governance || {}), governingBody: [...(editingSettings.governance?.governingBody || [])] };
                            next.governingBody![index] = { ...member, bio: e.target.value };
                            setEditingSettings({ ...editingSettings, governance: next });
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const nextMembers = [
                        ...(editingSettings.governance?.governingBody || []),
                        { name: "", designation: "", order: (editingSettings.governance?.governingBody || []).length },
                      ];
                      setEditingSettings({
                        ...editingSettings,
                        governance: {
                          ...(editingSettings.governance || {}),
                          governingBody: nextMembers,
                        },
                      });
                    }}
                  >
                    Add Member
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                  <FileSignature className="h-4 w-4" />
                  Authorised Signatories
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configure who signs donation receipts, 80G certificates and volunteer documents.
                </p>
                <div className="space-y-3">
                  {(editingSettings.governance?.signatories || []).map((signatory, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-5 gap-3 rounded-md border bg-muted/40 p-3"
                    >
                      <div className="space-y-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={signatory.name || ""}
                          onChange={(e) => {
                            const next = { ...(editingSettings.governance || {}), signatories: [...(editingSettings.governance?.signatories || [])] };
                            next.signatories![index] = { ...signatory, name: e.target.value };
                            setEditingSettings({ ...editingSettings, governance: next });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Designation</Label>
                        <Input
                          value={signatory.designation || ""}
                          onChange={(e) => {
                            const next = { ...(editingSettings.governance || {}), signatories: [...(editingSettings.governance?.signatories || [])] };
                            next.signatories![index] = { ...signatory, designation: e.target.value };
                            setEditingSettings({ ...editingSettings, governance: next });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Signature Image URL</Label>
                        <Input
                          value={signatory.signatureImageUrl || ""}
                          onChange={(e) => {
                            const next = { ...(editingSettings.governance || {}), signatories: [...(editingSettings.governance?.signatories || [])] };
                            next.signatories![index] = { ...signatory, signatureImageUrl: e.target.value };
                            setEditingSettings({ ...editingSettings, governance: next });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Stamp Image URL</Label>
                        <Input
                          value={signatory.stampImageUrl || ""}
                          onChange={(e) => {
                            const next = { ...(editingSettings.governance || {}), signatories: [...(editingSettings.governance?.signatories || [])] };
                            next.signatories![index] = { ...signatory, stampImageUrl: e.target.value };
                            setEditingSettings({ ...editingSettings, governance: next });
                          }}
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <button
                          type="button"
                          className="self-end text-xs text-destructive hover:underline"
                          onClick={() => {
                            const next = [...(editingSettings.governance?.signatories || [])];
                            next.splice(index, 1);
                            setEditingSettings({
                              ...editingSettings,
                              governance: {
                                ...(editingSettings.governance || {}),
                                signatories: next,
                              },
                            });
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="col-span-5 grid grid-cols-4 gap-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!signatory.useForDonationReceipt}
                            onChange={(e) => {
                              const next = { ...(editingSettings.governance || {}), signatories: [...(editingSettings.governance?.signatories || [])] };
                              next.signatories![index] = { ...signatory, useForDonationReceipt: e.target.checked };
                              setEditingSettings({ ...editingSettings, governance: next });
                            }}
                          />
                          Donation Receipt
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!signatory.useFor80GCertificate}
                            onChange={(e) => {
                              const next = { ...(editingSettings.governance || {}), signatories: [...(editingSettings.governance?.signatories || [])] };
                              next.signatories![index] = { ...signatory, useFor80GCertificate: e.target.checked };
                              setEditingSettings({ ...editingSettings, governance: next });
                            }}
                          />
                          80G Certificate
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!signatory.useForVolunteerCertificate}
                            onChange={(e) => {
                              const next = { ...(editingSettings.governance || {}), signatories: [...(editingSettings.governance?.signatories || [])] };
                              next.signatories![index] = { ...signatory, useForVolunteerCertificate: e.target.checked };
                              setEditingSettings({ ...editingSettings, governance: next });
                            }}
                          />
                          Volunteer Certificate
                        </label>
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!signatory.useForAppreciationLetter}
                            onChange={(e) => {
                              const next = { ...(editingSettings.governance || {}), signatories: [...(editingSettings.governance?.signatories || [])] };
                              next.signatories![index] = { ...signatory, useForAppreciationLetter: e.target.checked };
                              setEditingSettings({ ...editingSettings, governance: next });
                            }}
                          />
                          Appreciation Letter
                        </label>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next = [
                        ...(editingSettings.governance?.signatories || []),
                        { name: "", designation: "" },
                      ];
                      setEditingSettings({
                        ...editingSettings,
                        governance: {
                          ...(editingSettings.governance || {}),
                          signatories: next,
                        },
                      });
                    }}
                  >
                    Add Signatory
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
              <CardDescription>
                Control logos, colours and default hero images for the public website.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Logo URL</Label>
                  <Input
                    value={editingSettings.branding?.logos?.primaryLogoUrl || ""}
                    onChange={(e) =>
                      updateNested(["branding", "logos", "primaryLogoUrl"], e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary / White Logo URL</Label>
                  <Input
                    value={editingSettings.branding?.logos?.secondaryLogoUrl || ""}
                    onChange={(e) =>
                      updateNested(["branding", "logos", "secondaryLogoUrl"], e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emblem / Symbol URL</Label>
                  <Input
                    value={editingSettings.branding?.logos?.emblemUrl || ""}
                    onChange={(e) =>
                      updateNested(["branding", "logos", "emblemUrl"], e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Colour</Label>
                  <Input
                    placeholder="#0F766E"
                    value={editingSettings.branding?.colors?.primaryColor || ""}
                    onChange={(e) =>
                      updateNested(["branding", "colors", "primaryColor"], e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Colour</Label>
                  <Input
                    placeholder="#16A34A"
                    value={editingSettings.branding?.colors?.secondaryColor || ""}
                    onChange={(e) =>
                      updateNested(["branding", "colors", "secondaryColor"], e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Accent Colour</Label>
                  <Input
                    placeholder="#F97316"
                    value={editingSettings.branding?.colors?.accentColor || ""}
                    onChange={(e) =>
                      updateNested(["branding", "colors", "accentColor"], e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Colour</Label>
                  <Input
                    placeholder="#F9FAFB"
                    value={editingSettings.branding?.colors?.backgroundColor || ""}
                    onChange={(e) =>
                      updateNested(["branding", "colors", "backgroundColor"], e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Default Hero / Banner Image URL</Label>
                <Input
                  value={editingSettings.branding?.media?.defaultHeroImageUrl || ""}
                  onChange={(e) =>
                    updateNested(["branding", "media", "defaultHeroImageUrl"], e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance & Receipts */}
        <TabsContent value="finance">
          <Card>
            <CardHeader>
              <CardTitle>Finance & Receipts</CardTitle>
              <CardDescription>
                Configure receipt numbering, financial year and donation rules used across the system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Receipt Numbering</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Prefix</Label>
                    <Input
                      placeholder="KSS"
                      value={editingSettings.financeSettings?.receiptNumbering?.prefix || ""}
                      onChange={(e) =>
                        updateNested(
                          ["financeSettings", "receiptNumbering", "prefix"],
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Padding Length</Label>
                    <Input
                      type="number"
                      min={1}
                      max={8}
                      value={
                        editingSettings.financeSettings?.receiptNumbering?.paddingLength ?? 4
                      }
                      onChange={(e) =>
                        updateNested(
                          ["financeSettings", "receiptNumbering", "paddingLength"],
                          parseInt(e.target.value) || 4
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Include Financial Year</Label>
                    <Switch
                      checked={
                        editingSettings.financeSettings?.receiptNumbering?.includeFinancialYear ??
                        true
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          ["financeSettings", "receiptNumbering", "includeFinancialYear"],
                          checked
                        )
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Financial Year Format</Label>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={
                        editingSettings.financeSettings?.receiptNumbering?.financialYearFormat ||
                        "YYYY-YY"
                      }
                      onChange={(e) =>
                        updateNested(
                          ["financeSettings", "receiptNumbering", "financialYearFormat"],
                          e.target.value
                        )
                      }
                    >
                      <option value="YYYY-YY">2024-25</option>
                      <option value="YY-YY">24-25</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Financial Year Start Month</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={editingSettings.financeSettings?.financialYear?.startMonth ?? 4}
                      onChange={(e) =>
                        updateNested(
                          ["financeSettings", "financialYear", "startMonth"],
                          parseInt(e.target.value) || 4
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Receipt Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.financeSettings?.receiptPreferences?.showNgoPanOnReceipt ??
                        true
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          ["financeSettings", "receiptPreferences", "showNgoPanOnReceipt"],
                          checked
                        )
                      }
                    />
                    Show NGO PAN on receipts
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.financeSettings?.receiptPreferences?.donorPanMandatory ??
                        false
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          ["financeSettings", "receiptPreferences", "donorPanMandatory"],
                          checked
                        )
                      }
                    />
                    Donor PAN mandatory
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.financeSettings?.receiptPreferences
                          ?.donorAddressMandatory ?? false
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          ["financeSettings", "receiptPreferences", "donorAddressMandatory"],
                          checked
                        )
                      }
                    />
                    Donor address mandatory
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.financeSettings?.receiptPreferences
                          ?.donorEmailMandatory ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          ["financeSettings", "receiptPreferences", "donorEmailMandatory"],
                          checked
                        )
                      }
                    />
                    Donor email mandatory
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Receipt Footer Note</Label>
                  <Textarea
                    rows={3}
                    value={editingSettings.financeSettings?.receiptPreferences?.defaultReceiptFooter || ""}
                    onChange={(e) =>
                      updateNested(
                        ["financeSettings", "receiptPreferences", "defaultReceiptFooter"],
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>80G Note</Label>
                  <Textarea
                    rows={3}
                    value={editingSettings.financeSettings?.receiptPreferences?.eightyGNote || ""}
                    onChange={(e) =>
                      updateNested(
                        ["financeSettings", "receiptPreferences", "eightyGNote"],
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Donation Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Online Donation (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={
                        editingSettings.financeSettings?.donationPreferences
                          ?.minimumOnlineAmount ?? 0
                      }
                      onChange={(e) =>
                        updateNested(
                          ["financeSettings", "donationPreferences", "minimumOnlineAmount"],
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Purpose / Fund</Label>
                    <Input
                      value={
                        editingSettings.financeSettings?.donationPreferences?.defaultPurpose ||
                        ""
                      }
                      onChange={(e) =>
                        updateNested(
                          ["financeSettings", "donationPreferences", "defaultPurpose"],
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Donation QR Code Image URL</Label>
                  <Input
                    value={editingSettings.financeSettings?.qrCode?.imageUrl || ""}
                    onChange={(e) =>
                      updateNested(["financeSettings", "qrCode", "imageUrl"], e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication & Alerts */}
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Communication & Alerts
              </CardTitle>
              <CardDescription>
                Centralise email, WhatsApp and in-app notifications for admins and stakeholders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Email Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From Name</Label>
                    <Input
                      value={editingSettings.communicationSettings?.email?.fromName || ""}
                      onChange={(e) =>
                        updateNested(["communicationSettings", "email", "fromName"], e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>From Email</Label>
                    <Input
                      type="email"
                      value={editingSettings.communicationSettings?.email?.fromEmail || ""}
                      onChange={(e) =>
                        updateNested(
                          ["communicationSettings", "email", "fromEmail"],
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reply-to Email</Label>
                    <Input
                      type="email"
                      value={editingSettings.communicationSettings?.email?.replyToEmail || ""}
                      onChange={(e) =>
                        updateNested(
                          ["communicationSettings", "email", "replyToEmail"],
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default Email Footer</Label>
                  <Textarea
                    rows={3}
                    value={editingSettings.communicationSettings?.email?.defaultFooter || ""}
                    onChange={(e) =>
                      updateNested(
                        ["communicationSettings", "email", "defaultFooter"],
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Email Notifications</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={
                          editingSettings.communicationSettings?.email?.notifications
                            ?.newDonationEmailToAdmin ?? true
                        }
                        onCheckedChange={(checked) =>
                          updateNested(
                            [
                              "communicationSettings",
                              "email",
                              "notifications",
                              "newDonationEmailToAdmin",
                            ],
                            checked
                          )
                        }
                      />
                      Email admin on new online donation
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={
                          editingSettings.communicationSettings?.email?.notifications
                            ?.monthlyDonationSummaryToDirector ?? false
                        }
                        onCheckedChange={(checked) =>
                          updateNested(
                            [
                              "communicationSettings",
                              "email",
                              "notifications",
                              "monthlyDonationSummaryToDirector",
                            ],
                            checked
                          )
                        }
                      />
                      Monthly donation summary to director
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={
                          editingSettings.communicationSettings?.email?.notifications
                            ?.newVolunteerRegistrationToAdmin ?? true
                        }
                        onCheckedChange={(checked) =>
                          updateNested(
                            [
                              "communicationSettings",
                              "email",
                              "notifications",
                              "newVolunteerRegistrationToAdmin",
                            ],
                            checked
                          )
                        }
                      />
                      Email on new volunteer registration
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={
                          editingSettings.communicationSettings?.email?.notifications
                            ?.newContactEnquiryToAdmin ?? true
                        }
                        onCheckedChange={(checked) =>
                          updateNested(
                            [
                              "communicationSettings",
                              "email",
                              "notifications",
                              "newContactEnquiryToAdmin",
                            ],
                            checked
                          )
                        }
                      />
                      Email on new contact enquiry
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">WhatsApp Automations</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred Template Language</Label>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={
                        editingSettings.communicationSettings?.whatsapp?.templateLanguage || "en"
                      }
                      onChange={(e) =>
                        updateNested(
                          ["communicationSettings", "whatsapp", "templateLanguage"],
                          e.target.value
                        )
                      }
                    >
                      <option value="en">English</option>
                      <option value="gu">Gujarati</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.communicationSettings?.whatsapp?.autoMessages
                          ?.donationThankYou ?? false
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          ["communicationSettings", "whatsapp", "autoMessages", "donationThankYou"],
                          checked
                        )
                      }
                    />
                    Auto “Thank you” WhatsApp after donation
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.communicationSettings?.whatsapp?.autoMessages
                          ?.eventReminderToVolunteers ?? false
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          [
                            "communicationSettings",
                            "whatsapp",
                            "autoMessages",
                            "eventReminderToVolunteers",
                          ],
                          checked
                        )
                      }
                    />
                    Event reminder to registered volunteers
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.communicationSettings?.whatsapp?.autoMessages
                          ?.postEventThanksToVolunteers ?? false
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          [
                            "communicationSettings",
                            "whatsapp",
                            "autoMessages",
                            "postEventThanksToVolunteers",
                          ],
                          checked
                        )
                      }
                    />
                    Post-event thank you to volunteers
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  In-App Notifications
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.communicationSettings?.inAppNotifications
                          ?.lowWalletBalance ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          [
                            "communicationSettings",
                            "inAppNotifications",
                            "lowWalletBalance",
                          ],
                          checked
                        )
                      }
                    />
                    Alert when NGO wallet is low
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.communicationSettings?.inAppNotifications
                          ?.highValueDonation ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          [
                            "communicationSettings",
                            "inAppNotifications",
                            "highValueDonation",
                          ],
                          checked
                        )
                      }
                    />
                    Alert on high value donations
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.communicationSettings?.inAppNotifications
                          ?.newExpensePendingApproval ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          [
                            "communicationSettings",
                            "inAppNotifications",
                            "newExpensePendingApproval",
                          ],
                          checked
                        )
                      }
                    />
                    Notify for new expenses pending approval
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.communicationSettings?.inAppNotifications
                          ?.volunteerWorkPendingReview ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          [
                            "communicationSettings",
                            "inAppNotifications",
                            "volunteerWorkPendingReview",
                          ],
                          checked
                        )
                      }
                    />
                    Notify for volunteer work pending review
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Low Wallet Balance Threshold (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={
                        editingSettings.communicationSettings?.inAppNotifications?.thresholds
                          ?.lowWalletAmount ?? 0
                      }
                      onChange={(e) =>
                        updateNested(
                          [
                            "communicationSettings",
                            "inAppNotifications",
                            "thresholds",
                            "lowWalletAmount",
                          ],
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>High Value Donation Threshold (₹)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={
                        editingSettings.communicationSettings?.inAppNotifications?.thresholds
                          ?.highDonationAmount ?? 0
                      }
                      onChange={(e) =>
                        updateNested(
                          [
                            "communicationSettings",
                            "inAppNotifications",
                            "thresholds",
                            "highDonationAmount",
                          ],
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Preferences */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Preferences</CardTitle>
              <CardDescription>
                Configure default language, time zone, formats and privacy controls.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Language</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={editingSettings.systemPreferences?.defaultLanguage || "en"}
                    onChange={(e) =>
                      updateNested(["systemPreferences", "defaultLanguage"], e.target.value)
                    }
                  >
                    <option value="en">English</option>
                    <option value="gu">Gujarati</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Input
                    placeholder="Asia/Kolkata"
                    value={editingSettings.systemPreferences?.timezone || ""}
                    onChange={(e) =>
                      updateNested(["systemPreferences", "timezone"], e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={editingSettings.systemPreferences?.dateFormat || "DD-MM-YYYY"}
                    onChange={(e) =>
                      updateNested(["systemPreferences", "dateFormat"], e.target.value)
                    }
                  >
                    <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                    <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Number Format</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={editingSettings.systemPreferences?.numberFormat || "en-IN"}
                    onChange={(e) =>
                      updateNested(["systemPreferences", "numberFormat"], e.target.value)
                    }
                  >
                    <option value="en-IN">Indian (1,00,000)</option>
                    <option value="en-US">International (100,000)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Admin Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={720}
                    value={editingSettings.systemPreferences?.sessionTimeoutMinutes ?? 60}
                    onChange={(e) =>
                      updateNested(
                        ["systemPreferences", "sessionTimeoutMinutes"],
                        parseInt(e.target.value) || 60
                      )
                    }
                  />
                </div>
                <div className="space-y-2 flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.systemPreferences?.require2FAForSuperAdmins ?? false
                      }
                      onCheckedChange={(checked) =>
                        updateNested(["systemPreferences", "require2FAForSuperAdmins"], checked)
                      }
                    />
                    Require 2FA for super admin accounts
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground">Transparency & Privacy</h3>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.systemPreferences?.privacy?.showDonorNamesPublicly ?? true
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          ["systemPreferences", "privacy", "showDonorNamesPublicly"],
                          checked
                        )
                      }
                    />
                    Show donor names publicly on transparency page
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <Switch
                      checked={
                        editingSettings.systemPreferences?.privacy?.showDonationAmountsPublicly ??
                        false
                      }
                      onCheckedChange={(checked) =>
                        updateNested(
                          ["systemPreferences", "privacy", "showDonationAmountsPublicly"],
                          checked
                        )
                      }
                    />
                    Show donation amounts publicly
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
