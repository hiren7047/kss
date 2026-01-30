import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { volunteerRegistrationApi, VolunteerRegistration } from "@/lib/api/cms";
import { membersApi } from "@/lib/api/members";
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
  pending: "bg-yellow-100 text-yellow-800",
  contacted: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function VolunteerRegistrationsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<VolunteerRegistration | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Partial<VolunteerRegistration>>({});

  const queryClient = useQueryClient();

  // Fetch volunteer members (from Members collection)
  const { data: membersData, isLoading: membersLoading, isError: membersError, error: membersErrorData } = useQuery({
    queryKey: ['volunteerRegistrations', page, statusFilter, searchQuery],
    queryFn: () => membersApi.getMembers({
      page,
      limit: 10,
      memberType: 'volunteer',
      search: searchQuery || undefined,
      ...(statusFilter !== 'all' && { 
        approvalStatus: statusFilter === 'approved' ? 'approved' : 
                        statusFilter === 'rejected' ? 'rejected' : 
                        statusFilter === 'pending' ? 'pending' : undefined
      }),
    }),
    retry: 1,
  });

  // Also try to fetch from CMS volunteer registrations (for backward compatibility)
  const { data: cmsData, isLoading: cmsLoading } = useQuery({
    queryKey: ['cms-volunteerRegistrations', page, statusFilter],
    queryFn: () => volunteerRegistrationApi.getAll({
      page,
      limit: 10,
      ...(statusFilter !== 'all' && { status: statusFilter }),
    }),
    retry: 1,
    enabled: false, // Disable by default, use Members data
  });

  // Combine data from both sources
  const isLoading = membersLoading;
  const isError = membersError;
  const error = membersErrorData;
  
  // Transform Members data to VolunteerRegistration format
  const transformedData = membersData ? {
    data: (membersData.data || []).map((member: any) => ({
      _id: member._id,
      name: member.name,
      phone: member.mobile,
      email: member.email,
      city: member.address?.city || 'N/A',
      age: member.age || 0,
      occupation: member.occupation,
      interests: member.interests || [],
      aboutYou: member.notes,
      status: member.approvalStatus || 'pending',
      notes: member.notes,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      // Additional fields from Member
      memberId: member.memberId,
      registrationId: member.registrationId,
      approvalStatus: member.approvalStatus,
    })),
    pagination: membersData.pagination,
  } : null;

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VolunteerRegistration> }) => {
      // Update member approval status
      const updateData: any = {};
      if (data.status === 'approved') {
        updateData.approvalStatus = 'approved';
      } else if (data.status === 'rejected') {
        updateData.approvalStatus = 'rejected';
      }
      if (data.notes) {
        updateData.notes = data.notes;
      }
      return membersApi.updateMember(id, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteerRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Registration updated successfully');
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update registration');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => membersApi.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteerRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success('Registration deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete registration');
    },
  });

  const openEditDialog = (registration: VolunteerRegistration) => {
    setSelectedRegistration(registration);
    setEditingRegistration(registration);
    setIsEditDialogOpen(true);
  };

  const registrations = transformedData?.data || [];
  const pagination = transformedData?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Volunteer Registrations</h1>
        <p className="page-description">
          Manage volunteer registrations from the mainsite
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search registrations..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // Reset to first page on search
                }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1); // Reset to first page on filter change
            }}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registrations</CardTitle>
          <CardDescription>
            {pagination?.totalItems || 0} total registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">Failed to load volunteer registrations</p>
              <p className="text-sm text-muted-foreground">
                {(error as any)?.response?.data?.message || 'Please try again later'}
              </p>
            </div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-2">No registrations found</p>
              <p className="text-xs">
                {searchQuery ? 'Try adjusting your search query.' : 'Volunteer registrations will appear here once volunteers register through the mainsite.'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Registration ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg: any) => (
                  <TableRow key={reg._id}>
                    <TableCell className="font-medium">{reg.name || 'N/A'}</TableCell>
                    <TableCell>{reg.phone || reg.mobile || 'N/A'}</TableCell>
                    <TableCell>{reg.city || 'N/A'}</TableCell>
                    <TableCell>{reg.age || 'N/A'}</TableCell>
                    <TableCell>
                      {reg.registrationId ? (
                        <span className="font-mono text-xs text-primary font-semibold">
                          {reg.registrationId}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[reg.status || reg.approvalStatus || 'pending']}>
                        {reg.status || reg.approvalStatus || 'pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRegistration(reg);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(reg)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Delete this registration?')) {
                              deleteMutation.mutate(reg._id!);
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

          {/* Pagination */}
          {pagination && pagination.totalItems > 0 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} registrations
              </div>
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
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>View Registration</DialogTitle>
          </DialogHeader>

          {selectedRegistration && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedRegistration.name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedRegistration.phone || selectedRegistration.mobile || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedRegistration.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">City</Label>
                  <p className="font-medium">{selectedRegistration.city || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Age</Label>
                  <p className="font-medium">{selectedRegistration.age || 'N/A'}</p>
                </div>
                {(selectedRegistration.memberId || selectedRegistration.registrationId) && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Member ID</Label>
                    <p className="font-mono font-medium">{selectedRegistration.memberId || 'N/A'}</p>
                  </div>
                )}
                {selectedRegistration.registrationId && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Registration ID</Label>
                    <p className="font-mono font-bold text-lg text-primary">{selectedRegistration.registrationId}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={statusColors[selectedRegistration.status || selectedRegistration.approvalStatus || 'pending']}>
                    {selectedRegistration.status || selectedRegistration.approvalStatus || 'pending'}
                  </Badge>
                </div>
                {selectedRegistration.occupation && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Occupation</Label>
                    <p className="font-medium">{selectedRegistration.occupation}</p>
                  </div>
                )}
                {selectedRegistration.interests && selectedRegistration.interests.length > 0 && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Interests</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedRegistration.interests.map((interest, idx) => (
                        <Badge key={idx} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRegistration.aboutYou && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">About</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedRegistration.aboutYou}</p>
                  </div>
                )}
                {selectedRegistration.notes && (
                  <div className="col-span-2">
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedRegistration.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedRegistration && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                openEditDialog(selectedRegistration);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Registration</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Approval Status</Label>
              <Select
                value={editingRegistration.status || editingRegistration.approvalStatus || 'pending'}
                onValueChange={(value) => setEditingRegistration({ ...editingRegistration, status: value as any, approvalStatus: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: Changing status to "Approved" will activate the volunteer account.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={editingRegistration.notes || ''}
                onChange={(e) => setEditingRegistration({ ...editingRegistration, notes: e.target.value })}
                rows={4}
                placeholder="Add notes about this registration..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedRegistration?._id) {
                  updateMutation.mutate({ id: selectedRegistration._id, data: editingRegistration });
                }
              }}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
