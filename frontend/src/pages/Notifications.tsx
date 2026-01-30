import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2, Loader2, Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationsApi, Notification } from "@/lib/api/notifications";
import { formatDistanceToNow, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getNotificationIcon, getNotificationColor } from "@/lib/utils/notifications";
import { useState } from "react";

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications", page, typeFilter, readFilter],
    queryFn: () =>
      notificationsApi.getNotifications({
        page,
        limit: 20,
        type: typeFilter !== "all" ? typeFilter : undefined,
        isRead: readFilter !== "all" ? readFilter : undefined,
      }),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.success("Notification marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notification as read");
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.success(`${data.data.count} notifications marked as read`);
    },
    onError: () => {
      toast.error("Failed to mark all notifications as read");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: notificationsApi.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.success("Notification deleted");
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });

  const deleteAllReadMutation = useMutation({
    mutationFn: notificationsApi.deleteAllRead,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      toast.success(`${data.data.count} read notifications deleted`);
    },
    onError: () => {
      toast.error("Failed to delete read notifications");
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }

    // Navigate to related page
    if (notification.relatedId && notification.relatedType) {
      switch (notification.relatedType) {
        case "DONATION":
          navigate("/donations");
          break;
        case "EXPENSE":
          navigate("/expenses");
          break;
        case "MEMBER":
          navigate("/members");
          break;
        case "EVENT":
          navigate("/events");
          break;
        case "VOLUNTEER":
          navigate("/volunteers");
          break;
        case "FORM":
          navigate("/forms");
          break;
        case "DOCUMENT":
          navigate("/documents");
          break;
        case "CONTACT":
          navigate("/cms/contact");
          break;
        default:
          break;
      }
    }
  };

  const notifications = data?.data || [];
  const pagination = data?.pagination;
  const unreadCount = unreadCountData?.data?.count || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Bell className="h-7 w-7 text-primary" />
              Notifications
            </h1>
            <p className="page-description">
              Manage and view all your notifications. {unreadCount > 0 && (
                <span className="font-semibold text-primary">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                Mark All Read
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => deleteAllReadMutation.mutate()}
              disabled={deleteAllReadMutation.isPending}
            >
              {deleteAllReadMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Read
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value);
              setPage(1);
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="DONATION_RECEIVED">Donations</SelectItem>
                <SelectItem value="EXPENSE_PENDING">Expenses Pending</SelectItem>
                <SelectItem value="EXPENSE_APPROVED">Expenses Approved</SelectItem>
                <SelectItem value="EXPENSE_REJECTED">Expenses Rejected</SelectItem>
                <SelectItem value="MEMBER_REGISTERED">Members</SelectItem>
                <SelectItem value="VOLUNTEER_REGISTERED">Volunteers</SelectItem>
                <SelectItem value="EVENT_CREATED">Events</SelectItem>
                <SelectItem value="LOW_WALLET_BALANCE">Low Balance</SelectItem>
                <SelectItem value="FORM_SUBMISSION">Form Submissions</SelectItem>
                <SelectItem value="VOLUNTEER_WORK_SUBMITTED">Volunteer Work</SelectItem>
                <SelectItem value="CONTACT_SUBMISSION">Contact Forms</SelectItem>
              </SelectContent>
            </Select>
            <Select value={readFilter} onValueChange={(value) => {
              setReadFilter(value);
              setPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="false">Unread</SelectItem>
                <SelectItem value="true">Read</SelectItem>
              </SelectContent>
            </Select>
            {(typeFilter !== "all" || readFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTypeFilter("all");
                  setReadFilter("all");
                  setPage(1);
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-destructive">Failed to load notifications</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["notifications"] })}
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No notifications found</p>
              <p className="text-sm">You're all caught up!</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {notifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.priority);

                  return (
                    <div
                      key={notification._id}
                      className={`flex items-start gap-4 rounded-lg border p-4 transition-all cursor-pointer hover:bg-accent hover:shadow-sm ${
                        !notification.isRead ? "bg-primary/5 border-primary/20 shadow-sm" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className={`mt-1 ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p
                                className={`text-sm font-medium ${
                                  !notification.isRead ? "font-semibold" : ""
                                }`}
                              >
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <Badge variant="secondary" className="h-2 w-2 rounded-full p-0" />
                              )}
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  notification.priority === "urgent"
                                    ? "border-destructive text-destructive"
                                    : notification.priority === "high"
                                    ? "border-orange-500 text-orange-500"
                                    : ""
                                }`}
                              >
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                {format(new Date(notification.createdAt), "MMM dd, yyyy HH:mm")}
                              </span>
                              <span>
                                {formatDistanceToNow(new Date(notification.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsReadMutation.mutate(notification._id);
                                }}
                                disabled={markAsReadMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(notification._id);
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} notifications
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasPrevPage || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!pagination.hasNextPage || isLoading}
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
