import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  UserCheck,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { volunteersApi, type VolunteerAssignment } from "@/lib/api/volunteers";
import { membersApi } from "@/lib/api/members";
import { toast } from "sonner";

const attendanceColors: Record<string, string> = {
  present: "bg-success/10 text-success",
  absent: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
};

interface EventVolunteersAttendanceProps {
  eventId: string;
}

export function EventVolunteersAttendance({ eventId }: EventVolunteersAttendanceProps) {
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<VolunteerAssignment | null>(null);
  const [assignForm, setAssignForm] = useState({ volunteerId: "", role: "volunteer" });
  const [attendanceForm, setAttendanceForm] = useState<{
    attendance: "present" | "absent" | "pending";
    remarks: string;
  }>({ attendance: "pending", remarks: "" });

  const queryClient = useQueryClient();

  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ["volunteers-by-event", eventId],
    queryFn: () => volunteersApi.getVolunteersByEvent(eventId),
    enabled: !!eventId,
  });

  const { data: volunteersData } = useQuery({
    queryKey: ["volunteers-for-assign"],
    queryFn: () =>
      membersApi.getMembers({ limit: 200, memberType: "volunteer", status: "active" }),
    enabled: isAssignOpen,
  });

  const assignMutation = useMutation({
    mutationFn: (data: { volunteerId: string; eventId: string; role: string }) =>
      volunteersApi.assignVolunteer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers-by-event", eventId] });
      toast.success("Volunteer assigned");
      setIsAssignOpen(false);
      setAssignForm({ volunteerId: "", role: "volunteer" });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to assign");
    },
  });

  const attendanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { attendance: "present" | "absent" | "pending"; remarks?: string } }) =>
      volunteersApi.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers-by-event", eventId] });
      toast.success("Attendance updated");
      setIsAttendanceOpen(false);
      setSelectedAssignment(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update attendance");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => volunteersApi.removeVolunteer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["volunteers-by-event", eventId] });
      toast.success("Volunteer removed from event");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to remove");
    },
  });

  const assignments = assignmentsData?.data ?? [];
  const volunteers = volunteersData?.data ?? [];
  const assignedIds = new Set(assignments.map((a) => (a.volunteerId as any)?._id).filter(Boolean));

  const sevaSummary = assignments.reduce<Record<string, { assigned: number; present: number }>>(
    (acc, a) => {
      const role = a.role || "volunteer";
      if (!acc[role]) acc[role] = { assigned: 0, present: 0 };
      acc[role].assigned += 1;
      if (a.attendance === "present") acc[role].present += 1;
      return acc;
    },
    {}
  );

  const openAttendance = (a: VolunteerAssignment) => {
    setSelectedAssignment(a);
    setAttendanceForm({ attendance: a.attendance, remarks: a.remarks ?? "" });
    setIsAttendanceOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Volunteers & Attendance</h3>
          <p className="text-sm text-muted-foreground">
            Manage volunteers and seva (roles). Update attendance from here.
          </p>
        </div>
        <Button onClick={() => setIsAssignOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Assign Volunteer
        </Button>
      </div>

      {Object.keys(sevaSummary).length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm font-medium mb-2">Seva summary (service needs)</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sevaSummary).map(([role, { assigned, present }]) => (
              <Badge key={role} variant="secondary" className="text-sm px-3 py-1">
                <Users className="h-3 w-3 mr-1" />
                {role}: {present}/{assigned} present
              </Badge>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No volunteers assigned yet</p>
          <p className="text-sm mt-1">Assign volunteers to manage attendance and seva.</p>
          <Button className="mt-4" onClick={() => setIsAssignOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Volunteer
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Volunteer</TableHead>
                <TableHead>Seva (Role)</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => {
                const v = a.volunteerId as any;
                return (
                  <TableRow key={a._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {v?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2) ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{v?.name ?? "—"}</p>
                          <p className="text-xs text-muted-foreground">{v?.memberId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{a.role || "volunteer"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={attendanceColors[a.attendance] ?? ""}>
                        {a.attendance === "present" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {a.attendance === "absent" && <XCircle className="h-3 w-3 mr-1" />}
                        {a.attendance === "pending" && <Clock className="h-3 w-3 mr-1" />}
                        {a.attendance}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openAttendance(a)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Remove this volunteer from the event?")) {
                              removeMutation.mutate(a._id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Assign dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Volunteer</DialogTitle>
            <DialogDescription>Select a volunteer and seva (role) for this event.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Volunteer *</Label>
              <Select
                value={assignForm.volunteerId}
                onValueChange={(v) => setAssignForm((f) => ({ ...f, volunteerId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select volunteer" />
                </SelectTrigger>
                <SelectContent>
                  {volunteers
                    .filter((m: any) => !assignedIds.has(m._id))
                    .map((m: any) => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.name} ({m.memberId})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {volunteers.filter((m: any) => !assignedIds.has(m._id)).length === 0 && volunteers.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">All volunteers are already assigned to this event.</p>
              )}
            </div>
            <div>
              <Label>Seva (Role)</Label>
              <Input
                value={assignForm.role}
                onChange={(e) => setAssignForm((f) => ({ ...f, role: e.target.value }))}
                placeholder="e.g. Kitchen, Decoration, volunteer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!assignForm.volunteerId || assignMutation.isPending}
              onClick={() => {
                if (!assignForm.volunteerId) return;
                assignMutation.mutate({
                  volunteerId: assignForm.volunteerId,
                  eventId,
                  role: assignForm.role,
                });
              }}
            >
              {assignMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attendance dialog */}
      <Dialog open={isAttendanceOpen} onOpenChange={setIsAttendanceOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Attendance</DialogTitle>
            <DialogDescription>
              Mark attendance for this volunteer. Use remarks for performance notes.
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <Label>Volunteer</Label>
                <p className="font-medium">
                  {(selectedAssignment.volunteerId as any)?.name ?? "—"}
                </p>
              </div>
              <div>
                <Label>Attendance *</Label>
                <Select
                  value={attendanceForm.attendance}
                  onValueChange={(v: any) =>
                    setAttendanceForm((f) => ({ ...f, attendance: v }))
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
                <Label>Remarks (optional)</Label>
                <Textarea
                  value={attendanceForm.remarks}
                  onChange={(e) =>
                    setAttendanceForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                  placeholder="Performance notes..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttendanceOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={attendanceMutation.isPending}
              onClick={() => {
                if (!selectedAssignment) return;
                attendanceMutation.mutate({
                  id: selectedAssignment._id,
                  data: {
                    attendance: attendanceForm.attendance,
                    remarks: attendanceForm.remarks || undefined,
                  },
                });
              }}
            >
              {attendanceMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
