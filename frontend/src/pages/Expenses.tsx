import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Wallet,
  Plus,
  Search,
  MoreVertical,
  Eye,
  TrendingDown,
  Calendar,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
  Trash2,
  Download,
} from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  expensesApi,
  type Expense,
  type CreateExpenseRequest,
  type ApproveExpenseRequest,
} from "@/lib/api/expenses";
import { eventsApi } from "@/lib/api/events";
import { toast } from "sonner";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  approved: "bg-success/10 text-success",
  rejected: "bg-destructive/10 text-destructive",
};

const CATEGORY_OPTIONS = [
  "Food & Supplies",
  "Event Management",
  "Transportation",
  "Medical Aid",
  "Education Materials",
  "Infrastructure",
  "Administrative",
  "Marketing",
  "Utilities",
  "Other",
];

export default function Expenses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [approvalStatus, setApprovalStatus] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approvingExpense, setApprovingExpense] = useState<Expense | null>(null);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");

  const limit = 10;

  const { data: expensesData, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses", page, limit, search, approvalStatus, category],
    queryFn: () =>
      expensesApi.getExpenses({
        page,
        limit,
        search: search || undefined,
        approvalStatus: approvalStatus === "all" ? undefined : approvalStatus,
        category: category === "all" ? undefined : category,
      }),
  });

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["expenses-report"],
    queryFn: () => expensesApi.getExpenseReport({}),
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events-list"],
    queryFn: () => eventsApi.getEvents({ limit: 100 }),
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: CreateExpenseRequest) => expensesApi.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-report"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      setAddOpen(false);
      toast.success("Expense created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create expense");
    },
  });

  const approveExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveExpenseRequest }) =>
      expensesApi.approveExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-report"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      setApproveOpen(false);
      setApprovingExpense(null);
      setRejectionReason("");
      toast.success(`Expense ${approvalAction === "approve" ? "approved" : "rejected"} successfully`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || `Failed to ${approvalAction} expense`);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => expensesApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expenses-report"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      toast.success("Expense deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete expense");
    },
  });

  const handleApprove = (expense: Expense) => {
    setApprovingExpense(expense);
    setApprovalAction("approve");
    setRejectionReason("");
    setApproveOpen(true);
  };

  const handleReject = (expense: Expense) => {
    setApprovingExpense(expense);
    setApprovalAction("reject");
    setRejectionReason("");
    setApproveOpen(true);
  };

  const handleApproveSubmit = () => {
    if (!approvingExpense) return;
    
    if (approvalAction === "reject" && !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    approveExpenseMutation.mutate({
      id: approvingExpense._id,
      data: {
        approvalStatus: approvalAction === "approve" ? "approved" : "rejected",
        rejectionReason: approvalAction === "reject" ? rejectionReason : undefined,
      },
    });
  };

  const handleDelete = (expense: Expense) => {
    if (confirm(`Are you sure you want to delete "${expense.title}"?`)) {
      deleteExpenseMutation.mutate(expense._id);
    }
  };

  const report = reportData?.data;
  const summary = report?.summary;
  const expenses = expensesData?.data ?? [];
  const pagination = expensesData?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-2">
            <Wallet className="h-7 w-7 text-warning" />
            Expenses
          </h1>
          <p className="page-description">
            Track and manage all NGO expenses with approval workflows.
          </p>
        </div>
        <Button
          className="gap-2 bg-warning hover:bg-warning/90"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Expenses"
          value={
            reportLoading
              ? "…"
              : `₹${(summary?.totalAmount ?? 0).toLocaleString("en-IN")}`
          }
          subtitle="All time"
          icon={TrendingDown}
          variant="warning"
        />
        <StatsCard
          title="Approved"
          value={
            reportLoading
              ? "…"
              : `₹${(summary?.approvedAmount ?? 0).toLocaleString("en-IN")}`
          }
          subtitle="Approved expenses"
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          title="Pending"
          value={
            reportLoading
              ? "…"
              : `₹${(summary?.pendingAmount ?? 0).toLocaleString("en-IN")}`
          }
          subtitle="Awaiting approval"
          icon={Clock}
          variant="info"
        />
        <StatsCard
          title="Total Count"
          value={String(summary?.totalCount ?? 0)}
          subtitle="All expenses"
          icon={FileText}
          variant="primary"
        />
      </div>

      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={approvalStatus}
                onValueChange={(v) => {
                  setApprovalStatus(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Expense Records</CardTitle>
          <CardDescription>
            Manage and track all expenses with approval workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="data-table">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">Event</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">Status</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No expenses found.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((e) => (
                    <TableRow key={e._id} className="group">
                      <TableCell>
                        <div>
                          <p className="font-medium">{e.title}</p>
                          {e.billUrl && (
                            <a
                              href={e.billUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              <FileText className="h-3 w-3" />
                              View Bill
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{e.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-warning">
                          ₹{e.amount.toLocaleString("en-IN")}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {e.eventId ? (
                          <Badge variant="outline">{e.eventId.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge className={STATUS_COLORS[e.approvalStatus]}>
                          {STATUS_LABELS[e.approvalStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {format(new Date(e.createdAt), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailExpense(e)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {e.approvalStatus === "pending" && (
                              <>
                                <DropdownMenuItem onClick={() => handleApprove(e)}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleReject(e)}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDelete(e)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}–
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} expenses
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(data) => createExpenseMutation.mutate(data)}
        loading={createExpenseMutation.isPending}
        events={eventsData?.data ?? []}
      />

      {/* Approve/Reject Dialog */}
      <ApproveExpenseDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        expense={approvingExpense}
        action={approvalAction}
        rejectionReason={rejectionReason}
        onRejectionReasonChange={setRejectionReason}
        onSubmit={handleApproveSubmit}
        loading={approveExpenseMutation.isPending}
      />

      {/* Expense Detail Sheet */}
      <ExpenseDetailSheet
        expense={detailExpense}
        onClose={() => setDetailExpense(null)}
      />
    </div>
  );
}

// Add Expense Dialog Component
function AddExpenseDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
  events,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateExpenseRequest) => void;
  loading: boolean;
  events: { _id: string; name: string }[];
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [eventId, setEventId] = useState("");
  const [billUrl, setBillUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSubmit({
      title,
      category,
      amount: Number(amount),
      eventId: eventId || undefined,
      billUrl: billUrl || undefined,
    });
    // Reset form
    setTitle("");
    setCategory("");
    setAmount("");
    setEventId("");
    setBillUrl("");
  };

  const handleClose = () => {
    setTitle("");
    setCategory("");
    setAmount("");
    setEventId("");
    setBillUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Create a new expense entry. It will be set to pending status and require approval.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                Expense Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Food Distribution - Annapurna Durga"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">
                Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            {events.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="event">Event (optional)</Label>
                <Select value={eventId || "none"} onValueChange={(v) => setEventId(v === "none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {events.map((e) => (
                      <SelectItem key={e._id} value={e._id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="billUrl">Bill URL (optional)</Label>
              <Input
                id="billUrl"
                type="url"
                value={billUrl}
                onChange={(e) => setBillUrl(e.target.value)}
                placeholder="https://example.com/bill.pdf"
              />
              <p className="text-xs text-muted-foreground">
                URL to the expense bill or receipt document
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Expense"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Approve/Reject Expense Dialog
function ApproveExpenseDialog({
  open,
  onOpenChange,
  expense,
  action,
  rejectionReason,
  onRejectionReasonChange,
  onSubmit,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  action: "approve" | "reject";
  rejectionReason: string;
  onRejectionReasonChange: (reason: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  if (!expense) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "approve" ? "Approve Expense" : "Reject Expense"}
          </DialogTitle>
          <DialogDescription>
            {action === "approve"
              ? `Are you sure you want to approve "${expense.title}"? This will deduct ₹${expense.amount.toLocaleString("en-IN")} from the wallet.`
              : `Are you sure you want to reject "${expense.title}"? Please provide a reason.`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Expense Details</Label>
            <div className="rounded-lg border p-3 space-y-1">
              <p className="font-medium">{expense.title}</p>
              <p className="text-sm text-muted-foreground">
                Category: {expense.category} • Amount: ₹{expense.amount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          {action === "reject" && (
            <div className="grid gap-2">
              <Label htmlFor="rejectionReason">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => onRejectionReasonChange(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                required
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={action === "approve" ? "default" : "destructive"}
            onClick={onSubmit}
            disabled={loading || (action === "reject" && !rejectionReason.trim())}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : action === "approve" ? (
              "Approve"
            ) : (
              "Reject"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Expense Detail Sheet
function ExpenseDetailSheet({
  expense,
  onClose,
}: {
  expense: Expense | null;
  onClose: () => void;
}) {
  if (!expense) return null;

  return (
    <Sheet open={!!expense} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Expense Details</SheetTitle>
          <SheetDescription>Complete information about this expense</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <Label className="text-muted-foreground">Title</Label>
            <p className="font-medium mt-1">{expense.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Category</Label>
              <p className="font-medium mt-1">{expense.category}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Amount</Label>
              <p className="font-medium mt-1 text-warning">
                ₹{expense.amount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          {expense.eventId && (
            <div>
              <Label className="text-muted-foreground">Event</Label>
              <p className="font-medium mt-1">{expense.eventId.name}</p>
            </div>
          )}
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <div className="mt-1">
              <Badge className={STATUS_COLORS[expense.approvalStatus]}>
                {STATUS_LABELS[expense.approvalStatus]}
              </Badge>
            </div>
          </div>
          {expense.approvedBy && (
            <div>
              <Label className="text-muted-foreground">
                {expense.approvalStatus === "approved" ? "Approved By" : "Rejected By"}
              </Label>
              <p className="font-medium mt-1">
                {expense.approvedBy.name} ({expense.approvedBy.email})
              </p>
            </div>
          )}
          {expense.rejectionReason && (
            <div>
              <Label className="text-muted-foreground">Rejection Reason</Label>
              <p className="mt-1 text-sm">{expense.rejectionReason}</p>
            </div>
          )}
          {expense.billUrl && (
            <div>
              <Label className="text-muted-foreground">Bill</Label>
              <div className="mt-1">
                <a
                  href={expense.billUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Bill
                </a>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Created At</Label>
              <p className="text-sm mt-1">
                {format(new Date(expense.createdAt), "dd MMM yyyy, hh:mm a")}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Updated</Label>
              <p className="text-sm mt-1">
                {format(new Date(expense.updatedAt), "dd MMM yyyy, hh:mm a")}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
