import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, Edit, Trash2, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { eventsApi, type EventItem, type CreateEventItemRequest } from "@/lib/api/events";
import { toast } from "sonner";

interface EventItemsManagementProps {
  eventId: string;
}

export function EventItemsManagement({ eventId }: EventItemsManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EventItem | null>(null);
  const queryClient = useQueryClient();

  const { data: itemsData, isLoading } = useQuery({
    queryKey: ["event-items", eventId],
    queryFn: () => eventsApi.getEventItems(eventId),
    enabled: !!eventId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEventItemRequest) => eventsApi.createEventItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-items", eventId] });
      toast.success("Event item created successfully");
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create event item");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateEventItemRequest> }) =>
      eventsApi.updateEventItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-items", eventId] });
      toast.success("Event item updated successfully");
      setIsEditDialogOpen(false);
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update event item");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.deleteEventItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-items", eventId] });
      toast.success("Event item deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete event item");
    },
  });

  const items = itemsData?.data || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", class: "bg-success/10 text-success" };
      case "partial":
        return { label: "Partial", class: "bg-warning/10 text-warning" };
      default:
        return { label: "Pending", class: "bg-muted text-muted-foreground" };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Event Items</h3>
          <p className="text-sm text-muted-foreground">
            Manage items that need funding (e.g., chairs, tables, food items)
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add items that need funding for this event
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => {
            const statusConfig = getStatusConfig(item.status);
            const completionPercentage = item.totalAmount > 0
              ? (item.donatedAmount / item.totalAmount) * 100
              : 0;
            const remainingAmount = item.totalAmount - item.donatedAmount;
            const remainingQuantity = item.totalQuantity - item.donatedQuantity;

            return (
              <Card key={item._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      {item.description && (
                        <CardDescription className="mt-1">{item.description}</CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary" className={statusConfig.class}>
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Funding Progress</span>
                      <span className="font-semibold">{completionPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>₹{item.donatedAmount.toLocaleString()} / ₹{item.totalAmount.toLocaleString()}</span>
                      <span>₹{remainingAmount.toLocaleString()} remaining</span>
                    </div>
                  </div>

                  {/* Quantity Info */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-semibold">
                        {item.donatedQuantity} / {item.totalQuantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Unit Price</p>
                      <p className="font-semibold">₹{item.unitPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this item?")) {
                          deleteMutation.mutate(item._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <EventItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        eventId={eventId}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      {selectedItem && (
        <EventItemDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          eventId={eventId}
          item={selectedItem}
          onSubmit={(data) => updateMutation.mutate({ id: selectedItem._id, data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

interface EventItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  item?: EventItem;
  onSubmit: (data: CreateEventItemRequest) => void;
  isLoading: boolean;
}

function EventItemDialog({
  open,
  onOpenChange,
  eventId,
  item,
  onSubmit,
  isLoading,
}: EventItemDialogProps) {
  const [formData, setFormData] = useState<CreateEventItemRequest>({
    eventId,
    name: item?.name || "",
    description: item?.description || "",
    unitPrice: item?.unitPrice || 0,
    totalQuantity: item?.totalQuantity || 1,
    priority: item?.priority || "medium",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const totalAmount = formData.unitPrice * formData.totalQuantity;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Event Item" : "Create Event Item"}</DialogTitle>
          <DialogDescription>
            Add an item that needs funding for this event (e.g., chairs, tables, food items)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Chairs, Tables, Food Items"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the item..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Unit Price (₹) *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalQuantity">Total Quantity *</Label>
              <Input
                id="totalQuantity"
                type="number"
                min="1"
                value={formData.totalQuantity}
                onChange={(e) => setFormData({ ...formData, totalQuantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Amount Needed</span>
                <span className="text-lg font-bold">₹{totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {item ? "Update" : "Create"} Item
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
