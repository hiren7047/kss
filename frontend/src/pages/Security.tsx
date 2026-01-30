import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Loader2, User, Calendar, FileText, AlertCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { auditApi } from "@/lib/api/audit";
import { adminApi } from "@/lib/api/admin";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

const actionColors: Record<string, string> = {
  CREATE: "bg-success/10 text-success",
  UPDATE: "bg-info/10 text-info",
  DELETE: "bg-destructive/10 text-destructive",
  APPROVE: "bg-success/10 text-success",
  REJECT: "bg-warning/10 text-warning",
  LOGIN: "bg-primary/10 text-primary",
  LOGOUT: "bg-muted/10 text-muted-foreground",
};

const moduleColors: Record<string, string> = {
  USER: "bg-purple-100 text-purple-700",
  MEMBER: "bg-blue-100 text-blue-700",
  DONATION: "bg-green-100 text-green-700",
  EXPENSE: "bg-orange-100 text-orange-700",
  EVENT: "bg-pink-100 text-pink-700",
  VOLUNTEER: "bg-cyan-100 text-cyan-700",
  WALLET: "bg-yellow-100 text-yellow-700",
  DOCUMENT: "bg-indigo-100 text-indigo-700",
  AUTH: "bg-gray-100 text-gray-700",
  DATABASE: "bg-red-100 text-red-700",
};

export default function Security() {
  const [page, setPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page, moduleFilter, actionFilter],
    queryFn: () =>
      auditApi.getAuditLogs({
        page,
        limit: 20,
        module: moduleFilter !== "all" ? moduleFilter : undefined,
        action: actionFilter !== "all" ? actionFilter : undefined,
      }),
  });

  const deleteAllDataMutation = useMutation({
    mutationFn: () => adminApi.deleteAllData(),
    onSuccess: (data) => {
      toast.success("All data deleted successfully");
      setDeleteDialogOpen(false);
      // Invalidate all queries to refresh the UI
      queryClient.invalidateQueries();
      // Optionally redirect to login or dashboard
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to delete all data";
      toast.error(errorMessage);
    },
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Shield className="h-7 w-7 text-destructive" />
          Security & Audit
        </h1>
        <p className="page-description">
          View action logs, manage access, and ensure data transparency.
        </p>
      </div>

      {/* Danger Zone - Only for SUPER_ADMIN */}
      {isSuperAdmin && (
        <Card className="border-destructive shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  This action will permanently delete all data from the database. This includes:
                  members, donations, expenses, events, volunteers, documents, and all other records.
                  Only SUPER_ADMIN users can perform this action. This action cannot be undone.
                </p>
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-2">
                        <p>
                          This action will permanently delete <strong>ALL DATA</strong> from the database:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>All Members</li>
                          <li>All Donations</li>
                          <li>All Expenses</li>
                          <li>All Events</li>
                          <li>All Volunteers</li>
                          <li>All Documents</li>
                          <li>All Forms and Submissions</li>
                          <li>All CMS Content</li>
                          <li>All Audit Logs</li>
                          <li>All Users (except SUPER_ADMIN)</li>
                        </ul>
                        <p className="font-semibold text-destructive mt-4">
                          This action CANNOT be undone. Please proceed with extreme caution.
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteAllDataMutation.mutate()}
                        disabled={deleteAllDataMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteAllDataMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Yes, Delete All Data"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-card sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
              <SelectItem value="DONATION">Donation</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="EVENT">Event</SelectItem>
              <SelectItem value="VOLUNTEER">Volunteer</SelectItem>
              <SelectItem value="WALLET">Wallet</SelectItem>
              <SelectItem value="DOCUMENT">Document</SelectItem>
              <SelectItem value="AUTH">Auth</SelectItem>
              <SelectItem value="DATABASE">Database</SelectItem>
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="APPROVE">Approve</SelectItem>
              <SelectItem value="REJECT">Reject</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
              <SelectItem value="LOGOUT">Logout</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No audit logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{log.userId.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.userId.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={moduleColors[log.module] || ""}
                        >
                          {log.module}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={actionColors[log.action] || ""}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.ipAddress || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} logs
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
        </CardContent>
      </Card>
    </div>
  );
}
