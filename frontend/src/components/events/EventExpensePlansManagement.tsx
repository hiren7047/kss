import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt, Edit, Trash2, Loader2, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { eventsApi, type EventExpensePlan, type CreateExpensePlanRequest } from "@/lib/api/events";
import { toast } from "sonner";
import { format } from "date-fns";

// Safe date formatting helper
const formatDate = (date: string | Date | undefined) => {
  if (!date) return "N/A";
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return format(dateObj, "PP");
  } catch (error) {
    return "Invalid Date";
  }
};

interface EventExpensePlansManagementProps {
  eventId: string;
}

export function EventExpensePlansManagement({ eventId }: EventExpensePlansManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<EventExpensePlan | null>(null);
  const queryClient = useQueryClient();

  const { data: plansData, isLoading } = useQuery({
    queryKey: ["event-expense-plans", eventId],
    queryFn: () => eventsApi.getEventExpensePlans(eventId),
    enabled: !!eventId,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateExpensePlanRequest) => eventsApi.createExpensePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-expense-plans", eventId] });
      toast.success("Expense plan created successfully");
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create expense plan");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateExpensePlanRequest> }) =>
      eventsApi.updateExpensePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-expense-plans", eventId] });
      toast.success("Expense plan updated successfully");
      setIsEditDialogOpen(false);
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update expense plan");
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => eventsApi.approveExpensePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-expense-plans", eventId] });
      toast.success("Expense plan approved");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to approve expense plan");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventsApi.deleteExpensePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-expense-plans", eventId] });
      toast.success("Expense plan deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete expense plan");
    },
  });

  const plans = plansData?.data || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", class: "bg-success/10 text-success", icon: CheckCircle2 };
      case "in_progress":
        return { label: "In Progress", class: "bg-info/10 text-info", icon: Calendar };
      case "cancelled":
        return { label: "Cancelled", class: "bg-muted text-muted-foreground" };
      default:
        return { label: "Planned", class: "bg-warning/10 text-warning" };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "critical":
        return { label: "Critical", class: "bg-destructive/10 text-destructive" };
      case "high":
        return { label: "High", class: "bg-warning/10 text-warning" };
      case "medium":
        return { label: "Medium", class: "bg-info/10 text-info" };
      default:
        return { label: "Low", class: "bg-muted text-muted-foreground" };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Expense Plans</h3>
          <p className="text-sm text-muted-foreground">
            Plan and track upcoming expenses for this event
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense Plan
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading expense plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No expense plans yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add planned expenses for this event
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Expense Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => {
            const statusConfig = getStatusConfig(plan.status);
            const priorityConfig = getPriorityConfig(plan.priority);
            const variance = plan.actualAmount - plan.estimatedAmount;
            const variancePercentage = plan.estimatedAmount > 0
              ? ((variance / plan.estimatedAmount) * 100)
              : 0;

            return (
              <Card key={plan._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{plan.title}</CardTitle>
                      {plan.description && (
                        <CardDescription className="mt-1">{plan.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className={statusConfig.class}>
                        {statusConfig.label}
                      </Badge>
                      <Badge variant="outline" className={priorityConfig.class}>
                        {priorityConfig.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Category</p>
                      <p className="font-semibold">{plan.category}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Planned Date</p>
                      <p className="font-semibold">{formatDate(plan.plannedDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estimated</p>
                      <p className="font-semibold">₹{plan.estimatedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Actual</p>
                      <p className={`font-semibold ${plan.actualAmount > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                        ₹{plan.actualAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {plan.actualAmount > 0 && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Variance</span>
                        <span className={`font-semibold ${variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {variance >= 0 ? '+' : ''}₹{Math.abs(variance).toLocaleString()} ({variancePercentage >= 0 ? '+' : ''}{variancePercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}

                  {plan.notes && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">{plan.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {!plan.isApproved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Approve this expense plan?")) {
                            approveMutation.mutate(plan._id);
                          }
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this expense plan?")) {
                          deleteMutation.mutate(plan._id);
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
      <ExpensePlanDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        eventId={eventId}
        onSubmit={(data) => createMutation.mutate(data)}
        isLoading={createMutation.isPending}
      />

      {/* Edit Dialog */}
      {selectedPlan && (
        <ExpensePlanDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          eventId={eventId}
          plan={selectedPlan}
          onSubmit={(data) => updateMutation.mutate({ id: selectedPlan._id, data })}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
}

interface ExpensePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  plan?: EventExpensePlan;
  onSubmit: (data: CreateExpensePlanRequest | Partial<CreateExpensePlanRequest>) => void;
  isLoading: boolean;
}

function ExpensePlanDialog({
  open,
  onOpenChange,
  eventId,
  plan,
  onSubmit,
  isLoading,
}: ExpensePlanDialogProps) {
  const [formData, setFormData] = useState<CreateExpensePlanRequest>({
    eventId,
    title: plan?.title || "",
    description: plan?.description || "",
    category: plan?.category || "",
    estimatedAmount: plan?.estimatedAmount || 0,
    plannedDate: plan?.plannedDate 
      ? (() => {
          try {
            const date = typeof plan.plannedDate === 'string' ? new Date(plan.plannedDate) : plan.plannedDate;
            return isNaN(date.getTime()) ? format(new Date(), "yyyy-MM-dd") : format(date, "yyyy-MM-dd");
          } catch {
            return format(new Date(), "yyyy-MM-dd");
          }
        })()
      : format(new Date(), "yyyy-MM-dd"),
    priority: plan?.priority || "medium",
    notes: plan?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? "Edit Expense Plan" : "Create Expense Plan"}</DialogTitle>
          <DialogDescription>
            Plan an upcoming expense for this event
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Catering, Venue, Equipment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the expense..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Food, Venue, Equipment"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedAmount">Estimated Amount (₹) *</Label>
              <Input
                id="estimatedAmount"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.estimatedAmount}
                onChange={(e) => setFormData({ ...formData, estimatedAmount: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedDate">Planned Date *</Label>
              <Input
                id="plannedDate"
                type="date"
                value={formData.plannedDate}
                onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                required
              />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {plan ? "Update" : "Create"} Plan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
