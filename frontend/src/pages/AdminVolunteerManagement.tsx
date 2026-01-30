import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Award,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Calendar,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { adminVolunteersApi } from "@/lib/api/adminVolunteers";
import { volunteersApi } from "@/lib/api/volunteers";
import { expensesApi } from "@/lib/api/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminVolunteerManagement() {
  const [activeTab, setActiveTab] = useState<"work" | "points" | "expenses">("work");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<any>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [reviewData, setReviewData] = useState({
    status: "approved" as "approved" | "rejected",
    pointsAwarded: 0,
    reviewNotes: "",
    rejectionReason: "",
  });
  const [verifyData, setVerifyData] = useState({
    pointsToVerify: 0,
  });
  const [expenseApprovalData, setExpenseApprovalData] = useState({
    approvalStatus: "approved" as "approved" | "rejected",
    rejectionReason: "",
  });

  const queryClient = useQueryClient();

  // Fetch work submissions
  const { data: workData, isLoading: workLoading } = useQuery({
    queryKey: ["admin-work-submissions", page, statusFilter, searchQuery],
    queryFn: () =>
      adminVolunteersApi.getAllWorkSubmissions({
        page,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Fetch volunteer expenses
  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["admin-volunteer-expenses", page, statusFilter],
    queryFn: () =>
      adminVolunteersApi.getVolunteerExpenses({
        page,
        limit: 10,
        approvalStatus: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Review work submission mutation
  const reviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/volunteers/work-submissions/${id}/review`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-work-submissions"] });
      toast.success("Work submission reviewed successfully");
      setIsReviewDialogOpen(false);
      setSelectedWork(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to review work submission");
    },
  });

  // Approve expense mutation
  const approveExpenseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return expensesApi.approveExpense(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-volunteer-expenses"] });
      toast.success("Expense processed successfully");
      setIsExpenseDialogOpen(false);
      setSelectedExpense(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to process expense");
    },
  });

  // Verify points mutation
  const verifyPointsMutation = useMutation({
    mutationFn: async ({ volunteerId, pointsToVerify }: { volunteerId: string; pointsToVerify: number }) => {
      const response = await api.put("/volunteers/verify-points", {
        volunteerId,
        pointsToVerify,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers"] });
      toast.success("Points verified successfully");
      setIsVerifyDialogOpen(false);
      setSelectedVolunteer(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to verify points");
    },
  });

  const handleReview = () => {
    if (!selectedWork) return;
    if (reviewData.status === "approved" && reviewData.pointsAwarded <= 0) {
      toast.error("Please enter points to award");
      return;
    }
    reviewMutation.mutate({
      id: selectedWork._id,
      data: reviewData,
    });
  };

  const handleApproveExpense = () => {
    if (!selectedExpense) return;
    if (expenseApprovalData.approvalStatus === "rejected" && !expenseApprovalData.rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    approveExpenseMutation.mutate({
      id: selectedExpense._id,
      data: expenseApprovalData,
    });
  };

  const handleVerifyPoints = () => {
    if (!selectedVolunteer || verifyData.pointsToVerify <= 0) {
      toast.error("Please enter valid points to verify");
      return;
    }
    verifyPointsMutation.mutate({
      volunteerId: selectedVolunteer._id,
      pointsToVerify: verifyData.pointsToVerify,
    });
  };

  const workSubmissions = workData?.data?.data || [];
  const workPagination = workData?.data?.pagination;
  const expenses = expensesData?.data?.data || [];
  const expensesPagination = expensesData?.data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <UserCheck className="h-7 w-7 text-primary" />
          Volunteer Management
        </h1>
        <p className="page-description">
          Review work submissions, verify points, and manage volunteer activities.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="work">Work Submissions</TabsTrigger>
          <TabsTrigger value="points">Points Verification</TabsTrigger>
          <TabsTrigger value="expenses">Volunteer Expenses</TabsTrigger>
        </TabsList>

        {/* Work Submissions Tab */}
        <TabsContent value="work" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search work submissions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Work Submissions Table */}
          <div className="data-table">
            {workLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Work Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workSubmissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No work submissions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    workSubmissions.map((work: any) => (
                      <TableRow key={work._id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-info/10 text-info text-sm">
                                {work.volunteerId?.name
                                  ?.split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2) || "V"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{work.volunteerId?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">
                                {work.volunteerId?.registrationId || work.volunteerId?.memberId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{work.eventId?.name || "Unknown Event"}</p>
                          {work.eventId?.startDate && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(work.eventId.startDate).toLocaleDateString()}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{work.workTitle}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {work.workDescription}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              work.status === "approved"
                                ? "default"
                                : work.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {work.status === "submitted" && <Clock className="h-3 w-3 mr-1" />}
                            {work.status === "approved" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {work.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                            {work.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {work.pointsAwarded > 0 ? (
                            <span className="font-bold text-primary">{work.pointsAwarded}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedWork(work);
                              setReviewData({
                                status: work.status === "rejected" ? "rejected" : "approved",
                                pointsAwarded: work.pointsAwarded || 0,
                                reviewNotes: work.reviewNotes || "",
                                rejectionReason: work.rejectionReason || "",
                              });
                              setIsReviewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {workPagination && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(workPagination.currentPage - 1) * workPagination.itemsPerPage + 1}-
                {Math.min(
                  workPagination.currentPage * workPagination.itemsPerPage,
                  workPagination.totalItems
                )}{" "}
                of {workPagination.totalItems} submissions
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!workPagination.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!workPagination.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Points Verification Tab */}
        <TabsContent value="points" className="space-y-6">
          <div className="p-6 border rounded-lg bg-muted/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5" />
              Points Verification
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Verify pending points for volunteers. This moves points from pending to verified status.
              Go to Volunteers page to select a volunteer and verify their points.
            </p>
            <Button
              onClick={() => {
                window.location.href = "/volunteers";
              }}
            >
              Go to Volunteers Page
            </Button>
          </div>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expenses Table */}
          <div className="data-table">
            {expensesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  ) : (
                    expenses.map((expense: any) => (
                      <TableRow key={expense._id}>
                        <TableCell>
                          <p className="font-medium">
                            {expense.submittedBy?.name || "Unknown Volunteer"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {expense.submittedBy?.registrationId || expense.submittedBy?.memberId}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{expense.title}</p>
                          <p className="text-xs text-muted-foreground">{expense.category}</p>
                        </TableCell>
                        <TableCell className="font-medium">
                          ₹{expense.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              expense.approvalStatus === "approved"
                                ? "default"
                                : expense.approvalStatus === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {expense.approvalStatus.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {expense.approvalStatus === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedExpense(expense);
                                setExpenseApprovalData({
                                  approvalStatus: "approved",
                                  rejectionReason: "",
                                });
                                setIsExpenseDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Review Work Submission Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Work Submission</DialogTitle>
            <DialogDescription>
              Review and approve or reject volunteer work submission
            </DialogDescription>
          </DialogHeader>
          {selectedWork && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Volunteer</Label>
                  <p className="font-medium">{selectedWork.volunteerId?.name || "Unknown"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Event</Label>
                  <p className="font-medium">{selectedWork.eventId?.name || "Unknown Event"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Work Title</Label>
                  <p className="font-medium">{selectedWork.workTitle}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedWork.workDescription}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={reviewData.status}
                  onValueChange={(value: any) =>
                    setReviewData({ ...reviewData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reviewData.status === "approved" && (
                <div>
                  <Label htmlFor="points">Points to Award *</Label>
                  <Input
                    id="points"
                    type="number"
                    min="0"
                    value={reviewData.pointsAwarded}
                    onChange={(e) =>
                      setReviewData({
                        ...reviewData,
                        pointsAwarded: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter points (e.g., 10, 20, 50)"
                  />
                </div>
              )}

              {reviewData.status === "rejected" && (
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason</Label>
                  <Textarea
                    id="rejectionReason"
                    value={reviewData.rejectionReason}
                    onChange={(e) =>
                      setReviewData({ ...reviewData, rejectionReason: e.target.value })
                    }
                    placeholder="Explain why this work submission is rejected..."
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="reviewNotes">Review Notes (Optional)</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewData.reviewNotes}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, reviewNotes: e.target.value })
                  }
                  placeholder="Add any additional notes about this review..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReview} disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Points Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Volunteer Points</DialogTitle>
            <DialogDescription>
              Move pending points to verified status for this volunteer
            </DialogDescription>
          </DialogHeader>
          {selectedVolunteer && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <Label className="text-xs text-muted-foreground">Volunteer</Label>
                <p className="font-medium">{selectedVolunteer.name}</p>
                <p className="text-sm text-muted-foreground">
                  Pending Points: {selectedVolunteer.pendingPoints || 0}
                </p>
              </div>
              <div>
                <Label htmlFor="pointsToVerify">Points to Verify *</Label>
                <Input
                  id="pointsToVerify"
                  type="number"
                  min="1"
                  max={selectedVolunteer.pendingPoints || 0}
                  value={verifyData.pointsToVerify}
                  onChange={(e) =>
                    setVerifyData({
                      pointsToVerify: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder={`Max: ${selectedVolunteer.pendingPoints || 0}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can verify up to {selectedVolunteer.pendingPoints || 0} pending points
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVerifyPoints}
              disabled={verifyPointsMutation.isPending}
            >
              {verifyPointsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Points"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Volunteer Expense</DialogTitle>
            <DialogDescription>
              Approve or reject volunteer expense submission
            </DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Volunteer</Label>
                  <p className="font-medium">
                    {selectedExpense.submittedBy?.name || "Unknown Volunteer"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedExpense.submittedBy?.registrationId || selectedExpense.submittedBy?.memberId}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Title</Label>
                  <p className="font-medium">{selectedExpense.title}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <p className="text-sm">{selectedExpense.category}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Amount</Label>
                  <p className="font-bold text-lg text-primary">
                    ₹{selectedExpense.amount.toLocaleString()}
                  </p>
                </div>
                {selectedExpense.eventId && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Event</Label>
                    <p className="text-sm">{selectedExpense.eventId.name}</p>
                  </div>
                )}
                {selectedExpense.billUrl && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Bill</Label>
                    <a
                      href={selectedExpense.billUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View Bill
                    </a>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="approvalStatus">Decision *</Label>
                <Select
                  value={expenseApprovalData.approvalStatus}
                  onValueChange={(value: any) =>
                    setExpenseApprovalData({
                      ...expenseApprovalData,
                      approvalStatus: value,
                      rejectionReason: "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {expenseApprovalData.approvalStatus === "rejected" && (
                <div>
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    value={expenseApprovalData.rejectionReason}
                    onChange={(e) =>
                      setExpenseApprovalData({
                        ...expenseApprovalData,
                        rejectionReason: e.target.value,
                      })
                    }
                    placeholder="Please provide a reason for rejection..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleApproveExpense}
              disabled={approveExpenseMutation.isPending}
              variant={expenseApprovalData.approvalStatus === "rejected" ? "destructive" : "default"}
            >
              {approveExpenseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : expenseApprovalData.approvalStatus === "approved" ? (
                "Approve Expense"
              ) : (
                "Reject Expense"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
