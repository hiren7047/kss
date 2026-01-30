import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Heart,
  Plus,
  Search,
  Download,
  MoreVertical,
  Receipt,
  Eye,
  TrendingUp,
  Wallet,
  Calendar,
  Link2,
  Copy,
  Loader2,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  donationsApi,
  type Donation,
  type CreateDonationRequest,
  type CreateDonationLinkRequest,
  type DonationLink,
} from "@/lib/api/donations";
import { eventsApi } from "@/lib/api/events";
import { toast } from "sonner";
import { format } from "date-fns";

const PURPOSE_LABELS: Record<string, string> = {
  event: "Event",
  general: "General Fund",
  emergency: "Emergency Fund",
};

const MODE_LABELS: Record<string, string> = {
  upi: "UPI",
  bank: "Bank Transfer",
  cash: "Cash",
  razorpay: "Razorpay",
};

const modeColors: Record<string, string> = {
  upi: "bg-info/10 text-info",
  bank: "bg-primary/10 text-primary",
  cash: "bg-warning/10 text-warning",
  razorpay: "bg-success/10 text-success",
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Donations() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [purpose, setPurpose] = useState<string>("all");
  const [paymentMode, setPaymentMode] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionStatus, setTransactionStatus] = useState<string>("all");
  const [detailDonation, setDetailDonation] = useState<Donation | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [createdLink, setCreatedLink] = useState<DonationLink | null>(null);

  const limit = 10;

  const { data: donationsData, isLoading: donationsLoading } = useQuery({
    queryKey: ["donations", page, limit, search, purpose, paymentMode],
    queryFn: () =>
      donationsApi.getDonations({
        page,
        limit,
        search: search || undefined,
        purpose: purpose === "all" ? undefined : purpose,
        paymentMode: paymentMode === "all" ? undefined : paymentMode,
      }),
  });

  const { data: reportData, isLoading: reportLoading } = useQuery({
    queryKey: ["donations-report"],
    queryFn: () => donationsApi.getDonationReport({}),
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events-list"],
    queryFn: () => eventsApi.getEvents({ limit: 100 }),
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["payment-transactions", transactionsPage, transactionStatus],
    queryFn: () =>
      donationsApi.getPaymentTransactions({
        page: transactionsPage,
        limit: 10,
        status: transactionStatus === "all" ? undefined : transactionStatus,
      }),
  });

  const createLinkMutation = useMutation({
    mutationFn: (data: CreateDonationLinkRequest) =>
      donationsApi.createDonationLink(data),
    onSuccess: (res) => {
      setCreatedLink(res.data);
      const base = window.location.origin;
      const url = `${base}/donate/${res.data.slug}`;
      navigator.clipboard.writeText(url);
      toast.success("Donation link created and copied to clipboard.");
    },
    onError: () => {},
  });

  const copyDonationUrl = useCallback((link: DonationLink) => {
    const base = window.location.origin;
    const url = `${base}/donate/${link.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard.");
  }, []);

  const handleDownloadSlip = useCallback(async (d: Donation) => {
    try {
      const blob = await donationsApi.downloadDonationSlip(d._id);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `donation-receipt-${d.receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Receipt downloaded.");
    } catch {
      toast.error("Failed to download receipt.");
    }
  }, []);

  const report = reportData?.data;
  const summary = report?.summary;
  const donations = donationsData?.data ?? [];
  const pagination = donationsData?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-2">
            <Heart className="h-7 w-7 text-success" />
            Donations
          </h1>
          <p className="page-description">
            Track and manage all donations with complete transparency.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              setCreatedLink(null);
              setLinkOpen(true);
            }}
          >
            <Link2 className="h-4 w-4" />
            Create Donation Link
          </Button>
          <Button
            className="gap-2 bg-success hover:bg-success/90"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Donation
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Donations"
          value={
            reportLoading
              ? "…"
              : `₹${(summary?.totalAmount ?? 0).toLocaleString("en-IN")}`
          }
          subtitle="All time"
          icon={Heart}
          variant="success"
        />
        <StatsCard
          title="This Month"
          value={
            reportLoading
              ? "…"
              : `₹${(summary?.thisMonthAmount ?? 0).toLocaleString("en-IN")}`
          }
          subtitle={format(new Date(), "MMMM yyyy")}
          trend={
            summary?.monthGrowth != null
              ? { value: Math.abs(summary.monthGrowth), isPositive: (summary.monthGrowth ?? 0) >= 0 }
              : undefined
          }
          icon={Calendar}
          variant="info"
        />
        <StatsCard
          title="Average Donation"
          value={
            reportLoading
              ? "…"
              : `₹${(summary?.averageDonation ?? 0).toLocaleString("en-IN")}`
          }
          subtitle="Per transaction"
          icon={TrendingUp}
          variant="primary"
        />
        <StatsCard
          title="Unique Donors"
          value={String(summary?.uniqueDonors ?? 0)}
          subtitle="This year"
          icon={Wallet}
          variant="warning"
        />
      </div>

      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by donor name, receipt number, transaction ID..."
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
                value={purpose}
                onValueChange={(v) => {
                  setPurpose(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] h-10">
                  <SelectValue placeholder="Purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="general">General Fund</SelectItem>
                  <SelectItem value="emergency">Emergency Fund</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={paymentMode}
                onValueChange={(v) => {
                  setPaymentMode(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[150px] h-10">
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="donations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="donations" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Donation Records</CardTitle>
              <CardDescription>
                Manage and track all donations with complete transparency
              </CardDescription>
            </CardHeader>
        <CardContent>
          <div className="data-table">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[100px] font-semibold">Receipt ID</TableHead>
                  <TableHead className="font-semibold">Donor</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
                  <TableHead className="hidden md:table-cell font-semibold">Purpose</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">Payment Mode</TableHead>
                  <TableHead className="hidden lg:table-cell font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
          <TableBody>
            {donationsLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : donations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No donations found.
                </TableCell>
              </TableRow>
            ) : (
              donations.map((d) => (
                <TableRow key={d._id} className="group">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {d.receiptNumber}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {d.isAnonymous ? "Anonymous" : d.donorName}
                      </p>
                      {d.memberId && (
                        <p className="text-xs text-muted-foreground">
                          {d.memberId.memberId}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-semibold text-success">
                      ₹{d.amount.toLocaleString("en-IN")}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="secondary">
                      {PURPOSE_LABELS[d.purpose] ?? d.purpose}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant="secondary"
                      className={modeColors[d.paymentMode] ?? ""}
                    >
                      {MODE_LABELS[d.paymentMode] ?? d.paymentMode}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {format(new Date(d.createdAt), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        (d.status ?? "completed") === "completed"
                          ? "status-active"
                          : "status-pending"
                      }
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          (d.status ?? "completed") === "completed"
                            ? "bg-success"
                            : "bg-warning"
                        }`}
                      />
                      {(d.status ?? "completed") === "completed"
                        ? "Completed"
                        : "Pending"}
                    </span>
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
                        <DropdownMenuItem
                          onClick={() => setDetailDonation(d)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadSlip(d)}
                        >
                          <Receipt className="mr-2 h-4 w-4" />
                          Download Receipt
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
            of {pagination.totalItems} donations
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
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">Payment Transactions</CardTitle>
              <CardDescription>
                View all Razorpay payment transactions and webhook events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Select value={transactionStatus} onValueChange={setTransactionStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="authorized">Authorized</SelectItem>
                    <SelectItem value="captured">Captured</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="data-table">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Donation</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : !transactionsData?.data || transactionsData.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactionsData.data.map((tx: any) => (
                        <TableRow key={tx._id}>
                          <TableCell className="font-mono text-xs">
                            {tx.razorpayPaymentId?.slice(0, 20)}...
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {tx.razorpayOrderId?.slice(0, 20)}...
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{tx.amount?.toLocaleString("en-IN")}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                tx.status === "captured"
                                  ? "bg-success/10 text-success"
                                  : tx.status === "failed"
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-warning/10 text-warning"
                              }
                            >
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {tx.processed ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <Clock className="h-4 w-4 text-warning" />
                            )}
                          </TableCell>
                          <TableCell>
                            {tx.donationId ? (
                              <Badge variant="outline">
                                {tx.donationId.receiptNumber}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(tx.createdAt), "dd MMM yyyy, HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {transactionsData?.pagination && (
                <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
                  <span>
                    Showing {(transactionsData.pagination.currentPage - 1) * transactionsData.pagination.itemsPerPage + 1}–
                    {Math.min(
                      transactionsData.pagination.currentPage * transactionsData.pagination.itemsPerPage,
                      transactionsData.pagination.totalItems
                    )}{" "}
                    of {transactionsData.pagination.totalItems} transactions
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!transactionsData.pagination.hasPrevPage}
                      onClick={() => setTransactionsPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!transactionsData.pagination.hasNextPage}
                      onClick={() => setTransactionsPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DonationDetailSheet
        donation={detailDonation}
        open={!!detailDonation}
        onOpenChange={(open) => !open && setDetailDonation(null)}
        onDownloadSlip={handleDownloadSlip}
      />

      <CreateLinkDialog
        open={linkOpen}
        onOpenChange={(open) => {
          setLinkOpen(open);
          if (!open) setCreatedLink(null);
        }}
        createdLink={createdLink}
        onCopy={copyDonationUrl}
        onCreate={createLinkMutation.mutate}
        loading={createLinkMutation.isPending}
        events={eventsData?.data ?? []}
      />

      <AddDonationDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["donations"] });
          queryClient.invalidateQueries({ queryKey: ["donations-report"] });
          setAddOpen(false);
        }}
        events={eventsData?.data ?? []}
      />
    </div>
  );
}

function DonationDetailSheet({
  donation,
  open,
  onOpenChange,
  onDownloadSlip,
}: {
  donation: Donation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownloadSlip: (d: Donation) => void;
}) {
  if (!donation) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Donation Details</SheetTitle>
          <SheetDescription>Receipt {donation.receiptNumber}</SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div>
            <Label className="text-muted-foreground">Donor</Label>
            <p className="font-medium">
              {donation.isAnonymous ? "Anonymous" : donation.donorName}
            </p>
            {donation.memberId && (
              <p className="text-sm text-muted-foreground">
                {donation.memberId.memberId}
              </p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground">Amount</Label>
            <p className="text-lg font-semibold text-success">
              ₹{donation.amount.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Purpose</Label>
            <p>{PURPOSE_LABELS[donation.purpose] ?? donation.purpose}</p>
          </div>
          <div>
            <Label className="text-muted-foreground">Payment Mode</Label>
            <p>{MODE_LABELS[donation.paymentMode] ?? donation.paymentMode}</p>
          </div>
          {(donation.transactionId || donation.razorpayPaymentId) && (
            <div>
              <Label className="text-muted-foreground">Transaction ID</Label>
              <p className="font-mono text-sm">
                {donation.razorpayPaymentId ?? donation.transactionId}
              </p>
            </div>
          )}
          <div>
            <Label className="text-muted-foreground">Date</Label>
            <p>{format(new Date(donation.createdAt), "dd MMM yyyy, HH:mm")}</p>
          </div>
          <Button
            className="w-full gap-2"
            onClick={() => onDownloadSlip(donation)}
          >
            <Receipt className="h-4 w-4" />
            Download Donation Slip (PDF)
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CreateLinkDialog({
  open,
  onOpenChange,
  createdLink,
  onCopy,
  onCreate,
  loading,
  events,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdLink: DonationLink | null;
  onCopy: (link: DonationLink) => void;
  onCreate: (data: CreateDonationLinkRequest) => void;
  loading: boolean;
  events: { _id: string; name: string }[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState<"event" | "general" | "emergency">("general");
  const [eventId, setEventId] = useState("");
  const [durgaId, setDurgaId] = useState("none");
  const [suggestedAmount, setSuggestedAmount] = useState("");

  const durgaOptions = [
    { value: 'none', label: 'None' },
    { value: 'saraswati', label: 'Saraswati Durga' },
    { value: 'annapurna', label: 'Annapurna Durga' },
    { value: 'ganga', label: 'Ganga Durga' },
    { value: 'kali', label: 'Maa Kali Durga' },
    { value: 'lakshmi', label: 'Lakshmi Durga' },
  ];

  const handleCreate = () => {
    onCreate({
      title: title || undefined,
      description: description || undefined,
      purpose,
      eventId: eventId || undefined,
      durgaId: durgaId && durgaId !== 'none' ? durgaId : undefined,
      suggestedAmount: suggestedAmount ? Number(suggestedAmount) : undefined,
    });
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setPurpose("general");
    setEventId("");
    setDurgaId("none");
    setSuggestedAmount("");
    onOpenChange(false);
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const linkUrl = createdLink ? `${baseUrl}/donate/${createdLink.slug}` : "";

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : onOpenChange(o))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Donation Link</DialogTitle>
          <DialogDescription>
            Create a shareable link for donations. Donors can pay via Razorpay.
          </DialogDescription>
        </DialogHeader>

        {createdLink ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Link created. Copy and share:</p>
            <div className="flex gap-2">
              <Input readOnly value={linkUrl} className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => onCopy(createdLink)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" className="w-full" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Title (optional)</Label>
                <Input
                  placeholder="e.g. Medical Camp Donation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Short description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Purpose</Label>
                <Select
                  value={purpose}
                  onValueChange={(v: "event" | "general" | "emergency") =>
                    setPurpose(v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="general">General Fund</SelectItem>
                    <SelectItem value="emergency">Emergency Fund</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {purpose === "event" && (
                <div className="grid gap-2">
                  <Label>Event (optional)</Label>
                  <Select value={eventId} onValueChange={setEventId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
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
                <Label>Durga (optional)</Label>
                <Select value={durgaId || "none"} onValueChange={setDurgaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Durga" />
                  </SelectTrigger>
                  <SelectContent>
                    {durgaOptions.map((durga) => (
                      <SelectItem key={durga.value} value={durga.value}>
                        {durga.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Suggested Amount ₹ (optional)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="Leave empty for any amount"
                  value={suggestedAmount}
                  onChange={(e) => setSuggestedAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create & Copy Link"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddDonationDialog({
  open,
  onOpenChange,
  onSuccess,
  events,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  events: { _id: string; name: string }[];
}) {
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState<"event" | "general" | "emergency">("general");
  const [paymentMode, setPaymentMode] = useState<"upi" | "cash" | "bank" | "razorpay">("upi");
  const [transactionId, setTransactionId] = useState("");
  const [eventId, setEventId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const createMutation = useMutation({
    mutationFn: (data: CreateDonationRequest) =>
      donationsApi.createDonation(data),
    onSuccess: () => {
      toast.success("Donation recorded.");
      onSuccess();
      reset();
    },
    onError: () => setSubmitting(false),
  });

  const reset = () => {
    setDonorName("");
    setAmount("");
    setPurpose("general");
    setPaymentMode("upi");
    setTransactionId("");
    setEventId("");
    setIsAnonymous(false);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const amt = Number(amount);
    if (!donorName.trim() || !amt || amt <= 0) {
      toast.error("Enter donor name and valid amount.");
      return;
    }
    if (paymentMode !== "razorpay") {
      setSubmitting(true);
      createMutation.mutate(
        {
          donorName: donorName.trim(),
          amount: amt,
          purpose,
          paymentMode,
          transactionId: transactionId || undefined,
          eventId: eventId || undefined,
          isAnonymous,
        },
        { onSettled: () => setSubmitting(false) }
      );
      return;
    }

    setSubmitting(true);
    try {
      await loadRazorpayScript();
      const receiptNumber = `rp_${Date.now()}`;
      const orderRes = await donationsApi.createRazorpayOrder(
        amt,
        receiptNumber,
        { purpose, eventId: eventId || undefined }
      );
      if (!orderRes.success || !orderRes.data?.keyId) {
        toast.error("Razorpay not configured. Use UPI/Cash/Bank.");
        setSubmitting(false);
        return;
      }

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: "Krishna Sada Sahayate",
        description: `Donation - ${PURPOSE_LABELS[purpose]}`,
        order_id: orderRes.data.orderId,
        handler: async (res: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await donationsApi.verifyRazorpayPayment(
              {
                donorName: isAnonymous ? "Anonymous" : donorName.trim(),
                amount: amt,
                purpose,
                eventId: eventId || undefined,
                isAnonymous,
              },
              res.razorpay_order_id,
              res.razorpay_payment_id,
              res.razorpay_signature
            );
            toast.success("Payment verified. Donation recorded.");
            onSuccess();
            reset();
          } catch {
            toast.error("Payment verification failed.");
          } finally {
            setSubmitting(false);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Failed to open Razorpay.");
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? handleClose() : onOpenChange(o))}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Donation</DialogTitle>
          <DialogDescription>
            Record a donation. Use Razorpay for online payment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anon"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <Label htmlFor="anon">Anonymous donation</Label>
          </div>
          {!isAnonymous && (
            <div className="grid gap-2">
              <Label>Donor Name</Label>
              <Input
                placeholder="Full name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label>Amount (₹)</Label>
            <Input
              type="number"
              min={1}
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Purpose</Label>
            <Select
              value={purpose}
              onValueChange={(v: "event" | "general" | "emergency") =>
                setPurpose(v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="general">General Fund</SelectItem>
                <SelectItem value="emergency">Emergency Fund</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {purpose === "event" && (
            <div className="grid gap-2">
              <Label>Event</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
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
            <Label>Payment Mode</Label>
            <Select
              value={paymentMode}
              onValueChange={(v: "upi" | "cash" | "bank" | "razorpay") =>
                setPaymentMode(v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="razorpay">Razorpay (Online)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {paymentMode !== "razorpay" && (
            <div className="grid gap-2">
              <Label>Transaction ID (optional)</Label>
              <Input
                placeholder="UPI ref / NEFT / Cash slip no."
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Donation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
