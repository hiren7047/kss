import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Plus,
  MapPin,
  Users,
  IndianRupee,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  Loader2,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { eventsApi, type Event } from "@/lib/api/events";
import { toast } from "sonner";
import { format } from "date-fns";
import { EventCreateEditDialog } from "@/components/events/EventCreateEditDialog";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "completed":
      return { label: "Completed", class: "bg-success/10 text-success", icon: CheckCircle };
    case "ongoing":
      return { label: "Ongoing", class: "bg-info/10 text-info", icon: Clock };
    case "planned":
      return { label: "Planned", class: "bg-warning/10 text-warning", icon: Clock };
    case "cancelled":
      return { label: "Cancelled", class: "bg-muted text-muted-foreground", icon: AlertCircle };
    default:
      return { label: "Draft", class: "bg-muted text-muted-foreground", icon: AlertCircle };
  }
};

export default function Events() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ["events", activeTab],
    queryFn: () => eventsApi.getEvents({
      status: activeTab !== "all" ? activeTab : undefined,
      page: 1,
      limit: 50,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete event");
    },
  });

  const events = eventsData?.data || [];
  const filteredEvents = activeTab === "all"
    ? events
    : events.filter((e) => {
        if (activeTab === "upcoming") return e.status === "planned";
        if (activeTab === "ongoing") return e.status === "ongoing";
        if (activeTab === "completed") return e.status === "completed";
        return true;
      });

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (event: Event) => {
    if (confirm(`Are you sure you want to delete "${event.name}"?`)) {
      deleteMutation.mutate(event._id);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-2">
            <Calendar className="h-7 w-7 text-info" />
            Events
          </h1>
          <p className="page-description">
            Manage all NGO activities, camps, and community events with target tracking and item-based donations.
          </p>
        </div>
        <Button className="gap-2 bg-info hover:bg-info/90" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-info" />
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === "all"
                  ? "Create your first event to get started"
                  : `No ${activeTab} events at the moment`}
              </p>
              {activeTab === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              {filteredEvents.map((event) => {
                // Fetch summary for each event
                const EventCard = ({ event }: { event: Event }) => {
                  const { data: summary } = useQuery({
                    queryKey: ["event-summary", event._id],
                    queryFn: () => eventsApi.getEventSummary(event._id),
                    enabled: !!event._id,
                  });

                  const statusConfig = getStatusConfig(event.status);
                  const summaryData = summary?.data?.summary;
                  
                  // Use targetAmount if available, otherwise use budget
                  const targetAmount = event.targetAmount || summaryData?.budget || 0;
                  const totalDonations = summaryData?.totalDonations || 0;
                  const totalExpenses = summaryData?.totalExpenses || 0;
                  const remaining = totalDonations - totalExpenses;
                  
                  // Calculate funding percentage based on target
                  const fundingPercent = targetAmount > 0
                    ? Math.round((totalDonations / targetAmount) * 100)
                    : 0;

                  return (
                    <Card key={event._id} className="overflow-hidden shadow-card hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <h3 className="text-lg font-semibold leading-tight">{event.name}</h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className={statusConfig.class}>
                            <statusConfig.icon className="mr-1 h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Event Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(event.startDate), "d MMM")}
                              {event.startDate !== event.endDate && (
                                <>
                                  {" - "}
                                  {format(new Date(event.endDate), "d MMM")}
                                </>
                              )}
                            </span>
                          </div>
                          {summaryData && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              <span>{summaryData.volunteerCount || 0} volunteers</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>

                        {/* Target Amount Display */}
                        {event.targetAmount && event.targetAmount > 0 && (
                          <div className="p-2 rounded-lg bg-info/5 border border-info/20">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Target Amount
                              </span>
                              <span className="font-semibold">₹{event.targetAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        {/* Funding Progress */}
                        {targetAmount > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Funding Progress</span>
                              <span className="font-semibold">{fundingPercent}%</span>
                            </div>
                            <Progress value={Math.min(100, fundingPercent)} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>₹{totalDonations.toLocaleString()} raised</span>
                              <span>₹{targetAmount.toLocaleString()} goal</span>
                            </div>
                          </div>
                        )}

                        {/* Financial Summary */}
                        {summaryData && (
                          <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/50 p-3">
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Collected</p>
                              <p className="text-sm font-semibold text-success">
                                ₹{totalDonations.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center border-x border-border">
                              <p className="text-xs text-muted-foreground">Spent</p>
                              <p className="text-sm font-semibold text-warning">
                                ₹{totalExpenses.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-muted-foreground">Remaining</p>
                              <p className={`text-sm font-semibold ${remaining >= 0 ? 'text-info' : 'text-destructive'}`}>
                                ₹{remaining.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => navigate(`/events/${event._id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(event)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(event)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                };

                return <EventCard key={event._id} event={event} />;
              })}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Create/Edit Dialog */}
      <EventCreateEditDialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          setIsEditDialogOpen(open);
          if (!open) setSelectedEvent(null);
        }}
        event={selectedEvent || undefined}
      />
    </div>
  );
}
