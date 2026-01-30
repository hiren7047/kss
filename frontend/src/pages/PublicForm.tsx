import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { formsApi, Form, FormField } from "@/lib/api/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function PublicForm() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch form by token (public endpoint, no auth needed)
  const { data: formResponse, isLoading, error } = useQuery({
    queryKey: ['publicForm', token],
    queryFn: async () => {
      // Use direct API call without auth token for public forms
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/forms/public/token/${token}`);
      if (!response.ok) {
        throw new Error('Form not found');
      }
      return response.json();
    },
    enabled: !!token,
    retry: 1,
  });

  const form = formResponse?.data;


  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleFileChange = (fieldId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles((prev) => ({
      ...prev,
      [fieldId]: selectedFiles,
    }));
  };

  const handleCheckboxChange = (fieldId: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const currentValues = prev[fieldId] || [];
      const values = Array.isArray(currentValues) ? [...currentValues] : [];
      
      if (checked) {
        if (!values.includes(value)) {
          values.push(value);
        }
      } else {
        const index = values.indexOf(value);
        if (index > -1) {
          values.splice(index, 1);
        }
      }
      
      return {
        ...prev,
        [fieldId]: values,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;

    // Check if form is accepting submissions (allow draft and active)
    const canSubmit = (form.status === 'active' || form.status === 'draft') && 
      (!form.startDate || new Date(form.startDate) <= new Date()) &&
      (!form.endDate || new Date(form.endDate) >= new Date()) &&
      (!form.maxSubmissions || form.submissionCount < form.maxSubmissions);

    if (!canSubmit) {
      let message = 'This form is not currently accepting submissions.';
      if (form.status === 'inactive' || form.status === 'closed') {
        message = `This form is ${form.status} and not accepting submissions.`;
      } else if (form.startDate && new Date(form.startDate) > new Date()) {
        message = `This form will start accepting submissions on ${new Date(form.startDate).toLocaleDateString()}.`;
      } else if (form.endDate && new Date(form.endDate) < new Date()) {
        message = `This form closed on ${new Date(form.endDate).toLocaleDateString()}.`;
      } else if (form.maxSubmissions && form.submissionCount >= form.maxSubmissions) {
        message = 'This form has reached its maximum number of submissions.';
      }
      toast.error(message);
      return;
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.required) {
        const value = formData[field.fieldId];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          toast.error(`Please fill in the required field: ${field.label}`);
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add responses as JSON string (backend will parse it)
      submitData.append('responses', JSON.stringify(formData));

      // Add file uploads - multer will handle these
      Object.entries(files).forEach(([fieldId, fileList]) => {
        fileList.forEach((file) => {
          submitData.append(fieldId, file);
        });
      });

      // Use direct fetch for public submission (no auth)
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/forms/public/token/${token}/submit`, {
        method: 'POST',
        body: submitData,
        // Don't set Content-Type header - browser will set it with boundary for FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to submit form' }));
        throw new Error(errorData.message || 'Failed to submit form');
      }

      const result = await response.json();
      toast.success(result.message || 'Form submitted successfully!');
      
      if (result.data?.redirectUrl) {
        window.location.href = result.data.redirectUrl;
      } else {
        // Clear form
        setFormData({});
        setFiles({});
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.fieldId] || '';
    const fieldFiles = files[field.fieldId] || [];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <Input
            type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text'}
            value={value}
            onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.fieldId, parseFloat(e.target.value) || '')}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleInputChange(field.fieldId, val)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleInputChange(field.fieldId, val)}
            required={field.required}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.fieldId}-${option.value}`} />
                <Label htmlFor={`${field.fieldId}-${option.value}`} className="font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => {
              const currentValues = Array.isArray(value) ? value : [];
              const isChecked = currentValues.includes(option.value);
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.fieldId}-${option.value}`}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange(field.fieldId, option.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`${field.fieldId}-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </div>
        );

      case 'file':
        return (
          <div>
            <Input
              type="file"
              onChange={(e) => handleFileChange(field.fieldId, e)}
              required={field.required}
              multiple={false}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />
            {fieldFiles.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {fieldFiles.length} file(s) selected
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
              <p className="text-muted-foreground mb-4">
                The form you're looking for doesn't exist or is no longer available.
              </p>
              <Button onClick={() => navigate('/')}>Go to Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if form is accepting submissions (allow draft and active, block inactive/closed)
  const isAcceptingSubmissions = (form.status === 'active' || form.status === 'draft') && 
    (!form.startDate || new Date(form.startDate) <= new Date()) &&
    (!form.endDate || new Date(form.endDate) >= new Date()) &&
    (!form.maxSubmissions || form.submissionCount < form.maxSubmissions);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl">{form.title}</CardTitle>
            </div>
            {form.description && (
              <CardDescription className="text-base">{form.description}</CardDescription>
            )}
            {form.eventId && (
              <div className="mt-2">
                <Badge variant="outline">Event: {form.eventId.name}</Badge>
              </div>
            )}
            {!isAcceptingSubmissions && (
              <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-warning">
                      {form.status === 'inactive' || form.status === 'closed'
                        ? `This form is ${form.status} and not accepting submissions.`
                        : form.startDate && new Date(form.startDate) > new Date()
                        ? `This form will start accepting submissions on ${new Date(form.startDate).toLocaleDateString()}.`
                        : form.endDate && new Date(form.endDate) < new Date()
                        ? `This form closed on ${new Date(form.endDate).toLocaleDateString()}.`
                        : form.maxSubmissions && form.submissionCount >= form.maxSubmissions
                        ? 'This form has reached its maximum number of submissions.'
                        : 'This form is not currently accepting submissions.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {form.status === 'draft' && isAcceptingSubmissions && (
              <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-info mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-info">
                      This form is in draft mode. You can submit it for testing purposes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.fields
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((field) => (
                  <div key={field.fieldId} className="space-y-2">
                    <Label htmlFor={field.fieldId}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                    {field.placeholder && field.type !== 'textarea' && field.type !== 'select' && (
                      <p className="text-xs text-muted-foreground">{field.placeholder}</p>
                    )}
                  </div>
                ))}

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !isAcceptingSubmissions}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Form'
                  )}
                </Button>
              </div>
              {!isAcceptingSubmissions && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  You can view this form, but submissions are currently disabled.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
