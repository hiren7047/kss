import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Upload,
  X,
  File,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { documentsApi, Document } from "@/lib/api/documents";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const categoryColors: Record<string, string> = {
  audit: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  utilization: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  event: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  legal: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

const categoryLabels: Record<string, string> = {
  audit: "Audit Report",
  utilization: "Utilization Certificate",
  event: "Event Document",
  legal: "Legal Document",
  other: "Other",
};

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "other" as Document["category"],
    visibility: "private" as "public" | "private",
    description: "",
  });

  const queryClient = useQueryClient();

  // Fetch documents
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["documents", page, categoryFilter, visibilityFilter, searchQuery],
    queryFn: () =>
      documentsApi.getDocuments({
        page,
        limit: 10,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        visibility: visibilityFilter !== "all" ? visibilityFilter : undefined,
        search: searchQuery || undefined,
      }),
  });

  const filteredDocuments = data?.data || [];

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (formDataToSend: FormData) => {
      return documentsApi.uploadDocument(formDataToSend);
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setIsUploadDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to upload document");
    },
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("title", data.title);
        formData.append("category", data.category);
        formData.append("visibility", data.visibility);
        return documentsApi.updateDocument(id, formData);
      } else {
        return documentsApi.updateDocument(id, data);
      }
    },
    onSuccess: () => {
      toast.success("Document updated successfully");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update document");
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return documentsApi.deleteDocument(id);
    },
    onSuccess: () => {
      toast.success("Document deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setIsDeleteDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete document");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      category: "other",
      visibility: "private",
      description: "",
    });
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    if (!selectedFile && !selectedDocument) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      if (selectedFile) {
        formDataToSend.append("file", selectedFile);
      }
      formDataToSend.append("title", formData.title);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("visibility", formData.visibility);

      await uploadMutation.mutateAsync(formDataToSend);
    } catch (error) {
      // Error handled by mutation
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    if (!selectedDocument) return;

    setUploading(true);
    try {
      await updateMutation.mutateAsync({
        id: selectedDocument._id,
        data: formData,
      });
    } catch (error) {
      // Error handled by mutation
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    if (selectedDocument) {
      deleteMutation.mutate(selectedDocument._id);
    }
  };

  const handleEdit = (document: Document) => {
    setSelectedDocument(document);
    setFormData({
      title: document.title,
      category: document.category,
      visibility: document.visibility,
      description: "",
    });
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (document: Document) => {
    setSelectedDocument(document);
    setIsDeleteDialogOpen(true);
  };

  const handleDownload = (document: Document) => {
    const fileUrl = document.fileUrl.startsWith("/uploads")
      ? `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000"}${document.fileUrl}`
      : document.fileUrl;
    
    window.open(fileUrl, "_blank");
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/") || file.type === "application/pdf" || file.type.includes("document")) {
        setSelectedFile(file);
      } else {
        toast.error("Please upload a valid file (PDF, image, or document)");
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const getFileIcon = (fileUrl: string) => {
    const ext = fileUrl.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "📄";
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) return "🖼️";
    if (["doc", "docx"].includes(ext || "")) return "📝";
    return "📎";
  };

  const getFileUrl = (fileUrl: string) => {
    if (fileUrl.startsWith("http")) return fileUrl;
    return `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:3000"}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <FileText className="h-7 w-7 text-primary" />
              Documents
            </h1>
            <p className="page-description">
              Manage audit reports, certificates, and legal documents.
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setIsUploadDialogOpen(true);
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents by title..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={categoryFilter}
                onValueChange={(v) => {
                  setCategoryFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="audit">Audit Report</SelectItem>
                  <SelectItem value="utilization">Utilization</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={visibilityFilter}
                onValueChange={(v) => {
                  setVisibilityFilter(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] h-10">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="rounded-xl border bg-card p-12 text-center shadow-card">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-xl font-semibold">No Documents Found</h3>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                {searchQuery || categoryFilter !== "all" || visibilityFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : "Upload your first document to get started."}
              </p>
              {!searchQuery && categoryFilter === "all" && visibilityFilter === "all" && (
                <Button
                  onClick={() => {
                    resetForm();
                    setIsUploadDialogOpen(true);
                  }}
                  className="mt-4 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Document</TableHead>
                    <TableHead className="hidden md:table-cell">Category</TableHead>
                    <TableHead className="hidden lg:table-cell">Uploaded By</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => (
                    <TableRow key={document._id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{getFileIcon(document.fileUrl)}</div>
                          <div>
                            <p className="font-medium">{document.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {document.fileUrl.split("/").pop()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge
                          variant="outline"
                          className={cn("capitalize", categoryColors[document.category])}
                        >
                          {categoryLabels[document.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {document.uploadedBy?.name || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(document.uploadedAt || document.createdAt), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "gap-1",
                            document.visibility === "public"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400"
                          )}
                        >
                          {document.visibility === "public" ? (
                            <Eye className="h-3 w-3" />
                          ) : (
                            <EyeOff className="h-3 w-3" />
                          )}
                          <span className="capitalize">{document.visibility}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(document)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(getFileUrl(document.fileUrl), "_blank")}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(document)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(document)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((data.pagination.currentPage - 1) * data.pagination.itemsPerPage) + 1} to{" "}
            {Math.min(data.pagination.currentPage * data.pagination.itemsPerPage, data.pagination.totalItems)} of{" "}
            {data.pagination.totalItems} documents
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!data.pagination.hasPrevPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!data.pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document. Supported formats: PDF, Images, Word documents (Max 5MB)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Document Title *</Label>
              <Input
                id="title"
                placeholder="Enter document title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Document["category"]) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audit">Audit Report</SelectItem>
                  <SelectItem value="utilization">Utilization Certificate</SelectItem>
                  <SelectItem value="event">Event Document</SelectItem>
                  <SelectItem value="legal">Legal Document</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="visibility-switch" className="text-base">
                    Make document public
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Public documents are visible to everyone
                  </p>
                </div>
                <Switch
                  id="visibility-switch"
                  checked={formData.visibility === "public"}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, visibility: checked ? "public" : "private" })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>File *</Label>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50",
                  selectedFile && "border-primary bg-primary/5"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                  onChange={handleFileChange}
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    <File className="mx-auto h-10 w-10 text-primary" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="mt-2"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <div>
                      <Label
                        htmlFor="file-upload"
                        className="cursor-pointer text-primary hover:underline"
                      >
                        Click to upload
                      </Label>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PDF, Images, Word documents (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile || !formData.title}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
            <DialogDescription>
              Update document details. You can replace the file if needed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Document Title *</Label>
              <Input
                id="edit-title"
                placeholder="Enter document title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: Document["category"]) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="audit">Audit Report</SelectItem>
                  <SelectItem value="utilization">Utilization Certificate</SelectItem>
                  <SelectItem value="event">Event Document</SelectItem>
                  <SelectItem value="legal">Legal Document</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-visibility">Visibility</Label>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-visibility-switch" className="text-base">
                    Make document public
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Public documents are visible to everyone
                  </p>
                </div>
                <Switch
                  id="edit-visibility-switch"
                  checked={formData.visibility === "public"}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, visibility: checked ? "public" : "private" })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Replace File (Optional)</Label>
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-muted-foreground/50",
                  selectedFile && "border-primary bg-primary/5"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="edit-file-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                  onChange={handleFileChange}
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    <File className="mx-auto h-10 w-10 text-primary" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      className="mt-2"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ) : selectedDocument ? (
                  <div className="space-y-2">
                    <File className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">{selectedDocument.fileUrl.split("/").pop()}</p>
                    <Label
                      htmlFor="edit-file-upload"
                      className="cursor-pointer text-primary hover:underline text-sm"
                    >
                      Click to replace file
                    </Label>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                    <div>
                      <Label
                        htmlFor="edit-file-upload"
                        className="cursor-pointer text-primary hover:underline"
                      >
                        Click to upload
                      </Label>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PDF, Images, Word documents (Max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={uploading || !formData.title}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Update
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document{" "}
              <strong>{selectedDocument?.title}</strong> and remove it from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
