import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { eventsApi } from "@/lib/api/events";
import { format } from "date-fns";

export function UpcomingEvents() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["events", "upcoming"],
    queryFn: async () => {
      const response = await eventsApi.getEvents({ limit: 5 });
      const now = new Date();
      // Filter upcoming events (start date in future)
      return {
        ...response,
        data: response.data.filter((e) => new Date(e.startDate) > now),
      };
    },
  });

  const events = data?.data || [];

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-info" />
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-info" />
          <h3 className="text-lg font-semibold">Upcoming Events</h3>
        </div>
        <button
          onClick={() => navigate("/events")}
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </button>
      </div>
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No upcoming events
          </div>
        ) : (
          events.slice(0, 3).map((event) => {
            // Fetch event summary for each event to get donation/expense data
            // For now, we'll use basic info
            const progress = event.budget > 0 ? 0 : 0; // Will be updated when we fetch summary

            return (
              <div
                key={event._id}
                className="rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{event.name}</h4>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(event.startDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                    {event.location && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={event.status === "completed" ? "default" : "secondary"}
                    className={
                      event.status === "completed"
                        ? "bg-success text-success-foreground"
                        : ""
                    }
                  >
                    {event.status === "completed"
                      ? "Completed"
                      : event.status === "ongoing"
                      ? "Ongoing"
                      : "Upcoming"}
                  </Badge>
                </div>
                {event.budget > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Budget: ₹{event.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
