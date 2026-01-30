import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { eventsApi, type Event, type CreateEventRequest } from "@/lib/api/events";
import { toast } from "sonner";
import { format } from "date-fns";

interface EventCreateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event;
}

export function EventCreateEditDialog({
  open,
  onOpenChange,
  event,
}: EventCreateEditDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateEventRequest>({
    name: "",
    description: "",
    location: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(Date.now() + 86400000), "yyyy-MM-dd"), // Tomorrow
    budget: 0,
    targetAmount: 0,
    managerId: "",
    status: "planned",
  });

  useEffect(() => {
    if (event) {
      const safeFormatDate = (date: string | Date | undefined) => {
        if (!date) return format(new Date(), "yyyy-MM-dd");
        try {
          const dateObj = typeof date === 'string' ? new Date(date) : date;
          if (isNaN(dateObj.getTime())) return format(new Date(), "yyyy-MM-dd");
          return format(dateObj, "yyyy-MM-dd");
        } catch {
          return format(new Date(), "yyyy-MM-dd");
        }
      };

      setFormData({
        name: event.name,
        description: event.description || "",
        location: event.location || "",
        startDate: safeFormatDate(event.startDate),
        endDate: safeFormatDate(event.endDate),
        budget: event.budget || 0,
        targetAmount: event.targetAmount || 0,
        managerId: typeof event.managerId === "string" ? event.managerId : event.managerId._id,
        status: event.status,
      });
    } else {
      // Reset form for new event
      setFormData({
        name: "",
        description: "",
        location: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(Date.now() + 86400000), "yyyy-MM-dd"),
        budget: 0,
        targetAmount: 0,
        managerId: "",
        status: "planned",
      });
    }
  }, [event, open]);

  const createMutation = useMutation({
    mutationFn: (data: CreateEventRequest) => eventsApi.createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event created successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create event");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventRequest> }) =>
      eventsApi.updateEvent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event-summary"] });
      toast.success("Event updated successfully");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update event");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (event) {
      updateMutation.mutate({ id: event._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Note: In a real app, you'd fetch users/admins for the manager dropdown
  // For now, we'll use a text input or you can implement a user selection component
  // This is a placeholder - you'll need to implement user fetching
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
          <DialogDescription>
            {event
              ? "Update event details and target amount"
              : "Create a new event with target amount and budget tracking"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Medical Health Camp"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the event..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Event location"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (₹)</Label>
              <Input
                id="targetAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })}
                placeholder="Fundraising goal"
              />
              <p className="text-xs text-muted-foreground">
                Set the target amount for fundraising
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget">Budget (₹)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                placeholder="Estimated budget"
              />
              <p className="text-xs text-muted-foreground">
                Estimated budget for the event
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="managerId">Manager ID *</Label>
              <Input
                id="managerId"
                value={formData.managerId}
                onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                placeholder="User ID of event manager"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the user ID of the event manager
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {event ? "Update" : "Create"} Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
