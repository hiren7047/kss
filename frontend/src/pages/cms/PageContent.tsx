import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Globe,
  Save,
  Send,
  History,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { pageContentApi, PageContent } from "@/lib/api/cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const pageOptions = [
  { value: 'home', label: 'Home' },
  { value: 'about', label: 'About' },
  { value: 'contact', label: 'Contact' },
  { value: 'donate', label: 'Donate' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'durga', label: 'Durga' },
  { value: 'events', label: 'Events' },
  { value: 'gallery', label: 'Gallery' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'hi', label: 'Hindi' },
];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  published: "bg-green-100 text-green-800",
  archived: "bg-yellow-100 text-yellow-800",
};

export default function PageContentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageFilter, setPageFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<PageContent | null>(null);
  const [editingContent, setEditingContent] = useState<Partial<PageContent>>({
    pageId: 'home',
    language: 'en',
    sections: [],
    metaTags: {},
    status: 'draft',
  });

  const queryClient = useQueryClient();

  // Fetch page contents
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pageContents', page, pageFilter, languageFilter, statusFilter],
    queryFn: () => pageContentApi.getAll({
      page,
      limit: 10,
      ...(pageFilter !== 'all' && { pageId: pageFilter }),
      ...(languageFilter !== 'all' && { language: languageFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
    }),
    retry: 1,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<PageContent>) => pageContentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents'] });
      toast.success('Page content created successfully');
      setIsCreateDialogOpen(false);
      setEditingContent({
        pageId: 'home',
        language: 'en',
        sections: [],
        metaTags: {},
        status: 'draft',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create page content');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ pageId, language, data }: { pageId: string; language: string; data: Partial<PageContent> }) =>
      pageContentApi.update(pageId, language, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents'] });
      toast.success('Page content updated successfully');
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update page content');
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: ({ pageId, language, changeReason }: { pageId: string; language: string; changeReason?: string }) =>
      pageContentApi.publish(pageId, language, changeReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents'] });
      toast.success('Page content published successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to publish page content');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: ({ pageId, language }: { pageId: string; language: string }) =>
      pageContentApi.delete(pageId, language),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pageContents'] });
      toast.success('Page content deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete page content');
    },
  });

  const handleCreate = () => {
    createMutation.mutate(editingContent);
  };

  const handleUpdate = () => {
    if (!selectedContent) return;
    updateMutation.mutate({
      pageId: selectedContent.pageId,
      language: selectedContent.language,
      data: editingContent,
    });
  };

  const handlePublish = () => {
    if (!selectedContent) return;
    publishMutation.mutate({
      pageId: selectedContent.pageId,
      language: selectedContent.language,
    });
  };

  const handleDelete = () => {
    if (!selectedContent) return;
    if (confirm('Are you sure you want to delete this page content?')) {
      deleteMutation.mutate({
        pageId: selectedContent.pageId,
        language: selectedContent.language,
      });
    }
  };

  const openEditDialog = (content: PageContent) => {
    setSelectedContent(content);
    setEditingContent(content);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (content: PageContent) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };

  const addSection = () => {
    const newSection = {
      sectionId: `section-${Date.now()}`,
      title: '',
      subtitle: '',
      content: '',
      imageUrl: '',
      order: editingContent.sections?.length || 0,
      isActive: true,
    };
    setEditingContent({
      ...editingContent,
      sections: [...(editingContent.sections || []), newSection],
    });
  };

  const updateSection = (index: number, field: string, value: any) => {
    const sections = [...(editingContent.sections || [])];
    sections[index] = { ...sections[index], [field]: value };
    setEditingContent({ ...editingContent, sections });
  };

  const removeSection = (index: number) => {
    const sections = editingContent.sections?.filter((_, i) => i !== index) || [];
    setEditingContent({ ...editingContent, sections });
  };

  const filteredContents = data?.data?.filter((content: PageContent) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        content.pageId.toLowerCase().includes(query) ||
        content.language.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Page Content Management</h1>
            <p className="page-description">
              Manage all website page content in multiple languages
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={pageFilter} onValueChange={setPageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pages</SelectItem>
                {pageOptions.map((page) => (
                  <SelectItem key={page.value} value={page.value}>
                    {page.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Languages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                {languageOptions.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>Page Contents</CardTitle>
          <CardDescription>
            {data?.pagination?.totalItems || 0} total page contents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-2">Failed to load page contents</p>
              <p className="text-sm text-muted-foreground">
                {(error as any)?.response?.data?.message || 'Please try again later'}
              </p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No page contents found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContents.map((content: PageContent) => (
                  <TableRow key={`${content.pageId}-${content.language}`}>
                    <TableCell className="font-medium">
                      {pageOptions.find(p => p.value === content.pageId)?.label || content.pageId}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {languageOptions.find(l => l.value === content.language)?.label || content.language}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[content.status]}>
                        {content.status}
                      </Badge>
                    </TableCell>
                    <TableCell>v{content.version}</TableCell>
                    <TableCell>{content.sections?.length || 0} sections</TableCell>
                    <TableCell>
                      {content.updatedAt ? new Date(content.updatedAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(content)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(content)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {content.status !== 'published' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedContent(content);
                              handlePublish();
                            }}
                            disabled={publishMutation.isPending}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedContent(content);
                            handleDelete();
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedContent(null);
          setEditingContent({
            pageId: 'home',
            language: 'en',
            sections: [],
            metaTags: {},
            status: 'draft',
          });
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Create Page Content' : 'Edit Page Content'}
            </DialogTitle>
            <DialogDescription>
              {isCreateDialogOpen
                ? 'Create new page content for your website'
                : 'Update existing page content'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Page</Label>
                <Select
                  value={editingContent.pageId}
                  onValueChange={(value) => setEditingContent({ ...editingContent, pageId: value as any })}
                  disabled={!isCreateDialogOpen}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageOptions.map((page) => (
                      <SelectItem key={page.value} value={page.value}>
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={editingContent.language}
                  onValueChange={(value) => setEditingContent({ ...editingContent, language: value as any })}
                  disabled={!isCreateDialogOpen}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={editingContent.status}
                onValueChange={(value) => setEditingContent({ ...editingContent, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Meta Tags */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Meta Tags (SEO)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editingContent.metaTags?.title || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      metaTags: { ...editingContent.metaTags, title: e.target.value }
                    })}
                    placeholder="Page title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={editingContent.metaTags?.description || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      metaTags: { ...editingContent.metaTags, description: e.target.value }
                    })}
                    placeholder="Meta description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keywords</Label>
                  <Input
                    value={editingContent.metaTags?.keywords || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      metaTags: { ...editingContent.metaTags, keywords: e.target.value }
                    })}
                    placeholder="Keywords (comma separated)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>OG Image URL</Label>
                  <Input
                    value={editingContent.metaTags?.ogImage || ''}
                    onChange={(e) => setEditingContent({
                      ...editingContent,
                      metaTags: { ...editingContent.metaTags, ogImage: e.target.value }
                    })}
                    placeholder="Open Graph image URL"
                  />
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Sections</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {editingContent.sections?.map((section, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Section {index + 1}</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSection(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Section ID</Label>
                        <Input
                          value={section.sectionId}
                          onChange={(e) => updateSection(index, 'sectionId', e.target.value)}
                          placeholder="section-id"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Order</Label>
                        <Input
                          type="number"
                          value={section.order}
                          onChange={(e) => updateSection(index, 'order', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={section.title || ''}
                        onChange={(e) => updateSection(index, 'title', e.target.value)}
                        placeholder="Section title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Subtitle</Label>
                      <Input
                        value={section.subtitle || ''}
                        onChange={(e) => updateSection(index, 'subtitle', e.target.value)}
                        placeholder="Section subtitle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content (HTML/Rich Text)</Label>
                      <Textarea
                        value={section.content || ''}
                        onChange={(e) => updateSection(index, 'content', e.target.value)}
                        placeholder="Section content (HTML supported)"
                        rows={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL</Label>
                      <Input
                        value={section.imageUrl || ''}
                        onChange={(e) => updateSection(index, 'imageUrl', e.target.value)}
                        placeholder="Image URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`active-${index}`}
                        checked={section.isActive}
                        onChange={(e) => updateSection(index, 'isActive', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor={`active-${index}`}>Active</Label>
                    </div>
                  </div>
                </Card>
              ))}

              {(!editingContent.sections || editingContent.sections.length === 0) && (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No sections added. Click "Add Section" to add content sections.
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false);
                setIsEditDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isCreateDialogOpen ? handleCreate : handleUpdate}
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

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Page Content</DialogTitle>
            <DialogDescription>
              {selectedContent && `${pageOptions.find(p => p.value === selectedContent.pageId)?.label} - ${languageOptions.find(l => l.value === selectedContent.language)?.label}`}
            </DialogDescription>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Page</Label>
                  <p className="font-medium">{pageOptions.find(p => p.value === selectedContent.pageId)?.label}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Language</Label>
                  <p className="font-medium">{languageOptions.find(l => l.value === selectedContent.language)?.label}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge className={statusColors[selectedContent.status]}>
                    {selectedContent.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Version</Label>
                  <p className="font-medium">v{selectedContent.version}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Sections</Label>
                <div className="space-y-2">
                  {selectedContent.sections?.map((section, index) => (
                    <Card key={index} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{section.title || `Section ${index + 1}`}</h4>
                          <Badge variant={section.isActive ? "default" : "secondary"}>
                            {section.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {section.subtitle && <p className="text-sm text-muted-foreground">{section.subtitle}</p>}
                        {section.content && (
                          <div className="text-sm" dangerouslySetInnerHTML={{ __html: section.content }} />
                        )}
                        {section.imageUrl && (
                          <img src={section.imageUrl} alt={section.title} className="max-w-full h-auto rounded" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedContent && (
              <Button onClick={() => {
                setIsViewDialogOpen(false);
                openEditDialog(selectedContent);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
