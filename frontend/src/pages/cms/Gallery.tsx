import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Image,
  Plus,
  Edit,
  Trash2,
  Upload,
  Loader2,
  Save,
  Star,
  Eye,
} from "lucide-react";
import { galleryApi, GalleryItem } from "@/lib/api/cms";
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

const categoryOptions = [
  { value: 'annapurna', label: 'Annapurna' },
  { value: 'ganga', label: 'Ganga' },
  { value: 'kali', label: 'Kali' },
  { value: 'saraswati', label: 'Saraswati' },
  { value: 'events', label: 'Events' },
  { value: 'general', label: 'General' },
];

export default function GalleryManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem>>({
    title: '',
    type: 'photo',
    category: 'general',
    isFeatured: false,
    displayOrder: 0,
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['galleryItems', categoryFilter],
    queryFn: () => galleryApi.getAll({
      ...(categoryFilter !== 'all' && { category: categoryFilter }),
      limit: 100,
    }),
    retry: 1,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<GalleryItem>) => galleryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryItems'] });
      toast.success('Gallery item created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GalleryItem> }) =>
      galleryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryItems'] });
      toast.success('Gallery item updated successfully');
      setIsEditDialogOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleryItems'] });
      toast.success('Gallery item deleted successfully');
    },
  });

  const resetForm = () => {
    setEditingItem({
      title: '',
      type: 'photo',
      category: 'general',
      isFeatured: false,
      displayOrder: 0,
    });
  };

  const openEditDialog = (item: GalleryItem) => {
    setSelectedItem(item);
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const filteredItems = data?.data?.filter((item: GalleryItem) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Gallery Management</h1>
            <p className="page-description">
              Manage photos and videos for the website gallery
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Gallery Item
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Items</CardTitle>
          <CardDescription>
            {filteredItems.length} items in gallery
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">Failed to load gallery items</p>
              <p className="text-sm text-muted-foreground">
                {(error as any)?.response?.data?.message || 'Please try again later'}
              </p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No gallery items found
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item: GalleryItem) => (
                <Card key={item._id} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    {item.type === 'photo' ? (
                      <img
                        src={item.fileUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Image className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {item.isFeatured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-yellow-500">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this gallery item?')) {
                            deleteMutation.mutate(item._id!);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                    <Badge variant="outline" className="mt-2 text-xs">
                      {categoryOptions.find(c => c.value === item.category)?.label}
                    </Badge>
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
              {isCreateDialogOpen ? 'Add Gallery Item' : 'Edit Gallery Item'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={editingItem.type}
                  onValueChange={(value) => setEditingItem({ ...editingItem, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={editingItem.category}
                  onValueChange={(value) => setEditingItem({ ...editingItem, category: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={editingItem.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>File URL</Label>
              <Input
                value={editingItem.fileUrl || ''}
                onChange={(e) => setEditingItem({ ...editingItem, fileUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail URL (Optional)</Label>
              <Input
                value={editingItem.thumbnailUrl || ''}
                onChange={(e) => setEditingItem({ ...editingItem, thumbnailUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={editingItem.displayOrder || 0}
                  onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={editingItem.isFeatured}
                  onChange={(e) => setEditingItem({ ...editingItem, isFeatured: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isFeatured">Featured</Label>
              </div>
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
                  createMutation.mutate(editingItem);
                } else if (selectedItem?._id) {
                  updateMutation.mutate({ id: selectedItem._id, data: editingItem });
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
