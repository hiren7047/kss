import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  MoreVertical,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  Loader2,
  FileText,
  CreditCard,
  PenTool,
  CheckCircle2,
  Key,
  XCircle,
  Clock,
} from "lucide-react";
import { MemberRegistrationForm } from "@/components/members/MemberRegistrationForm";
import { membersApi } from "@/lib/api/members";
import { adminVolunteersApi } from "@/lib/api/adminVolunteers";
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

const typeColors: Record<string, string> = {
  donor: "bg-success/10 text-success",
  volunteer: "bg-info/10 text-info",
  beneficiary: "bg-warning/10 text-warning",
  core: "bg-primary/10 text-primary",
};

export default function Members() {
  const [searchQuery, setSearchQuery] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [approvalFilter, setApprovalFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [volunteerCredentials, setVolunteerCredentials] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch members
  const { data, isLoading } = useQuery({
    queryKey: ["members", page, searchQuery, memberTypeFilter, statusFilter, approvalFilter],
    queryFn: () =>
      membersApi.getMembers({
        page,
        limit: 10,
        search: searchQuery || undefined,
        memberType: memberTypeFilter !== "all" ? memberTypeFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        approvalStatus: approvalFilter !== "all" ? approvalFilter : undefined,
      }),
  });

  // Create member mutation
  const createMutation = useMutation({
    mutationFn: membersApi.createMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member created successfully");
      setIsAddDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create member");
    },
  });

  // Delete member mutation
  const deleteMutation = useMutation({
    mutationFn: membersApi.deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete member");
    },
  });

  // Approve member mutation
  const approveMutation = useMutation({
    mutationFn: membersApi.approveMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member registration approved successfully");
      setIsViewDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve member");
    },
  });

  // Reject member mutation
  const rejectMutation = useMutation({
    mutationFn: (data: { id: string; reason?: string }) => membersApi.rejectMember(data.id, data.reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Member registration rejected");
      setIsRejectDialogOpen(false);
      setRejectionReason("");
      setIsViewDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject member");
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this member?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = async (memberId: string, type: "form" | "card") => {
    setDownloading(`${memberId}-${type}`);
    try {
      const blob = type === "form"
        ? await membersApi.downloadRegistrationForm(memberId)
        : await membersApi.downloadIdCard(memberId);
      
      // Get member to get memberId for filename
      const member = members.find(m => m._id === memberId);
      const fileNameId = member?.memberId || memberId;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "form" ? `registration_${fileNameId}.pdf` : `idcard_${fileNameId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Downloaded ${type === "form" ? "registration form" : "ID card"}`);
    } catch (error: any) {
      toast.error("Failed to download file");
    } finally {
      setDownloading(null);
    }
  };

  const members = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            Members
          </h1>
          <p className="page-description">
            Manage all NGO members, donors, volunteers, and beneficiaries.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search members by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Member Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="donor">Donor</SelectItem>
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="beneficiary">Beneficiary</SelectItem>
              <SelectItem value="core">Core Team</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Members Table */}
      <div className="data-table">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Member</TableHead>
                <TableHead className="hidden md:table-cell">Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="hidden lg:table-cell">Registration ID</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Approval</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member._id} className="group">
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {member.memberId}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {member.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">
                            {member.email || member.mobile}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        {member.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{member.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{member.mobile}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={typeColors[member.memberType] || ""}
                      >
                        {member.memberType.charAt(0).toUpperCase() +
                          member.memberType.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {member.memberType === 'volunteer' && member.registrationId ? (
                        <span className="font-mono text-xs text-primary font-semibold">
                          {member.registrationId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {new Date(member.joinDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          member.status === "active"
                            ? "status-active"
                            : member.status === "pending"
                            ? "text-warning"
                            : member.status === "rejected"
                            ? "text-destructive"
                            : "status-inactive"
                        }
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            member.status === "active"
                              ? "bg-success"
                              : member.status === "pending"
                              ? "bg-warning"
                              : member.status === "rejected"
                              ? "bg-destructive"
                              : "bg-muted-foreground"
                          }`}
                        />
                        {member.status.charAt(0).toUpperCase() +
                          member.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {member.approvalStatus === "pending" ? (
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      ) : member.approvalStatus === "approved" ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : member.approvalStatus === "rejected" ? (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      ) : (
                        <Badge variant="outline">N/A</Badge>
                      )}
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
                            onClick={() => {
                              setSelectedMember(member);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          {member.memberType === 'volunteer' && (
                            <DropdownMenuItem
                              onClick={async () => {
                                setSelectedMember(member);
                                try {
                                  const creds = await adminVolunteersApi.getVolunteerCredentials(member._id);
                                  setVolunteerCredentials(creds.data);
                                  setIsCredentialsDialogOpen(true);
                                } catch (error: any) {
                                  toast.error(error.response?.data?.message || 'Failed to load credentials');
                                }
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Credentials
                            </DropdownMenuItem>
                          )}
                          {member.approvalStatus === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMember(member);
                                  approveMutation.mutate(member._id);
                                }}
                                disabled={approveMutation.isPending}
                                className="text-success"
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                )}
                                Approve Registration
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMember(member);
                                  setIsRejectDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject Registration
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(member._id, "form")}
                            disabled={downloading === `${member._id}-form`}
                          >
                            {downloading === `${member._id}-form` ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="mr-2 h-4 w-4" />
                            )}
                            Download Registration Form
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDownload(member._id, "card")}
                            disabled={downloading === `${member._id}-card`}
                          >
                            {downloading === `${member._id}-card` ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <CreditCard className="mr-2 h-4 w-4" />
                            )}
                            Download ID Card
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(member._id)}
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
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems
            )}{" "}
            of {pagination.totalItems} members
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

      {/* Add Member Dialog */}
      <MemberRegistrationForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSuccess={(member) => {
          // Member created successfully
        }}
      />

      {/* View Member Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Member Profile</DialogTitle>
            <DialogDescription>
              Complete member information and registration details
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              {/* Header Section with Photo and Basic Info */}
              <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/30 rounded-lg border">
                {/* Photo */}
                <div className="flex-shrink-0">
                  {selectedMember.photo ? (
                    <div className="relative">
                      <img
                        src={
                          selectedMember.photo.startsWith('http') || selectedMember.photo.startsWith('data:')
                            ? selectedMember.photo
                            : selectedMember.photo.startsWith('/uploads/')
                            ? `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${selectedMember.photo}`
                            : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${selectedMember.photo}`
                        }
                        alt="Member Photo"
                        className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border-2 border-primary/20 shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-32 h-32 sm:w-40 sm:h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 items-center justify-center bg-muted/50">
                        <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/50">
                      <Users className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Basic Information */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Member ID</p>
                    <p className="font-mono font-bold text-lg text-primary">{selectedMember.memberId}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Name</p>
                    <p className="font-semibold text-lg">{selectedMember.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Member Type</p>
                      <Badge className={typeColors[selectedMember.memberType] || ""}>
                        {selectedMember.memberType.charAt(0).toUpperCase() + selectedMember.memberType.slice(1)}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</p>
                      <Badge 
                        variant={
                          selectedMember.status === "active" 
                            ? "default" 
                            : selectedMember.status === "pending"
                            ? "outline"
                            : "secondary"
                        }
                        className={
                          selectedMember.status === "pending" 
                            ? "bg-warning/10 text-warning border-warning/20"
                            : selectedMember.status === "rejected"
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : ""
                        }
                      >
                        {selectedMember.status.charAt(0).toUpperCase() + selectedMember.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Volunteer Credentials Section */}
              {selectedMember.memberType === 'volunteer' && selectedMember.registrationId && (
                <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Volunteer Credentials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Registration ID</p>
                      <p className="font-mono font-bold text-lg text-primary">{selectedMember.registrationId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Password Status</p>
                      <Badge variant={selectedMember.password ? "default" : "secondary"}>
                        {selectedMember.password ? "Set" : "Not Set"}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedMember.password 
                          ? "Password is set. Use 'View Credentials' to reset if needed."
                          : "Password not set. Use 'View Credentials' to set password."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Status */}
              {selectedMember.approvalStatus && (
                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Approval Status</p>
                    {selectedMember.approvalStatus === "pending" ? (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    ) : selectedMember.approvalStatus === "approved" ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                  {selectedMember.approvedAt && (
                    <p className="text-xs text-muted-foreground">
                      {selectedMember.approvalStatus === "approved" ? "Approved" : "Rejected"} on{" "}
                      {new Date(selectedMember.approvedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                  {selectedMember.rejectionReason && (
                    <div className="mt-2 p-2 bg-destructive/10 rounded text-xs text-destructive">
                      <strong>Reason:</strong> {selectedMember.rejectionReason}
                    </div>
                  )}
                </div>
              )}

              {/* Personal Information Section */}
              <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">First Name</p>
                    <p className="font-medium">{selectedMember.firstName || "-"}</p>
                  </div>
                  {selectedMember.middleName && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Middle Name</p>
                      <p className="font-medium">{selectedMember.middleName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Last Name</p>
                    <p className="font-medium">{selectedMember.lastName || "-"}</p>
                  </div>
                  {selectedMember.dateOfBirth && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Date of Birth</p>
                      <p className="font-medium">
                        {new Date(selectedMember.dateOfBirth).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {selectedMember.age && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Age</p>
                      <p className="font-medium">{selectedMember.age} years</p>
                    </div>
                  )}
                  {selectedMember.gender && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Gender</p>
                      <p className="font-medium capitalize">{selectedMember.gender}</p>
                    </div>
                  )}
                  {selectedMember.parentsName && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Father's/Husband's Name</p>
                      <p className="font-medium">{selectedMember.parentsName}</p>
                    </div>
                  )}
                  {selectedMember.aadharNumber && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Aadhaar Number</p>
                      <p className="font-mono font-medium">{selectedMember.aadharNumber}</p>
                    </div>
                  )}
                  {selectedMember.idProofType && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">ID Proof Type</p>
                      <p className="font-medium">{selectedMember.idProofType}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                <h3 className="text-lg font-semibold text-primary border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      Mobile Number
                    </p>
                    <p className="font-medium">{selectedMember.mobile}</p>
                  </div>
                  {selectedMember.whatsappNumber && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">WhatsApp Number</p>
                      <p className="font-medium">{selectedMember.whatsappNumber}</p>
                    </div>
                  )}
                  {selectedMember.email && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        Email ID
                      </p>
                      <p className="font-medium break-all">{selectedMember.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address Information Section */}
              {selectedMember.address && (selectedMember.address.street || selectedMember.address.city || selectedMember.address.state) && (
                <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">Address Information</h3>
                  <div className="space-y-2">
                    {selectedMember.address.street && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Street Address</p>
                        <p className="font-medium">{selectedMember.address.street}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedMember.address.city && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">City</p>
                          <p className="font-medium">{selectedMember.address.city}</p>
                        </div>
                      )}
                      {selectedMember.address.state && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">State</p>
                          <p className="font-medium">{selectedMember.address.state}</p>
                        </div>
                      )}
                      {selectedMember.address.pincode && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Pincode</p>
                          <p className="font-medium">{selectedMember.address.pincode}</p>
                        </div>
                      )}
                      {selectedMember.address.country && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Country</p>
                          <p className="font-medium">{selectedMember.address.country}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Emergency Contact Section */}
              {selectedMember.emergencyContact && (selectedMember.emergencyContact.name || selectedMember.emergencyContact.number) && (
                <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">Emergency Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedMember.emergencyContact.name && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Name</p>
                        <p className="font-medium">{selectedMember.emergencyContact.name}</p>
                      </div>
                    )}
                    {selectedMember.emergencyContact.relation && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Relation</p>
                        <p className="font-medium">{selectedMember.emergencyContact.relation}</p>
                      </div>
                    )}
                    {selectedMember.emergencyContact.number && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Mobile Number</p>
                        <p className="font-medium">{selectedMember.emergencyContact.number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Professional Information Section */}
              {(selectedMember.occupation || selectedMember.business || selectedMember.educationDetails) && (
                <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">Professional Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedMember.occupation && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Occupation</p>
                        <p className="font-medium">{selectedMember.occupation}</p>
                      </div>
                    )}
                    {selectedMember.business && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Business</p>
                        <p className="font-medium">{selectedMember.business}</p>
                      </div>
                    )}
                    {selectedMember.educationDetails && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Education Details</p>
                        <p className="font-medium">{selectedMember.educationDetails}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Family Information Section */}
              {(selectedMember.fatherBusiness || selectedMember.motherBusiness || selectedMember.familyMembersCount) && (
                <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">Family Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedMember.fatherBusiness && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Father's Business</p>
                        <p className="font-medium">{selectedMember.fatherBusiness}</p>
                      </div>
                    )}
                    {selectedMember.motherBusiness && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Mother's Business</p>
                        <p className="font-medium">{selectedMember.motherBusiness}</p>
                      </div>
                    )}
                    {selectedMember.familyMembersCount && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Family Members Count</p>
                        <p className="font-medium">{selectedMember.familyMembersCount}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Volunteer Details Section */}
              {selectedMember.memberType === "volunteer" && (selectedMember.interests?.length > 0 || selectedMember.availability) && (
                <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">Volunteer Details</h3>
                  {selectedMember.interests && selectedMember.interests.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Areas of Interest</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.interests.map((interest, idx) => (
                          <Badge key={idx} variant="outline" className="capitalize">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedMember.availability && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Availability</p>
                      <p className="font-medium capitalize">{selectedMember.availability.replace('-', ' ')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Signature Section */}
              {selectedMember.signature && (
                <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2 flex items-center gap-2">
                    <PenTool className="h-5 w-5" />
                    Signature
                  </h3>
                  <div className="bg-muted/20 rounded-lg p-6 flex justify-center items-center border-2 border-dashed border-border">
                    <img
                      src={selectedMember.signature}
                      alt="Member Signature"
                      className="max-w-full h-auto max-h-64 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="hidden items-center justify-center text-muted-foreground">
                      <PenTool className="h-12 w-12" />
                      <p className="ml-2">Signature not available</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {selectedMember.notes && (
                <div className="border rounded-lg p-4 sm:p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b pb-2">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedMember.notes}</p>
                </div>
              )}

              {/* Action Buttons for Pending Members */}
              {selectedMember?.approvalStatus === "pending" && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t sticky bottom-0 bg-background pb-2">
                  <Button
                    onClick={() => {
                      approveMutation.mutate(selectedMember._id);
                    }}
                    disabled={approveMutation.isPending}
                    className="flex-1 bg-success hover:bg-success/90 text-white"
                    size="lg"
                  >
                    {approveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve Registration
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setIsRejectDialogOpen(true);
                    }}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Registration
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Member Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Registration</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this member registration? Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection (optional)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            {selectedMember && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="font-medium">Member: {selectedMember.name}</p>
                <p className="text-muted-foreground">ID: {selectedMember.memberId}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedMember) {
                  rejectMutation.mutate({
                    id: selectedMember._id,
                    reason: rejectionReason || undefined,
                  });
                }
              }}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Registration
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Credentials Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Volunteer Credentials</DialogTitle>
            <DialogDescription>
              Registration ID and password information for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          {volunteerCredentials && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Registration ID</Label>
                    <p className="font-mono font-bold text-lg text-primary mt-1">
                      {volunteerCredentials.registrationId}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Password</Label>
                    <div className="mt-1">
                      {volunteerCredentials.password && volunteerCredentials.password !== '***' ? (
                        <div className="space-y-2">
                          <div className="p-3 bg-primary/10 border-2 border-primary rounded-lg">
                            <p className="font-mono font-bold text-lg text-primary">
                              {volunteerCredentials.password}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            ⚠️ Please save this password. It will not be shown again.
                          </p>
                        </div>
                      ) : volunteerCredentials.hasPassword ? (
                        <div className="space-y-2">
                          <Badge variant="default">Password is Set</Badge>
                          <p className="text-xs text-muted-foreground">
                            Password is already set. Click "Reset Password" to generate a new password.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Badge variant="secondary">Password Not Set</Badge>
                          <p className="text-xs text-muted-foreground">
                            Password has not been set yet. Click "Reset Password" to generate a new password.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCredentialsDialogOpen(false)}>
              Close
            </Button>
            {selectedMember && (
              <Button
                variant="default"
                onClick={async () => {
                  try {
                    const result = await adminVolunteersApi.resetVolunteerPassword(selectedMember._id);
                    setVolunteerCredentials({
                      ...volunteerCredentials,
                      password: result.data.newPassword,
                      hasPassword: true,
                    });
                    toast.success(`Password reset! New password: ${result.data.newPassword}`);
                  } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Failed to reset password');
                  }
                }}
              >
                <PenTool className="mr-2 h-4 w-4" />
                Reset Password
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

