import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Eye,
  Edit,
  Trash2,
  Loader2,
  FileText,
  CheckCircle2,
  Clock,
  Archive,
  Search,
  Download,
} from "lucide-react";
import { formsApi, FormSubmission } from "@/lib/api/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
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

const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
  submitted: { label: "Submitted", class: "bg-blue-100 text-blue-800", icon: Clock },
  reviewed: { label: "Reviewed", class: "bg-green-100 text-green-800", icon: CheckCircle2 },
  archived: { label: "Archived", class: "bg-gray-100 text-gray-800", icon: Archive },
};

export default function FormSubmissions() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState<string>("submitted");

  // Fetch form details
  const { data: formData } = useQuery({
    queryKey: ['form', id],
    queryFn: () => formsApi.getFormById(id!),
    enabled: !!id,
  });

  // Fetch submissions
  const { data, isLoading, isError } = useQuery({
    queryKey: ['formSubmissions', id, page, statusFilter],
    queryFn: () => formsApi.getFormSubmissions(id!, {
      page,
      limit: 10,
      ...(statusFilter !== 'all' && { status: statusFilter }),
    }),
    enabled: !!id,
    retry: 1,
  });

  // Update submission mutation
  const updateMutation = useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: any }) =>
      formsApi.updateSubmission(id!, submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSubmissions'] });
      toast.success('Submission updated successfully');
      setEditDialogOpen(false);
      setSelectedSubmission(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update submission');
    },
  });

  // Delete submission mutation
  const deleteMutation = useMutation({
    mutationFn: (submissionId: string) => formsApi.deleteSubmission(id!, submissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formSubmissions'] });
      toast.success('Submission deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedSubmission(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete submission');
    },
  });

  const handleView = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setViewDialogOpen(true);
  };

  const handleEdit = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.adminNotes || '');
    setSubmissionStatus(submission.status);
    setEditDialogOpen(true);
  };

  const handleDelete = (submission: FormSubmission) => {
    setSelectedSubmission(submission);
    setDeleteDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedSubmission) return;
    updateMutation.mutate({
      submissionId: selectedSubmission._id,
      data: {
        status: submissionStatus,
        adminNotes: adminNotes,
      },
    });
  };

  const handleConfirmDelete = () => {
    if (!selectedSubmission) return;
    deleteMutation.mutate(selectedSubmission._id);
  };

  const getFieldValue = (submission: FormSubmission, fieldId: string) => {
    // Handle both Map and object responses
    let value;
    if (submission.responses instanceof Map) {
      value = submission.responses.get(fieldId);
    } else {
      value = submission.responses[fieldId];
    }
    if (value === null || value === undefined || value === '') return 'N/A';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  const getFieldLabel = (fieldId: string) => {
    if (!formData?.data) return fieldId;
    const field = formData.data.fields.find(f => f.fieldId === fieldId);
    return field ? field.label : fieldId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !formData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load submissions. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const form = formData.data;

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
          Back to Forms
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Form Submissions</h1>
          <p className="text-muted-foreground">{form.title}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{data?.pagination.totalItems || 0}</div>
            <p className="text-xs text-muted-foreground">Total Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {data?.data.filter(s => s.status === 'submitted').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">New</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {data?.data.filter(s => s.status === 'reviewed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Reviewed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-600">
              {data?.data.filter(s => s.status === 'archived').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Archived</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>
            {data?.pagination.totalItems || 0} submission(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data || data.data.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No submissions found</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Responses</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((submission) => {
                      const StatusIcon = statusConfig[submission.status]?.icon || Clock;
                      // Get first few field values for preview (skip empty ones)
                      const previewFields = form.fields
                        .filter(field => {
                          const value = getFieldValue(submission, field.fieldId);
                          return value !== 'N/A' && value !== '';
                        })
                        .slice(0, 3);
                      const previewText = previewFields.length > 0
                        ? previewFields
                            .map(field => {
                              const value = getFieldValue(submission, field.fieldId);
                              return `${field.label}: ${value}`;
                            })
                            .join(' | ')
                        : 'No responses';

                      return (
                        <TableRow key={submission._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {new Date(submission.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(submission.createdAt).toLocaleTimeString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <p className="text-sm truncate">{previewText}</p>
                              {form.fields.length > 3 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  +{form.fields.length - 3} more fields
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig[submission.status]?.class || ''}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[submission.status]?.label || submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(submission)}
                                title="View submission"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(submission)}
                                title="Edit submission"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(submission)}
                                title="Delete submission"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {data.pagination.currentPage} of {data.pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!data.pagination.hasPrevPage}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={!data.pagination.hasNextPage}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Submission Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedSubmission && new Date(selectedSubmission.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              {/* Status */}
              <div>
                <Label>Status</Label>
                <div className="mt-2">
                  <Badge className={statusConfig[selectedSubmission.status]?.class || ''}>
                    {statusConfig[selectedSubmission.status]?.label || selectedSubmission.status}
                  </Badge>
                </div>
              </div>

              {/* Responses */}
              <div>
                <Label>Form Responses</Label>
                <div className="mt-2 space-y-3">
                  {form.fields
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((field) => {
                      const value = getFieldValue(selectedSubmission, field.fieldId);
                      return (
                        <div key={field.fieldId} className="border rounded-lg p-3">
                          <div className="font-medium text-sm mb-1">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {value}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* File Uploads */}
              {selectedSubmission.fileUploads && selectedSubmission.fileUploads.length > 0 && (
                <div>
                  <Label>File Uploads</Label>
                  <div className="mt-2 space-y-2">
                    {selectedSubmission.fileUploads.map((file, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{file.fileName}</div>
                            <div className="text-sm text-muted-foreground">
                              {(file.fileSize / 1024).toFixed(2)} KB
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Construct file URL - backend serves uploads at /uploads
                              const baseUrl = window.location.origin;
                              // Extract relative path from filePath (e.g., backend/uploads/forms/file.pdf -> /uploads/forms/file.pdf)
                              const relativePath = file.filePath 
                                ? file.filePath.replace(/^.*\/uploads/, '/uploads')
                                : `/uploads/forms/${file.fileName}`;
                              window.open(`${baseUrl}${relativePath}`, '_blank');
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedSubmission.adminNotes && (
                <div>
                  <Label>Admin Notes</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedSubmission.adminNotes}</p>
                  </div>
                </div>
              )}

              {/* Submitter Info */}
              {selectedSubmission.submitterInfo && (
                <div>
                  <Label>Submission Info</Label>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {selectedSubmission.submitterInfo.ipAddress && (
                      <div>IP: {selectedSubmission.submitterInfo.ipAddress}</div>
                    )}
                    {selectedSubmission.submitterInfo.userAgent && (
                      <div>Device: {selectedSubmission.submitterInfo.userAgent}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              if (selectedSubmission) {
                handleEdit(selectedSubmission);
              }
            }}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Submission Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Submission</DialogTitle>
            <DialogDescription>
              Update submission status and add admin notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={submissionStatus}
                onValueChange={setSubmissionStatus}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes about this submission..."
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
