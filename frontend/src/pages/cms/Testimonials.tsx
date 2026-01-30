import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
} from "lucide-react";
import { testimonialApi, Testimonial } from "@/lib/api/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";

export default function TestimonialsManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<Testimonial>>({
    quote: '',
    name: '',
    role: '',
    language: 'en',
    isActive: false,
    displayOrder: 0,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['testimonials', statusFilter],
    queryFn: () => testimonialApi.getAll({
      ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
      limit: 100,
    }),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Testimonial>) => testimonialApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) =>
      testimonialApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial updated successfully');
      setIsEditDialogOpen(false);
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      testimonialApi.approve(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success(`Testimonial ${isActive ? 'approved' : 'rejected'} successfully`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => testimonialApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial deleted successfully');
    },
  });

  const resetForm = () => {
    setEditingTestimonial({
      quote: '',
      name: '',
      role: '',
      language: 'en',
      isActive: false,
      displayOrder: 0,
    });
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setEditingTestimonial(testimonial);
    setIsEditDialogOpen(true);
  };

  const filteredTestimonials = data?.data?.filter((testimonial: Testimonial) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return testimonial.isActive;
    if (statusFilter === 'pending') return !testimonial.isActive;
    return true;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Testimonials Management</h1>
            <p className="page-description">
              Manage testimonials displayed on the website
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testimonials</CardTitle>
          <CardDescription>
            {filteredTestimonials.length} testimonials
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">Failed to load testimonials</p>
              <p className="text-sm text-muted-foreground">
                {(error as any)?.response?.data?.message || 'Please try again later'}
              </p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No testimonials found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTestimonials.map((testimonial: Testimonial) => (
                <Card key={testimonial._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <CardDescription>{testimonial.role}</CardDescription>
                      </div>
                      <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                        {testimonial.isActive ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm italic mb-4">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{testimonial.language.toUpperCase()}</Badge>
                      <div className="flex gap-2 ml-auto">
                        {!testimonial.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => approveMutation.mutate({ id: testimonial._id!, isActive: true })}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(testimonial)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this testimonial?')) {
                              deleteMutation.mutate(testimonial._id!);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Add Testimonial' : 'Edit Testimonial'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingTestimonial.name || ''}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={editingTestimonial.role || ''}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={editingTestimonial.language}
                  onValueChange={(value) => setEditingTestimonial({ ...editingTestimonial, language: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editingTestimonial.displayOrder || 0}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, displayOrder: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quote</Label>
              <Textarea
                value={editingTestimonial.quote || ''}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })}
                rows={4}
                placeholder="Testimonial quote..."
              />
            </div>

            <div className="space-y-2">
              <Label>Photo URL (Optional)</Label>
              <Input
                value={editingTestimonial.photo || ''}
                onChange={(e) => setEditingTestimonial({ ...editingTestimonial, photo: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (isCreateDialogOpen) {
                  createMutation.mutate(editingTestimonial);
                } else if (selectedTestimonial?._id) {
                  updateMutation.mutate({ id: selectedTestimonial._id, data: editingTestimonial });
                }
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              {isCreateDialogOpen ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
