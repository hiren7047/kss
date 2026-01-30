import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { whatsAppApi, WhatsAppTemplate } from "@/lib/api/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WhatsAppTemplates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    message: "",
    description: "",
    pdf: "",
    img1: "",
    img2: "",
    status: "active" as "active" | "inactive",
  });

  const queryClient = useQueryClient();

  // Fetch templates
  const { data, isLoading } = useQuery({
    queryKey: ["whatsapp-templates", page, searchQuery, statusFilter],
    queryFn: () =>
      whatsAppApi.getTemplates({
        page,
        limit: 10,
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: whatsAppApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success("Template created successfully");
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create template");
    },
  });

  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      whatsAppApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success("Template updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update template");
    },
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: whatsAppApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete template");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      message: "",
      description: "",
      pdf: "",
      img1: "",
      img2: "",
      status: "active",
    });
    setSelectedTemplate(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      message: template.message,
      description: template.description || "",
      pdf: template.pdf || "",
      img1: template.img1 || "",
      img2: template.img2 || "",
      status: template.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleView = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setIsViewDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate) {
      updateMutation.mutate({ id: selectedTemplate._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const templates = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-primary" />
              WhatsApp Message Templates
            </h1>
            <p className="page-description">
              Create and manage WhatsApp message templates for notifications
            </p>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Table */}
      <div className="bg-card rounded-lg border shadow-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm">Create your first template to get started</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Message Preview</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template._id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {template.message.substring(0, 50)}...
                    </TableCell>
                    <TableCell>
                      {template.variables.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {template.variables.map((v) => (
                            <Badge key={v} variant="outline" className="text-xs">
                              {`{{${v}}}`}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {template.pdf && <FileText className="h-4 w-4 text-primary" />}
                        {template.img1 && <ImageIcon className="h-4 w-4 text-primary" />}
                        {template.img2 && <ImageIcon className="h-4 w-4 text-primary" />}
                        {!template.pdf && !template.img1 && !template.img2 && (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={template.status === "active" ? "default" : "secondary"}
                      >
                        {template.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{template.usageCount} times</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(template)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(template._id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="p-4 flex items-center justify-between border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}{" "}
                  of {pagination.totalItems} templates
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPrevPage || isLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage || isLoading}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate
                ? "Update the WhatsApp message template"
                : "Create a new WhatsApp message template. Use {{variableName}} for dynamic content."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., Donation Thank You"
                />
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Thank You for Your Donation"
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  placeholder="Enter your message. Use {{name}}, {{amount}}, etc. for variables."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use {"{{variableName}}"} for dynamic content (e.g., {"{{name}}"}, {"{{amount}}"})
                </p>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Optional description for this template"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pdf">PDF URL</Label>
                  <Input
                    id="pdf"
                    value={formData.pdf}
                    onChange={(e) => setFormData({ ...formData, pdf: e.target.value })}
                    placeholder="http://..."
                  />
                </div>
                <div>
                  <Label htmlFor="img1">Image 1 URL</Label>
                  <Input
                    id="img1"
                    value={formData.img1}
                    onChange={(e) => setFormData({ ...formData, img1: e.target.value })}
                    placeholder="http://..."
                  />
                </div>
                <div>
                  <Label htmlFor="img2">Image 2 URL</Label>
                  <Input
                    id="img2"
                    value={formData.img2}
                    onChange={(e) => setFormData({ ...formData, img2: e.target.value })}
                    placeholder="http://..."
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
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
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {selectedTemplate ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>{selectedTemplate?.name}</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Message</Label>
                <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
                  {selectedTemplate.message}
                </div>
              </div>
              {selectedTemplate.description && (
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              )}
              {selectedTemplate.variables.length > 0 && (
                <div>
                  <Label>Variables</Label>
                  <div className="flex gap-2 flex-wrap mt-2">
                    {selectedTemplate.variables.map((v) => (
                      <Badge key={v} variant="outline">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label>Status</Label>
                  <Badge variant={selectedTemplate.status === "active" ? "default" : "secondary"}>
                    {selectedTemplate.status}
                  </Badge>
                </div>
                <div>
                  <Label>Usage Count</Label>
                  <p>{selectedTemplate.usageCount} times</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
