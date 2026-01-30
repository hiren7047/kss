import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  FileText,
} from "lucide-react";
import { formsApi, Form, FormField, CreateFormRequest } from "@/lib/api/forms";
import { eventsApi } from "@/lib/api/events";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'radio', label: 'Radio' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'file', label: 'File Upload' },
];

export default function FormCreateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [formData, setFormData] = useState<CreateFormRequest>({
    title: '',
    description: '',
    eventId: undefined,
    fields: [],
    status: 'draft',
    allowMultipleSubmissions: false,
    maxSubmissions: undefined,
    startDate: undefined,
    endDate: undefined,
    successMessage: 'Thank you for your submission!',
    redirectUrl: undefined,
  });

  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [currentField, setCurrentField] = useState<Partial<FormField>>({
    fieldId: '',
    label: '',
    type: 'text',
    required: false,
    placeholder: '',
    options: [],
    order: 0,
  });

  // Fetch form if editing
  const { data: formDataResponse, isLoading: isLoadingForm } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.getFormById(id!),
    enabled: isEdit,
  });

  // Fetch events for dropdown
  const { data: eventsData } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.getEvents({ limit: 100 }),
  });

  // Update form data when fetched
  useEffect(() => {
    if (formDataResponse?.data) {
      const form = formDataResponse.data;
      setFormData({
        title: form.title,
        description: form.description || '',
        eventId: form.eventId?._id,
        fields: form.fields,
        status: form.status,
        allowMultipleSubmissions: form.allowMultipleSubmissions,
        maxSubmissions: form.maxSubmissions,
        startDate: form.startDate,
        endDate: form.endDate,
        successMessage: form.successMessage || 'Thank you for your submission!',
        redirectUrl: form.redirectUrl,
      });
    }
  }, [formDataResponse]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateFormRequest) => formsApi.createForm(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Form created successfully!');
      navigate('/forms');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create form');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateFormRequest>) => formsApi.updateForm(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      queryClient.invalidateQueries({ queryKey: ['form', id] });
      toast.success('Form updated successfully!');
      navigate('/forms');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update form');
    },
  });

  const handleAddField = () => {
    setCurrentField({
      fieldId: `field_${Date.now()}`,
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: [],
      order: formData.fields.length,
    });
    setEditingFieldIndex(null);
    setIsFieldDialogOpen(true);
  };

  const handleEditField = (index: number) => {
    setCurrentField(formData.fields[index]);
    setEditingFieldIndex(index);
    setIsFieldDialogOpen(true);
  };

  const handleDeleteField = (index: number) => {
    const newFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: newFields });
  };

  const handleSaveField = () => {
    if (!currentField.fieldId || !currentField.label || !currentField.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newField: FormField = {
      fieldId: currentField.fieldId,
      label: currentField.label,
      type: currentField.type as FormField['type'],
      required: currentField.required || false,
      placeholder: currentField.placeholder,
      options: currentField.options || [],
      order: currentField.order || formData.fields.length,
    };

    let newFields: FormField[];
    if (editingFieldIndex !== null) {
      newFields = [...formData.fields];
      newFields[editingFieldIndex] = newField;
    } else {
      newFields = [...formData.fields, newField];
    }

    setFormData({ ...formData, fields: newFields });
    setIsFieldDialogOpen(false);
    setCurrentField({
      fieldId: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: '',
      options: [],
      order: 0,
    });
    setEditingFieldIndex(null);
  };

  const handleAddOption = () => {
    const newOptions = [...(currentField.options || []), { label: '', value: '' }];
    setCurrentField({ ...currentField, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = currentField.options?.filter((_, i) => i !== index) || [];
    setCurrentField({ ...currentField, options: newOptions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a form title');
      return;
    }

    if (formData.fields.length === 0) {
      toast.error('Please add at least one field to the form');
      return;
    }

    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoadingForm) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const needsOptions = ['select', 'radio', 'checkbox'].includes(currentField.type || '');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/forms')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEdit ? 'Edit Form' : 'Create New Form'}
          </h1>
          <p className="text-muted-foreground">
            {isEdit ? 'Update form details and fields' : 'Create a dynamic form for events and registrations'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter form title and description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Form Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Event Registration Form"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the form"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="eventId">Link to Event (Optional)</Label>
                  <Select
                    value={formData.eventId || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, eventId: value === 'none' ? undefined : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No event</SelectItem>
                      {eventsData?.data?.map((event) => (
                        <SelectItem key={event._id} value={event._id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Form Fields */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Form Fields</CardTitle>
                    <CardDescription>Add fields to your form</CardDescription>
                  </div>
                  <Button type="button" onClick={handleAddField} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {formData.fields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No fields added yet</p>
                    <p className="text-sm">Click "Add Field" to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.fields.map((field, index) => (
                      <div
                        key={field.fieldId}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.label}</span>
                            <Badge variant="outline">{field.type}</Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">Required</Badge>
                            )}
                          </div>
                          {field.placeholder && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Placeholder: {field.placeholder}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditField(index)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Settings Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allowMultiple">Allow Multiple Submissions</Label>
                  <Switch
                    id="allowMultiple"
                    checked={formData.allowMultipleSubmissions}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, allowMultipleSubmissions: checked })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="maxSubmissions">Max Submissions (Optional)</Label>
                  <Input
                    id="maxSubmissions"
                    type="number"
                    value={formData.maxSubmissions || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxSubmissions: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    placeholder="Leave empty for unlimited"
                    min={1}
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date (Optional)</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="successMessage">Success Message</Label>
                  <Textarea
                    id="successMessage"
                    value={formData.successMessage}
                    onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="redirectUrl">Redirect URL (Optional)</Label>
                  <Input
                    id="redirectUrl"
                    type="url"
                    value={formData.redirectUrl || ''}
                    onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value || undefined })}
                    placeholder="https://example.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEdit ? 'Update Form' : 'Create Form'}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/forms')}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Field Dialog */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFieldIndex !== null ? 'Edit Field' : 'Add New Field'}
            </DialogTitle>
            <DialogDescription>
              Configure the form field properties
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fieldId">Field ID *</Label>
              <Input
                id="fieldId"
                value={currentField.fieldId}
                onChange={(e) => setCurrentField({ ...currentField, fieldId: e.target.value })}
                placeholder="e.g., name, email, phone"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Unique identifier (no spaces, use underscores)
              </p>
            </div>

            <div>
              <Label htmlFor="fieldLabel">Label *</Label>
              <Input
                id="fieldLabel"
                value={currentField.label}
                onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
                placeholder="e.g., Full Name"
                required
              />
            </div>

            <div>
              <Label htmlFor="fieldType">Field Type *</Label>
              <Select
                value={currentField.type}
                onValueChange={(value) => setCurrentField({ ...currentField, type: value as any, options: value === 'select' || value === 'radio' || value === 'checkbox' ? currentField.options : [] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fieldPlaceholder">Placeholder</Label>
              <Input
                id="fieldPlaceholder"
                value={currentField.placeholder || ''}
                onChange={(e) => setCurrentField({ ...currentField, placeholder: e.target.value })}
                placeholder="e.g., Enter your name"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="fieldRequired">Required Field</Label>
              <Switch
                id="fieldRequired"
                checked={currentField.required || false}
                onCheckedChange={(checked) => setCurrentField({ ...currentField, required: checked })}
              />
            </div>

            {needsOptions && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Options</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentField.options?.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Label"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...(currentField.options || [])];
                          newOptions[index].label = e.target.value;
                          setCurrentField({ ...currentField, options: newOptions });
                        }}
                      />
                      <Input
                        placeholder="Value"
                        value={option.value}
                        onChange={(e) => {
                          const newOptions = [...(currentField.options || [])];
                          newOptions[index].value = e.target.value;
                          setCurrentField({ ...currentField, options: newOptions });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsFieldDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveField}>
              {editingFieldIndex !== null ? 'Update Field' : 'Add Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
