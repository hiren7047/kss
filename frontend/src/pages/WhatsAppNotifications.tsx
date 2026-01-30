import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Send,
  Users,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Filter,
  X,
} from "lucide-react";
import { whatsAppApi } from "@/lib/api/whatsapp";
import { membersApi } from "@/lib/api/members";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WhatsAppNotifications() {
  const [sendMode, setSendMode] = useState<"single" | "bulk">("single");
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [messagesPage, setMessagesPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    templateId: "",
    recipientId: "",
    recipientMobile: "",
    message: "",
    pdf: "",
    img1: "",
    img2: "",
    variables: {} as Record<string, string>,
    scheduleon: "",
  });

  const [bulkFormData, setBulkFormData] = useState({
    templateId: "",
    recipientIds: [] as string[],
    memberTypes: [] as string[],
    memberStatuses: [] as string[],
    message: "",
    pdf: "",
    img1: "",
    img2: "",
    variables: {} as Record<string, string>,
    scheduleon: "",
  });

  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templatesData } = useQuery({
    queryKey: ["whatsapp-templates", "active"],
    queryFn: () => whatsAppApi.getTemplates({ status: "active", limit: 100 }),
  });

  // Fetch members for bulk selection
  const { data: membersData } = useQuery({
    queryKey: ["members", "all"],
    queryFn: () => membersApi.getMembers({ limit: 1000 }),
    enabled: sendMode === "bulk",
  });

  // Fetch sent messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["whatsapp-messages", messagesPage, statusFilter],
    queryFn: () =>
      whatsAppApi.getMessages({
        page: messagesPage,
        limit: 20,
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Fetch statistics
  const { data: statisticsData } = useQuery({
    queryKey: ["whatsapp-statistics"],
    queryFn: () => whatsAppApi.getStatistics(),
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: whatsAppApi.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-statistics"] });
      toast.success("Message sent successfully");
      setIsSendDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send message");
    },
  });

  // Send bulk messages mutation
  const sendBulkMutation = useMutation({
    mutationFn: whatsAppApi.sendBulkMessages,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-messages"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-statistics"] });
      toast.success(
        `Messages processed: ${data.data.success.length} sent, ${data.data.failed.length} failed`
      );
      setIsSendDialogOpen(false);
      resetBulkForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send bulk messages");
    },
  });

  const resetForm = () => {
    setFormData({
      templateId: "",
      recipientId: "",
      recipientMobile: "",
      message: "",
      pdf: "",
      img1: "",
      img2: "",
      variables: {},
      scheduleon: "",
    });
  };

  const resetBulkForm = () => {
    setBulkFormData({
      templateId: "",
      recipientIds: [],
      memberTypes: [],
      memberStatuses: [],
      message: "",
      pdf: "",
      img1: "",
      img2: "",
      variables: {},
      scheduleon: "",
    });
    setSelectedRecipients([]);
  };

  const handleTemplateChange = (templateId: string, isBulk = false) => {
    const template = templatesData?.data.find((t) => t._id === templateId);
    if (template) {
      if (isBulk) {
        setBulkFormData({
          ...bulkFormData,
          templateId,
          message: template.message,
          pdf: template.pdf || "",
          img1: template.img1 || "",
          img2: template.img2 || "",
        });
      } else {
        setFormData({
          ...formData,
          templateId,
          message: template.message,
          pdf: template.pdf || "",
          img1: template.img1 || "",
          img2: template.img2 || "",
        });
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sendMode === "single") {
      sendMessageMutation.mutate(formData);
    } else {
      sendBulkMutation.mutate({
        ...bulkFormData,
        recipientIds: selectedRecipients.length > 0 ? selectedRecipients : undefined,
      });
    }
  };

  const templates = templatesData?.data || [];
  const members = membersData?.data || [];
  const messages = messagesData?.data || [];
  const pagination = messagesData?.pagination;
  const statistics = statisticsData?.data;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <MessageSquare className="h-7 w-7 text-primary" />
              WhatsApp Notifications
            </h1>
            <p className="page-description">
              Send WhatsApp messages to members using templates
            </p>
          </div>
          <Button onClick={() => setIsSendDialogOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalMessages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {statistics.sentMessages}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {statistics.failedMessages}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {statistics.pendingMessages}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Cost
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{statistics.totalCost.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalRecipients}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Messages History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Message History</CardTitle>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setMessagesPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {messagesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No messages found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((message) => (
                    <TableRow key={message._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {message.recipientName || message.recipientMobile}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {message.recipientMobile}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {message.message.substring(0, 50)}...
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            message.status === "sent"
                              ? "default"
                              : message.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {message.status === "sent" && (
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                          )}
                          {message.status === "failed" && (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {message.status === "pending" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {message.status}
                        </Badge>
                        {message.errorMessage && (
                          <p className="text-xs text-destructive mt-1">
                            {message.errorMessage}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>₹{message.msgCost.toFixed(2)}</TableCell>
                      <TableCell>
                        {message.sentAt
                          ? new Date(message.sentAt).toLocaleString()
                          : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems
                    )}{" "}
                    of {pagination.totalItems} messages
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPrevPage || messagesLoading}
                      onClick={() => setMessagesPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage || messagesLoading}
                      onClick={() => setMessagesPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Send Message Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Message</DialogTitle>
            <DialogDescription>
              Send a WhatsApp message to single or multiple recipients
            </DialogDescription>
          </DialogHeader>
          <Tabs value={sendMode} onValueChange={(v) => setSendMode(v as "single" | "bulk")}>
            <TabsList>
              <TabsTrigger value="single">Single Recipient</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Send</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="single" className="space-y-4">
                <div>
                  <Label htmlFor="template">Template (Optional)</Label>
                  <Select
                    value={formData.templateId || "none"}
                    onValueChange={(value) => handleTemplateChange(value === "none" ? "" : value, false)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None - Custom Message</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {template.name} - {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recipientMobile">Mobile Number *</Label>
                  <Input
                    id="recipientMobile"
                    value={formData.recipientMobile}
                    onChange={(e) =>
                      setFormData({ ...formData, recipientMobile: e.target.value })
                    }
                    required
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    placeholder="Enter your message"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="pdf">PDF URL</Label>
                    <Input
                      id="pdf"
                      value={formData.pdf}
                      onChange={(e) => setFormData({ ...formData, pdf: e.target.value })}
                      placeholder="http://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="img1">Image 1 URL</Label>
                    <Input
                      id="img1"
                      value={formData.img1}
                      onChange={(e) => setFormData({ ...formData, img1: e.target.value })}
                      placeholder="http://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="img2">Image 2 URL</Label>
                    <Input
                      id="img2"
                      value={formData.img2}
                      onChange={(e) => setFormData({ ...formData, img2: e.target.value })}
                      placeholder="http://..."
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4">
                <div>
                  <Label htmlFor="bulkTemplate">Template (Optional)</Label>
                  <Select
                    value={bulkFormData.templateId || "none"}
                    onValueChange={(value) => handleTemplateChange(value === "none" ? "" : value, true)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None - Custom Message</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {template.name} - {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Filter by Member Type</Label>
                  <div className="flex gap-4 mt-2">
                    {["donor", "volunteer", "beneficiary", "core"].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={bulkFormData.memberTypes.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBulkFormData({
                                ...bulkFormData,
                                memberTypes: [...bulkFormData.memberTypes, type],
                              });
                            } else {
                              setBulkFormData({
                                ...bulkFormData,
                                memberTypes: bulkFormData.memberTypes.filter((t) => t !== type),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Filter by Status</Label>
                  <div className="flex gap-4 mt-2">
                    {["active", "inactive"].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${status}`}
                          checked={bulkFormData.memberStatuses.includes(status)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setBulkFormData({
                                ...bulkFormData,
                                memberStatuses: [...bulkFormData.memberStatuses, status],
                              });
                            } else {
                              setBulkFormData({
                                ...bulkFormData,
                                memberStatuses: bulkFormData.memberStatuses.filter(
                                  (s) => s !== status
                                ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`status-${status}`} className="text-sm font-normal">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="bulkMessage">Message *</Label>
                  <Textarea
                    id="bulkMessage"
                    value={bulkFormData.message}
                    onChange={(e) =>
                      setBulkFormData({ ...bulkFormData, message: e.target.value })
                    }
                    required
                    rows={6}
                    placeholder="Enter your message. Use {{name}} for member name."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="bulkPdf">PDF URL</Label>
                    <Input
                      id="bulkPdf"
                      value={bulkFormData.pdf}
                      onChange={(e) => setBulkFormData({ ...bulkFormData, pdf: e.target.value })}
                      placeholder="http://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulkImg1">Image 1 URL</Label>
                    <Input
                      id="bulkImg1"
                      value={bulkFormData.img1}
                      onChange={(e) =>
                        setBulkFormData({ ...bulkFormData, img1: e.target.value })
                      }
                      placeholder="http://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulkImg2">Image 2 URL</Label>
                    <Input
                      id="bulkImg2"
                      value={bulkFormData.img2}
                      onChange={(e) =>
                        setBulkFormData({ ...bulkFormData, img2: e.target.value })
                      }
                      placeholder="http://..."
                    />
                  </div>
                </div>
              </TabsContent>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsSendDialogOpen(false);
                    resetForm();
                    resetBulkForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendMessageMutation.isPending || sendBulkMutation.isPending}
                >
                  {(sendMessageMutation.isPending || sendBulkMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </DialogFooter>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
