import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  TrendingUp,
  Target,
  Package,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
  DollarSign,
  PieChart,
  FileText,
  Link2,
  Copy,
  Loader2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eventsApi, type EventDashboard } from "@/lib/api/events";
import { donationsApi } from "@/lib/api/donations";
import { toast } from "sonner";
import { format } from "date-fns";
import { EventItemsManagement } from "@/components/events/EventItemsManagement";
import { EventExpensePlansManagement } from "@/components/events/EventExpensePlansManagement";
import { EventAnalytics } from "@/components/events/EventAnalytics";
import { EventVolunteersAttendance } from "@/components/events/EventVolunteersAttendance";
import { eventCompletionApi } from "@/lib/api/eventCompletion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [donationLinkCreated, setDonationLinkCreated] = useState<{ slug: string; title?: string } | null>(null);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completionData, setCompletionData] = useState({
    defaultPointsForPresent: 10,
    defaultPointsForAbsent: 0,
    defaultPointsForPending: 5,
    volunteerPoints: [] as Array<{ volunteerId: string; points: number; notes?: string }>,
  });
  const [completionSummary, setCompletionSummary] = useState<any>(null);

  useEffect(() => {
    setDonationLinkCreated(null);
  }, [id]);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["event-dashboard", id],
    queryFn: () => eventsApi.getEventDashboard(id!),
    enabled: !!id,
  });

  const createLinkMutation = useMutation({
    mutationFn: () =>
      donationsApi.createDonationLink({
        purpose: "event",
        eventId: id!,
        title: `Donate for ${dashboardData?.data?.event?.name ?? "this event"}`,
      }),
    onSuccess: (res) => {
      setDonationLinkCreated({ slug: res.data.slug, title: res.data.title ?? undefined });
      const url = `${window.location.origin}/donate/${res.data.slug}`;
      navigator.clipboard.writeText(url);
      toast.success("Donation link created and copied to clipboard.");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to create donation link.");
    },
  });

  const copyDonationUrl = (slug: string) => {
    const url = `${window.location.origin}/donate/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard.");
  };

  // Fetch completion summary
  const { data: completionSummaryData } = useQuery({
    queryKey: ["event-completion-summary", id],
    queryFn: () => eventCompletionApi.getCompletionSummary(id!),
    enabled: !!id && isCompleteDialogOpen,
  });

  // Complete event mutation
  const completeEventMutation = useMutation({
    mutationFn: (data: any) => eventCompletionApi.completeEvent(id!, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["event-dashboard", id] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(
        `Event completed! Points assigned to ${response.data.pointsAssigned.length} volunteers.`
      );
      setIsCompleteDialogOpen(false);
      setCompletionData({
        defaultPointsForPresent: 10,
        defaultPointsForAbsent: 0,
        defaultPointsForPending: 5,
        volunteerPoints: [],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to complete event");
    },
  });

  const handleOpenCompleteDialog = async () => {
    setIsCompleteDialogOpen(true);
    try {
      const summary = await eventCompletionApi.getCompletionSummary(id!);
      setCompletionSummary(summary.data);
      // Initialize volunteer points
      const initialVolunteerPoints = summary.data.volunteers.map((v: any) => ({
        volunteerId: v._id,
        points: v.attendance === "present" ? 10 : v.attendance === "absent" ? 0 : 5,
        notes: "",
      }));
      setCompletionData({
        ...completionData,
        volunteerPoints: initialVolunteerPoints,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load completion summary");
    }
  };

  const handleCompleteEvent = () => {
    if (!completionSummary) return;
    completeEventMutation.mutate(completionData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-info mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData?.data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Event not found</h3>
        <Button onClick={() => navigate("/events")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const { event, financialSummary, donationAnalysis, itemAnalysis, expenseAnalysis, recommendations, recentDonations, upcomingExpenses, topDonors } = dashboardData.data;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", class: "bg-success/10 text-success", icon: CheckCircle2 };
      case "ongoing":
        return { label: "Ongoing", class: "bg-info/10 text-info", icon: Clock };
      case "planned":
        return { label: "Planned", class: "bg-warning/10 text-warning", icon: Calendar };
      default:
        return { label: "Cancelled", class: "bg-muted text-muted-foreground", icon: AlertCircle };
    }
  };

  const statusConfig = getStatusConfig(event.status);

  // Safe date formatting helper
  const formatDate = (date: string | Date | undefined, dateFormat: string = "PPP") => {
    if (!date) return "N/A";
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "Invalid Date";
      return format(dateObj, dateFormat);
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/events")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{event.name}</h1>
              <Badge variant="secondary" className={statusConfig.class}>
                <statusConfig.icon className="mr-1 h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </p>
          </div>
        </div>
        {event.status !== "completed" && event.status !== "cancelled" && (
          <Button
            onClick={handleOpenCompleteDialog}
            className="gap-2"
            variant="default"
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete Event & Assign Points
          </Button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Amount</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{financialSummary.targetAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {financialSummary.targetAchievement.toFixed(1)}% achieved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₹{financialSummary.totalDonations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {donationAnalysis.count} donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              ₹{financialSummary.totalApprovedExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenseAnalysis.completedCount} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialSummary.availableBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
              ₹{financialSummary.availableBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {financialSummary.budgetStatus === 'over_budget' ? 'Over budget' : 'Within budget'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Target Progress */}
      {financialSummary.targetAmount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Target Achievement</CardTitle>
            <CardDescription>Progress towards fundraising goal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target Progress</span>
                <span className="font-semibold">{financialSummary.targetAchievement.toFixed(1)}%</span>
              </div>
              <Progress value={Math.min(100, financialSummary.targetAchievement)} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>₹{financialSummary.totalDonations.toLocaleString()} raised</span>
                <span>₹{financialSummary.targetAmount.toLocaleString()} goal</span>
                <span>₹{financialSummary.targetRemaining.toLocaleString()} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{rec.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rec.action}</p>
                  </div>
                  <Badge variant={rec.priority === 'critical' ? 'destructive' : rec.priority === 'high' ? 'default' : 'secondary'}>
                    {rec.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="donations">Donations</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers & Attendance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="expenses">Expense Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>Latest donations for this event</CardDescription>
              </CardHeader>
              <CardContent>
                {recentDonations && recentDonations.length > 0 ? (
                  <div className="space-y-3">
                    {recentDonations.slice(0, 5).map((donation: any) => (
                      <div key={donation._id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{donation.donorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(donation.createdAt, "PPp")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">₹{donation.amount.toLocaleString()}</p>
                          {donation.eventItemId && (
                            <p className="text-xs text-muted-foreground">Item: {donation.eventItemId.name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No donations yet</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Expenses */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Expenses</CardTitle>
                <CardDescription>Planned expenses for this event</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingExpenses && upcomingExpenses.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingExpenses.slice(0, 5).map((expense: any) => (
                      <div key={expense._id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{expense.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(expense.plannedDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-warning">₹{expense.estimatedAmount.toLocaleString()}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {expense.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming expenses</p>
                )}
              </CardContent>
            </Card>

            {/* Top Donors */}
            {topDonors && topDonors.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Top Donors</CardTitle>
                  <CardDescription>Highest contributors to this event</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {topDonors.map((donor: any, idx: number) => (
                      <div key={donor._id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{donor._id}</p>
                            <p className="text-xs text-muted-foreground">{donor.count} donations</p>
                          </div>
                        </div>
                        <p className="font-semibold text-success">₹{donor.totalAmount.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-success" />
                Request Donations
              </CardTitle>
              <CardDescription>
                Create a donation link for this event. Share it so supporters can donate a general amount
                {itemAnalysis?.totalItems ? " or towards specific items (e.g. chairs, food)." : "."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {donationLinkCreated ? (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <p className="text-sm font-medium">Donation link created</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                      {window.location.origin}/donate/{donationLinkCreated.slug}
                    </code>
                    <Button variant="outline" size="sm" onClick={() => copyDonationUrl(donationLinkCreated!.slug)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDonationLinkCreated(null);
                      createLinkMutation.mutate();
                    }}
                    disabled={createLinkMutation.isPending}
                  >
                    {createLinkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create another link
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => createLinkMutation.mutate()}
                  disabled={createLinkMutation.isPending}
                  className="gap-2"
                >
                  {createLinkMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  Create Donation Link
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volunteers">
          <EventVolunteersAttendance eventId={id!} />
        </TabsContent>

        <TabsContent value="analytics">
          <EventAnalytics eventId={id!} />
        </TabsContent>

        <TabsContent value="items">
          <EventItemsManagement eventId={id!} />
        </TabsContent>

        <TabsContent value="expenses">
          <EventExpensePlansManagement eventId={id!} />
        </TabsContent>
      </Tabs>

      {/* Complete Event Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Event & Assign Points</DialogTitle>
            <DialogDescription>
              Complete this event and assign points to volunteers based on their attendance
            </DialogDescription>
          </DialogHeader>
          {completionSummary && (
            <div className="space-y-6">
              {/* Default Points Settings */}
              <div className="p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">Default Points Settings</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pointsPresent">Points for Present</Label>
                    <Input
                      id="pointsPresent"
                      type="number"
                      min="0"
                      value={completionData.defaultPointsForPresent}
                      onChange={(e) =>
                        setCompletionData({
                          ...completionData,
                          defaultPointsForPresent: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointsAbsent">Points for Absent</Label>
                    <Input
                      id="pointsAbsent"
                      type="number"
                      min="0"
                      value={completionData.defaultPointsForAbsent}
                      onChange={(e) =>
                        setCompletionData({
                          ...completionData,
                          defaultPointsForAbsent: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="pointsPending">Points for Pending</Label>
                    <Input
                      id="pointsPending"
                      type="number"
                      min="0"
                      value={completionData.defaultPointsForPending}
                      onChange={(e) =>
                        setCompletionData({
                          ...completionData,
                          defaultPointsForPending: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Volunteers List */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-4">
                  Volunteers ({completionSummary.volunteers.length})
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Volunteer</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Current Points</TableHead>
                        <TableHead>Points to Award</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completionSummary.volunteers.map((volunteer: any) => {
                        const volunteerPoint = completionData.volunteerPoints.find(
                          (vp) => vp.volunteerId === volunteer._id
                        ) || {
                          volunteerId: volunteer._id,
                          points:
                            volunteer.attendance === "present"
                              ? completionData.defaultPointsForPresent
                              : volunteer.attendance === "absent"
                              ? completionData.defaultPointsForAbsent
                              : completionData.defaultPointsForPending,
                          notes: "",
                        };

                        return (
                          <TableRow key={volunteer._id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{volunteer.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {volunteer.registrationId || volunteer.memberId}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  volunteer.attendance === "present"
                                    ? "default"
                                    : volunteer.attendance === "absent"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {volunteer.attendance.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{volunteer.currentPoints}</span>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="0"
                                value={volunteerPoint.points}
                                onChange={(e) => {
                                  const newPoints = [...completionData.volunteerPoints];
                                  const index = newPoints.findIndex(
                                    (vp) => vp.volunteerId === volunteer._id
                                  );
                                  if (index >= 0) {
                                    newPoints[index].points = parseInt(e.target.value) || 0;
                                  } else {
                                    newPoints.push({
                                      volunteerId: volunteer._id,
                                      points: parseInt(e.target.value) || 0,
                                      notes: "",
                                    });
                                  }
                                  setCompletionData({
                                    ...completionData,
                                    volunteerPoints: newPoints,
                                  });
                                }}
                                className="w-20"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="text"
                                placeholder="Optional notes"
                                value={volunteerPoint.notes || ""}
                                onChange={(e) => {
                                  const newPoints = [...completionData.volunteerPoints];
                                  const index = newPoints.findIndex(
                                    (vp) => vp.volunteerId === volunteer._id
                                  );
                                  if (index >= 0) {
                                    newPoints[index].notes = e.target.value;
                                  } else {
                                    newPoints.push({
                                      volunteerId: volunteer._id,
                                      points:
                                        volunteer.attendance === "present"
                                          ? completionData.defaultPointsForPresent
                                          : volunteer.attendance === "absent"
                                          ? completionData.defaultPointsForAbsent
                                          : completionData.defaultPointsForPending,
                                      notes: e.target.value,
                                    });
                                  }
                                  setCompletionData({
                                    ...completionData,
                                    volunteerPoints: newPoints,
                                  });
                                }}
                                className="w-32"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Volunteers</p>
                    <p className="text-2xl font-bold">{completionSummary.volunteers.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Points to Award</p>
                    <p className="text-2xl font-bold text-primary">
                      {completionData.volunteerPoints.reduce(
                        (sum, vp) => sum + vp.points,
                        0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompleteEvent}
              disabled={completeEventMutation.isPending}
            >
              {completeEventMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Event & Assign Points
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
