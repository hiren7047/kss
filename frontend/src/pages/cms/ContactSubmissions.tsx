import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Search,
  Eye,
  Reply,
  Trash2,
  CheckCircle2,
  Clock,
  Archive,
  Loader2,
} from "lucide-react";
import { contactSubmissionApi, ContactSubmission } from "@/lib/api/cms";
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

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  read: "bg-gray-100 text-gray-800",
  replied: "bg-green-100 text-green-800",
  archived: "bg-yellow-100 text-yellow-800",
};

export default function ContactSubmissionsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['contactSubmissions', page, statusFilter],
    queryFn: () => contactSubmissionApi.getAll({
      page,
      limit: 10,
      ...(statusFilter !== 'all' && { status: statusFilter }),
    }),
    retry: 1,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      contactSubmissionApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactSubmissions'] });
      toast.success('Status updated successfully');
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, replyMessage }: { id: string; replyMessage: string }) =>
      contactSubmissionApi.reply(id, replyMessage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactSubmissions'] });
      toast.success('Reply sent successfully');
      setIsReplyDialogOpen(false);
      setReplyMessage("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactSubmissionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactSubmissions'] });
      toast.success('Submission deleted successfully');
    },
  });

  const openViewDialog = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  const openReplyDialog = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsReplyDialogOpen(true);
  };

  const handleReply = () => {
    if (!selectedSubmission?._id) return;
    replyMutation.mutate({ id: selectedSubmission._id, replyMessage });
  };

  const filteredSubmissions = data?.data?.filter((submission: ContactSubmission) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        submission.name.toLowerCase().includes(query) ||
        submission.email.toLowerCase().includes(query) ||
        submission.message.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Contact Submissions</h1>
        <p className="page-description">
          Manage contact form submissions from the website
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>
            {data?.pagination?.totalItems || 0} total submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">Failed to load contact submissions</p>
              <p className="text-sm text-muted-foreground">
                {(error as any)?.response?.data?.message || 'Please try again later'}
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No submissions found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission: ContactSubmission) => (
                  <TableRow key={submission._id}>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.subject || '-'}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[submission.status]}>
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.createdAt ? new Date(submission.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(submission)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {submission.status !== 'replied' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openReplyDialog(submission)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Delete this submission?')) {
                              deleteMutation.mutate(submission._id!);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Submission</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedSubmission.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedSubmission.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedSubmission.phone || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={statusColors[selectedSubmission.status]}>
                    {selectedSubmission.status}
                  </Badge>
                </div>
                {selectedSubmission.subject && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Subject</Label>
                    <p className="font-medium">{selectedSubmission.subject}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="text-sm text-muted-foreground">Message</Label>
                  <p className="text-sm whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
                {selectedSubmission.replyMessage && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Reply</Label>
                    <div className="bg-muted p-3 rounded">
                      <p className="text-sm whitespace-pre-wrap">{selectedSubmission.replyMessage}</p>
                      {selectedSubmission.repliedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Replied on {new Date(selectedSubmission.repliedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedSubmission && selectedSubmission.status !== 'replied' && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                openReplyDialog(selectedSubmission);
              }}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Submission</DialogTitle>
            <DialogDescription>
              Reply to {selectedSubmission?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Reply Message</Label>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={6}
                placeholder="Type your reply..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsReplyDialogOpen(false);
              setReplyMessage("");
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={!replyMessage || replyMutation.isPending}
            >
              {replyMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Reply className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
