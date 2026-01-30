import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  Save,
} from "lucide-react";
import { durgaContentApi, DurgaContent } from "@/lib/api/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";

const durgaOptions = [
  { value: 'saraswati', label: 'Saraswati Durga', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'annapurna', label: 'Annapurna Durga', color: 'bg-orange-100 text-orange-800' },
  { value: 'ganga', label: 'Ganga Durga', color: 'bg-blue-100 text-blue-800' },
  { value: 'kali', label: 'Maa Kali Durga', color: 'bg-red-100 text-red-800' },
  { value: 'lakshmi', label: 'Lakshmi Durga', color: 'bg-green-100 text-green-800' },
];

export default function DurgaContentManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDurga, setSelectedDurga] = useState<DurgaContent | null>(null);
  const [editingDurga, setEditingDurga] = useState<Partial<DurgaContent>>({
    durgaId: 'saraswati',
    language: 'en',
    name: '',
    activities: [],
    activitiesDetailed: [],
    impactNumbers: [],
    isActive: true,
    order: 0,
  });

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['durgaContents'],
    queryFn: () => durgaContentApi.getAll(),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<DurgaContent>) => durgaContentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['durgaContents'] });
      toast.success('Durga content created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ durgaId, data }: { durgaId: string; data: Partial<DurgaContent> }) =>
      durgaContentApi.update(durgaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['durgaContents'] });
      toast.success('Durga content updated successfully');
      setIsEditDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (durgaId: string) => durgaContentApi.delete(durgaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['durgaContents'] });
      toast.success('Durga content deleted successfully');
    },
  });

  const resetForm = () => {
    setEditingDurga({
      durgaId: 'saraswati',
      language: 'en',
      name: '',
      activities: [],
      activitiesDetailed: [],
      impactNumbers: [],
      isActive: true,
      order: 0,
    });
  };

  const openEditDialog = (durga: DurgaContent) => {
    setSelectedDurga(durga);
    setEditingDurga(durga);
    setIsEditDialogOpen(true);
  };

  const addActivity = () => {
    setEditingDurga({
      ...editingDurga,
      activities: [...(editingDurga.activities || []), ''],
    });
  };

  const addDetailedActivity = () => {
    setEditingDurga({
      ...editingDurga,
      activitiesDetailed: [...(editingDurga.activitiesDetailed || []), { name: '', description: '' }],
    });
  };

  const addImpactNumber = () => {
    setEditingDurga({
      ...editingDurga,
      impactNumbers: [...(editingDurga.impactNumbers || []), { label: '', value: 0, suffix: '+' }],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Durga Content Management</h1>
            <p className="page-description">
              Manage content for all 5 Durga service paths
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Durga Content
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Durga Contents</CardTitle>
          <CardDescription>
            {data?.data?.length || 0} Durga contents configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">Failed to load Durga contents</p>
              <p className="text-sm text-muted-foreground">
                {(error as any)?.response?.data?.message || 'Please try again later'}
              </p>
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No Durga contents found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.data.map((durga: DurgaContent) => {
                const durgaInfo = durgaOptions.find(d => d.value === durga.durgaId);
                return (
                  <Card key={durga.durgaId} className="relative">
                    {durga.imageUrl && (
                      <div className="relative h-32 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                        <img
                          src={durga.imageUrl}
                          alt={durga.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{durga.name}</CardTitle>
                        <Badge className={durgaInfo?.color}>
                          {durgaInfo?.label}
                        </Badge>
                      </div>
                      <CardDescription>{durga.meaning}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p><strong>Image:</strong> {durga.imageUrl ? '✅ Set' : '❌ Missing'}</p>
                        <p><strong>Activities:</strong> {durga.activities?.length || 0}</p>
                        <p><strong>Impact Numbers:</strong> {durga.impactNumbers?.length || 0}</p>
                        <p><strong>Status:</strong> {durga.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(durga)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Delete this Durga content?')) {
                              deleteMutation.mutate(durga.durgaId);
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Create Durga Content' : 'Edit Durga Content'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Durga</Label>
                <select
                  value={editingDurga.durgaId}
                  onChange={(e) => setEditingDurga({ ...editingDurga, durgaId: e.target.value as any })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  disabled={!isCreateDialogOpen}
                >
                  {durgaOptions.map((durga) => (
                    <option key={durga.value} value={durga.value}>
                      {durga.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={editingDurga.order || 0}
                  onChange={(e) => setEditingDurga({ ...editingDurga, order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={editingDurga.name || ''}
                onChange={(e) => setEditingDurga({ ...editingDurga, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Name (Gujarati)</Label>
              <Input
                value={editingDurga.nameGujarati || ''}
                onChange={(e) => setEditingDurga({ ...editingDurga, nameGujarati: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Meaning</Label>
                <Input
                  value={editingDurga.meaning || ''}
                  onChange={(e) => setEditingDurga({ ...editingDurga, meaning: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Meaning (Gujarati)</Label>
                <Input
                  value={editingDurga.meaningGujarati || ''}
                  onChange={(e) => setEditingDurga({ ...editingDurga, meaningGujarati: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingDurga.description || ''}
                onChange={(e) => setEditingDurga({ ...editingDurga, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Long Description</Label>
              <Textarea
                value={editingDurga.descriptionLong || ''}
                onChange={(e) => setEditingDurga({ ...editingDurga, descriptionLong: e.target.value })}
                rows={5}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={editingDurga.imageUrl || ''}
                  onChange={(e) => setEditingDurga({ ...editingDurga, imageUrl: e.target.value })}
                  placeholder="/assets/durga-saraswati.jpg or full URL"
                />
                {editingDurga.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={editingDurga.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Color (Gradient)</Label>
                <Input
                  value={editingDurga.color || ''}
                  onChange={(e) => setEditingDurga({ ...editingDurga, color: e.target.value })}
                  placeholder="linear-gradient(...)"
                />
              </div>
            </div>

            {/* Activities */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Activities</Label>
                <Button type="button" variant="outline" size="sm" onClick={addActivity}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </div>
              {editingDurga.activities?.map((activity, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={activity}
                    onChange={(e) => {
                      const activities = [...(editingDurga.activities || [])];
                      activities[index] = e.target.value;
                      setEditingDurga({ ...editingDurga, activities });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const activities = editingDurga.activities?.filter((_, i) => i !== index) || [];
                      setEditingDurga({ ...editingDurga, activities });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Detailed Activities */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Detailed Activities</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDetailedActivity}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Detailed Activity
                </Button>
              </div>
              {editingDurga.activitiesDetailed?.map((activity, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-2">
                    <Input
                      value={activity.name}
                      onChange={(e) => {
                        const activities = [...(editingDurga.activitiesDetailed || [])];
                        activities[index] = { ...activity, name: e.target.value };
                        setEditingDurga({ ...editingDurga, activitiesDetailed: activities });
                      }}
                      placeholder="Activity name"
                    />
                    <Textarea
                      value={activity.description || ''}
                      onChange={(e) => {
                        const activities = [...(editingDurga.activitiesDetailed || [])];
                        activities[index] = { ...activity, description: e.target.value };
                        setEditingDurga({ ...editingDurga, activitiesDetailed: activities });
                      }}
                      placeholder="Activity description"
                      rows={2}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const activities = editingDurga.activitiesDetailed?.filter((_, i) => i !== index) || [];
                        setEditingDurga({ ...editingDurga, activitiesDetailed: activities });
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Impact Numbers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Impact Numbers</Label>
                <Button type="button" variant="outline" size="sm" onClick={addImpactNumber}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Impact Number
                </Button>
              </div>
              {editingDurga.impactNumbers?.map((impact, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      value={impact.label}
                      onChange={(e) => {
                        const impacts = [...(editingDurga.impactNumbers || [])];
                        impacts[index] = { ...impact, label: e.target.value };
                        setEditingDurga({ ...editingDurga, impactNumbers: impacts });
                      }}
                      placeholder="Label"
                    />
                    <Input
                      type="number"
                      value={impact.value}
                      onChange={(e) => {
                        const impacts = [...(editingDurga.impactNumbers || [])];
                        impacts[index] = { ...impact, value: parseInt(e.target.value) };
                        setEditingDurga({ ...editingDurga, impactNumbers: impacts });
                      }}
                      placeholder="Value"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={impact.suffix || '+'}
                        onChange={(e) => {
                          const impacts = [...(editingDurga.impactNumbers || [])];
                          impacts[index] = { ...impact, suffix: e.target.value };
                          setEditingDurga({ ...editingDurga, impactNumbers: impacts });
                        }}
                        placeholder="Suffix"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const impacts = editingDurga.impactNumbers?.filter((_, i) => i !== index) || [];
                          setEditingDurga({ ...editingDurga, impactNumbers: impacts });
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={editingDurga.isActive}
                onChange={(e) => setEditingDurga({ ...editingDurga, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive">Active</Label>
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
                  createMutation.mutate(editingDurga);
                } else if (selectedDurga) {
                  updateMutation.mutate({ durgaId: selectedDurga.durgaId, data: editingDurga });
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
