import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  Link as LinkIcon,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Calendar,
  Users,
} from "lucide-react";
import { formsApi, Form } from "@/lib/api/forms";
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
  draft: { label: "Draft", class: "bg-gray-100 text-gray-800", icon: Clock },
  active: { label: "Active", class: "bg-green-100 text-green-800", icon: CheckCircle2 },
  inactive: { label: "Inactive", class: "bg-yellow-100 text-yellow-800", icon: XCircle },
  closed: { label: "Closed", class: "bg-red-100 text-red-800", icon: XCircle },
};

export default function Forms() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['forms', page, statusFilter, searchQuery],
    queryFn: () => formsApi.getForms({
      page,
      limit: 10,
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(searchQuery && { search: searchQuery }),
    }),
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => formsApi.deleteForm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast.success('Form deleted successfully');
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete form');
    },
  });

  const handleDelete = (form: Form) => {
    setSelectedForm(form);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedForm) {
      deleteMutation.mutate(selectedForm._id);
    }
  };

  const handleCopyLink = (form: Form) => {
    const baseUrl = window.location.origin;
    const publicUrl = `${baseUrl}/forms/public/${form.shareableToken}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success('Link copied to clipboard!');
  };

  const getPublicUrl = (form: Form) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/forms/public/${form.shareableToken}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load forms. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-2">
            <FileText className="h-7 w-7 text-info" />
            Dynamic Forms
          </h1>
          <p className="page-description">
            Create and manage dynamic forms for events and registrations
          </p>
        </div>
        <Button
          onClick={() => navigate('/forms/create')}
          className="shad-button-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search forms..."
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
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Forms Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Forms</CardTitle>
          <CardDescription>
            {data?.pagination.totalItems || 0} form(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data || data.data.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No forms found</p>
              <Button onClick={() => navigate('/forms/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Form
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submissions</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data.map((form) => {
                      const StatusIcon = statusConfig[form.status]?.icon || Clock;
                      return (
                        <TableRow key={form._id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-semibold">{form.title}</div>
                              {form.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {form.description.substring(0, 60)}
                                  {form.description.length > 60 && '...'}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {form.eventId ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{form.eventId.name}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No event</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusConfig[form.status]?.class || ''}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[form.status]?.label || form.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{form.submissionCount}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(form.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyLink(form)}
                                title="Copy link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedForm(form);
                                  setLinkDialogOpen(true);
                                }}
                                title="View link"
                              >
                                <LinkIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/forms/${form._id}/submissions`)}
                                title="View submissions"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/forms/${form._id}/edit`)}
                                title="Edit form"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(form)}
                                title="Delete form"
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedForm?.title}"? This action cannot be undone.
              All submissions for this form will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Shareable Link</DialogTitle>
            <DialogDescription>
              Share this link with users to allow them to fill out the form.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Public URL</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={selectedForm ? getPublicUrl(selectedForm) : ''}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedForm) {
                      handleCopyLink(selectedForm);
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Shareable Token</Label>
              <Input
                value={selectedForm?.shareableToken || ''}
                readOnly
                className="font-mono text-sm mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              if (selectedForm) {
                window.open(getPublicUrl(selectedForm), '_blank');
              }
            }}>
              Open in New Tab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
