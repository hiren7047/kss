import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Award,
  FileText,
} from "lucide-react";
import { volunteersApi, VolunteerAssignment } from "@/lib/api/volunteers";
import { membersApi } from "@/lib/api/members";
import { eventsApi } from "@/lib/api/events";
import { adminVolunteersApi } from "@/lib/api/adminVolunteers";
import api from "@/lib/api";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const attendanceColors: Record<string, string> = {
  present: "bg-success/10 text-success",
  absent: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
};

export default function Volunteers() {
  const [activeTab, setActiveTab] = useState<"volunteers" | "assignments">("volunteers");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [attendanceFilter, setAttendanceFilter] = useState<string>("all");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [volunteersPage, setVolunteersPage] = useState(1);
  const [assignmentsPage, setAssignmentsPage] = useState(1);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isVolunteerProfileDialogOpen, setIsVolunteerProfileDialogOpen] = useState(false);
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<VolunteerAssignment | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any>(null);
  const [volunteerCredentials, setVolunteerCredentials] = useState<any>(null);
  const [volunteerProfile, setVolunteerProfile] = useState<any>(null);
  const [verifyData, setVerifyData] = useState({ pointsToVerify: 0 });
  const [assignFormData, setAssignFormData] = useState({
    volunteerId: "",
    eventId: "",
    role: "volunteer",
    remarks: "",
  });
  const [attendanceFormData, setAttendanceFormData] = useState({
    attendance: "pending" as "present" | "absent" | "pending",
    remarks: "",
  });

  const queryClient = useQueryClient();

  // Fetch volunteers (members with type volunteer)
  const { data: volunteersData, isLoading: volunteersLoading } = useQuery({
    queryKey: ["volunteers", volunteersPage, searchQuery, statusFilter],
    queryFn: () =>
      membersApi.getMembers({
        page: volunteersPage,
        limit: 10,
        memberType: "volunteer",
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Fetch events for assignment dropdown
  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.getEvents({ limit: 100 }),
  });

  // Fetch assignments
  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["assignments", assignmentsPage, searchQuery, attendanceFilter, eventFilter],
    queryFn: () =>
      volunteersApi.getAllAssignments({
        page: assignmentsPage,
        limit: 10,
        attendance: attendanceFilter !== "all" ? (attendanceFilter as any) : undefined,
        eventId: eventFilter !== "all" ? eventFilter : undefined,
        search: searchQuery || undefined,
      }),
  });

  // Assign volunteer mutation
  const assignMutation = useMutation({
    mutationFn: volunteersApi.assignVolunteer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Volunteer assigned successfully");
      setIsAssignDialogOpen(false);
      setAssignFormData({ volunteerId: "", eventId: "", role: "volunteer", remarks: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to assign volunteer");
    },
  });

  // Update attendance mutation
  const attendanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      volunteersApi.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Attendance updated successfully");
      setIsAttendanceDialogOpen(false);
      setSelectedAssignment(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update attendance");
    },
  });

  // Remove volunteer mutation
  const removeMutation = useMutation({
    mutationFn: volunteersApi.removeVolunteer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Volunteer removed from event");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove volunteer");
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
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast.success("Points verified successfully");
      setIsVerifyDialogOpen(false);
      setSelectedVolunteer(null);
      setVerifyData({ pointsToVerify: 0 });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to verify points");
    },
  });

  const handleAssign = () => {
    if (!assignFormData.volunteerId || !assignFormData.eventId) {
      toast.error("Please select both volunteer and event");
      return;
    }
    assignMutation.mutate(assignFormData);
  };

  const handleUpdateAttendance = () => {
    if (!selectedAssignment) return;
    attendanceMutation.mutate({
      id: selectedAssignment._id,
      data: attendanceFormData,
    });
  };

  const handleRemove = (id: string) => {
    if (confirm("Are you sure you want to remove this volunteer from the event?")) {
      removeMutation.mutate(id);
    }
  };

  const volunteers = volunteersData?.data || [];
  const volunteersPagination = volunteersData?.pagination;
  const assignments = assignmentsData?.data || [];
  const assignmentsPagination = assignmentsData?.pagination;
  const events = eventsData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <UserCheck className="h-7 w-7 text-primary" />
          Volunteers
        </h1>
        <p className="page-description">
          Manage volunteer registrations, assignments, and performance.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>
          {activeTab === "assignments" && (
            <Button className="gap-2" onClick={() => setIsAssignDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Assign Volunteer
            </Button>
          )}
        </div>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search volunteers by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVolunteersPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Volunteers Table */}
          <div className="data-table">
            {volunteersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[100px]">Member ID</TableHead>
                    <TableHead>Volunteer</TableHead>
                    <TableHead className="hidden md:table-cell">Registration ID</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No volunteers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    volunteers.map((volunteer) => (
                      <TableRow key={volunteer._id} className="group">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {volunteer.memberId}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-info/10 text-info text-sm">
                                {volunteer.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{volunteer.name}</p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {volunteer.email || volunteer.mobile}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {volunteer.registrationId ? (
                            <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {volunteer.registrationId}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-1">
                            {volunteer.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <span>{volunteer.email}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{volunteer.mobile}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {new Date(volunteer.joinDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              volunteer.status === "active"
                                ? "status-active"
                                : volunteer.status === "pending"
                                ? "text-warning"
                                : "status-inactive"
                            }
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                volunteer.status === "active"
                                  ? "bg-success"
                                  : volunteer.status === "pending"
                                  ? "bg-warning"
                                  : "bg-muted-foreground"
                              }`}
                            />
                            {volunteer.status.charAt(0).toUpperCase() + volunteer.status.slice(1)}
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
                                onClick={async () => {
                                  setSelectedVolunteer(volunteer);
                                  try {
                                    const profile = await adminVolunteersApi.getVolunteerProfile(volunteer._id);
                                    setVolunteerProfile(profile.data);
                                    setIsVolunteerProfileDialogOpen(true);
                                  } catch (error: any) {
                                    toast.error(error.response?.data?.message || 'Failed to load volunteer profile');
                                  }
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Full Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  setSelectedVolunteer(volunteer);
                                  try {
                                    const creds = await adminVolunteersApi.getVolunteerCredentials(volunteer._id);
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
                              <DropdownMenuItem
                                onClick={async () => {
                                  setSelectedVolunteer(volunteer);
                                  try {
                                    const profile = await adminVolunteersApi.getVolunteerProfile(volunteer._id);
                                    if (profile.data.points.pending > 0) {
                                      setVolunteerProfile(profile.data);
                                      setVerifyData({
                                        pointsToVerify: profile.data.points.pending
                                      });
                                      setIsVerifyDialogOpen(true);
                                    } else {
                                      toast.info('No pending points to verify for this volunteer');
                                    }
                                  } catch (error: any) {
                                    toast.error(error.response?.data?.message || 'Failed to load volunteer profile');
                                  }
                                }}
                              >
                                <Award className="mr-2 h-4 w-4" />
                                Verify Points
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setAssignFormData({
                                    ...assignFormData,
                                    volunteerId: volunteer._id,
                                  });
                                  setIsAssignDialogOpen(true);
                                }}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                Assign to Event
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
          {volunteersPagination && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(volunteersPagination.currentPage - 1) * volunteersPagination.itemsPerPage + 1}-
                {Math.min(
                  volunteersPagination.currentPage * volunteersPagination.itemsPerPage,
                  volunteersPagination.totalItems
                )}{" "}
                of {volunteersPagination.totalItems} volunteers
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!volunteersPagination.hasPrevPage}
                  onClick={() => setVolunteersPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!volunteersPagination.hasNextPage}
                  onClick={() => setVolunteersPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search assignments by volunteer or event..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setAssignmentsPage(1);
                }}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={eventFilter} onValueChange={(v) => { setEventFilter(v); setAssignmentsPage(1); }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {events.map((ev) => (
                    <SelectItem key={ev._id} value={ev._id}>
                      {ev.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={attendanceFilter} onValueChange={setAttendanceFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Attendance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Attendance</SelectItem>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignments Table */}
          <div className="data-table">
            {assignmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Volunteer</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead className="hidden lg:table-cell">Assigned</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((assignment) => {
                      const volunteer = assignment.volunteerId;
                      const event =
                        typeof assignment.eventId === "object"
                          ? assignment.eventId
                          : null;
                      return (
                        <TableRow key={assignment._id} className="group">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-info/10 text-info text-sm">
                                  {volunteer.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{volunteer.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {volunteer.memberId}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {event ? (
                              <div>
                                <p className="font-medium">{event.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>
                                    {new Date(event.startDate).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>
                                  {event.location && (
                                    <>
                                      <MapPin className="h-3 w-3 ml-2" />
                                      <span>{event.location}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">Event not found</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="secondary">{assignment.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                attendanceColors[assignment.attendance] || ""
                              }
                            >
                              {assignment.attendance === "present" ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : assignment.attendance === "absent" ? (
                                <XCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {assignment.attendance.charAt(0).toUpperCase() +
                                assignment.attendance.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-muted-foreground">
                            {new Date(assignment.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
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
                                    setSelectedAssignment(assignment);
                                    setAttendanceFormData({
                                      attendance: assignment.attendance,
                                      remarks: assignment.remarks || "",
                                    });
                                    setIsAttendanceDialogOpen(true);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Update Attendance
                                </DropdownMenuItem>
                                {assignment.remarks && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAssignment(assignment);
                                      setIsViewDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemove(assignment._id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {assignmentsPagination && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(assignmentsPagination.currentPage - 1) * assignmentsPagination.itemsPerPage + 1}-
                {Math.min(
                  assignmentsPagination.currentPage * assignmentsPagination.itemsPerPage,
                  assignmentsPagination.totalItems
                )}{" "}
                of {assignmentsPagination.totalItems} assignments
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!assignmentsPagination.hasPrevPage}
                  onClick={() => setAssignmentsPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!assignmentsPagination.hasNextPage}
                  onClick={() => setAssignmentsPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Volunteer Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Volunteer to Event</DialogTitle>
            <DialogDescription>
              Select a volunteer and event to create an assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="volunteer">Volunteer *</Label>
              <Select
                value={assignFormData.volunteerId}
                onValueChange={(value) =>
                  setAssignFormData({ ...assignFormData, volunteerId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select volunteer" />
                </SelectTrigger>
                <SelectContent>
                  {volunteers
                    .filter((v) => v.status === "active")
                    .map((volunteer) => (
                      <SelectItem key={volunteer._id} value={volunteer._id}>
                        {volunteer.name} ({volunteer.memberId})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="event">Event *</Label>
              <Select
                value={assignFormData.eventId}
                onValueChange={(value) =>
                  setAssignFormData({ ...assignFormData, eventId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.name} - {new Date(event.startDate).toLocaleDateString("en-IN")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={assignFormData.role}
                onChange={(e) =>
                  setAssignFormData({ ...assignFormData, role: e.target.value })
                }
                placeholder="e.g., Coordinator, Helper"
              />
            </div>
            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={assignFormData.remarks}
                onChange={(e) =>
                  setAssignFormData({ ...assignFormData, remarks: e.target.value })
                }
                placeholder="Additional notes about this assignment..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assignMutation.isPending}>
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Attendance Dialog */}
      <Dialog open={isAttendanceDialogOpen} onOpenChange={setIsAttendanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Attendance</DialogTitle>
            <DialogDescription>
              Mark attendance and add performance notes for this volunteer.
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <Label>Volunteer</Label>
                <p className="text-sm font-medium mt-1">
                  {typeof selectedAssignment.volunteerId === "object"
                    ? selectedAssignment.volunteerId.name
                    : "Unknown"}
                </p>
              </div>
              <div>
                <Label>Event</Label>
                <p className="text-sm font-medium mt-1">
                  {typeof selectedAssignment.eventId === "object"
                    ? selectedAssignment.eventId.name
                    : "Unknown"}
                </p>
              </div>
              <div>
                <Label htmlFor="attendance">Attendance *</Label>
                <Select
                  value={attendanceFormData.attendance}
                  onValueChange={(value: any) =>
                    setAttendanceFormData({
                      ...attendanceFormData,
                      attendance: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="remarks">Performance Notes (Optional)</Label>
                <Textarea
                  id="remarks"
                  value={attendanceFormData.remarks}
                  onChange={(e) =>
                    setAttendanceFormData({
                      ...attendanceFormData,
                      remarks: e.target.value,
                    })
                  }
                  placeholder="Add notes about volunteer performance..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAttendanceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAttendance}
              disabled={attendanceMutation.isPending}
            >
              {attendanceMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Attendance"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignment Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>
              View complete information about this volunteer assignment.
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Volunteer</Label>
                  <p className="font-medium">
                    {typeof selectedAssignment.volunteerId === "object"
                      ? selectedAssignment.volunteerId.name
                      : "Unknown"}
                  </p>
                  {typeof selectedAssignment.volunteerId === "object" && (
                    <p className="text-sm text-muted-foreground">
                      {selectedAssignment.volunteerId.memberId}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Event</Label>
                  <p className="font-medium">
                    {typeof selectedAssignment.eventId === "object"
                      ? selectedAssignment.eventId.name
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Role</Label>
                  <Badge variant="secondary">{selectedAssignment.role}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Attendance</Label>
                  <Badge
                    variant="outline"
                    className={
                      attendanceColors[selectedAssignment.attendance] || ""
                    }
                  >
                    {selectedAssignment.attendance.charAt(0).toUpperCase() +
                      selectedAssignment.attendance.slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Assigned On</Label>
                  <p className="text-sm">
                    {new Date(selectedAssignment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              {selectedAssignment.remarks && (
                <div>
                  <Label className="text-xs text-muted-foreground">Remarks / Performance Notes</Label>
                  <p className="text-sm mt-1 p-3 bg-muted/30 rounded-md">
                    {selectedAssignment.remarks}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Volunteer Credentials Dialog */}
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Volunteer Login Credentials</DialogTitle>
            <DialogDescription>
              Registration ID and password for volunteer login
            </DialogDescription>
          </DialogHeader>
          {volunteerCredentials && selectedVolunteer && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Volunteer Name</Label>
                  <p className="font-medium">{selectedVolunteer.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVolunteer.memberId}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Registration ID</Label>
                  <p className="font-mono text-lg font-bold text-primary bg-primary/10 px-3 py-2 rounded">
                    {volunteerCredentials.registrationId || 'Not assigned'}
                  </p>
                </div>
                {volunteerCredentials.hasPassword ? (
                  <div>
                    <Label className="text-xs text-muted-foreground">Password</Label>
                    <p className="text-sm text-muted-foreground">
                      Password is set. Use reset password to generate a new one.
                    </p>
                  </div>
                ) : (
                  <div>
                    <Label className="text-xs text-muted-foreground">Password</Label>
                    <p className="text-sm text-warning">No password set</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-info/10 rounded-md">
                <p className="text-xs text-info">
                  <strong>Note:</strong> Share these credentials securely with the volunteer. 
                  They can login at /volunteer/login using Registration ID and Password.
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                if (selectedVolunteer) {
                  try {
                    const result = await adminVolunteersApi.resetVolunteerPassword(selectedVolunteer._id);
                    setVolunteerCredentials({
                      ...volunteerCredentials,
                      password: result.data.newPassword,
                      hasPassword: true
                    });
                    toast.success('Password reset successfully!');
                  } catch (error: any) {
                    toast.error(error.response?.data?.message || 'Failed to reset password');
                  }
                }
              }}
            >
              Reset Password
            </Button>
            <Button variant="outline" onClick={() => setIsCredentialsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Volunteer Full Profile Dialog */}
      <Dialog open={isVolunteerProfileDialogOpen} onOpenChange={setIsVolunteerProfileDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Volunteer Complete Profile</DialogTitle>
            <DialogDescription>
              View volunteer details, credentials, points, and activity statistics
            </DialogDescription>
          </DialogHeader>
          {volunteerProfile && (
            <div className="space-y-6">
              {/* Credentials Section */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Login Credentials
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Registration ID</Label>
                    <p className="font-mono font-bold text-primary">{volunteerProfile.credentials.registrationId || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Password Status</Label>
                    <p className="text-sm">{volunteerProfile.credentials.hasPassword ? '✓ Set' : '✗ Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Points Section */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Points Summary
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Total Points</Label>
                    <p className="text-2xl font-bold text-primary">{volunteerProfile.points.total}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Verified Points</Label>
                    <p className="text-2xl font-bold text-success">{volunteerProfile.points.verified}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Pending Verification</Label>
                    <p className="text-2xl font-bold text-warning">{volunteerProfile.points.pending}</p>
                  </div>
                </div>
                {volunteerProfile.points.lastVerifiedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last verified: {new Date(volunteerProfile.points.lastVerifiedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Statistics Section */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Activity Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Work Submissions</Label>
                    <p className="text-xl font-bold">{volunteerProfile.stats.workSubmissions}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Approved Work</Label>
                    <p className="text-xl font-bold text-success">{volunteerProfile.stats.approvedWork}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Points Earned</Label>
                    <p className="text-xl font-bold text-primary">{volunteerProfile.stats.totalPointsEarned}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Expenses Submitted</Label>
                    <p className="text-xl font-bold">{volunteerProfile.stats.expensesSubmitted}</p>
                  </div>
                </div>
              </div>

              {/* Volunteer Details */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="font-medium">{volunteerProfile.volunteer.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Member ID</Label>
                    <p className="font-mono">{volunteerProfile.volunteer.memberId}</p>
                  </div>
                  {volunteerProfile.volunteer.email && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p>{volunteerProfile.volunteer.email}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-muted-foreground">Mobile</Label>
                    <p>{volunteerProfile.volunteer.mobile}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge variant={volunteerProfile.volunteer.status === 'active' ? 'default' : 'secondary'}>
                      {volunteerProfile.volunteer.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Joined</Label>
                    <p>{new Date(volunteerProfile.volunteer.joinDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVolunteerProfileDialogOpen(false)}>
              Close
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
          {volunteerProfile && selectedVolunteer && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <Label className="text-xs text-muted-foreground">Volunteer</Label>
                <p className="font-medium">{selectedVolunteer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedVolunteer.registrationId || selectedVolunteer.memberId}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Points</Label>
                  <p className="text-xl font-bold">{volunteerProfile.points.total}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Verified Points</Label>
                  <p className="text-xl font-bold text-success">{volunteerProfile.points.verified}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Pending Points</Label>
                  <p className="text-xl font-bold text-warning">{volunteerProfile.points.pending}</p>
                </div>
              </div>
              <div>
                <Label htmlFor="pointsToVerify">Points to Verify *</Label>
                <Input
                  id="pointsToVerify"
                  type="number"
                  min="1"
                  max={volunteerProfile.points.pending}
                  value={verifyData.pointsToVerify}
                  onChange={(e) =>
                    setVerifyData({
                      pointsToVerify: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder={`Max: ${volunteerProfile.points.pending}`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can verify up to {volunteerProfile.points.pending} pending points
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedVolunteer || verifyData.pointsToVerify <= 0) {
                  toast.error("Please enter valid points to verify");
                  return;
                }
                if (volunteerProfile && verifyData.pointsToVerify > volunteerProfile.points.pending) {
                  toast.error(`Cannot verify more than ${volunteerProfile.points.pending} pending points`);
                  return;
                }
                verifyPointsMutation.mutate({
                  volunteerId: selectedVolunteer._id,
                  pointsToVerify: verifyData.pointsToVerify,
                });
              }}
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
    </div>
  );
}
