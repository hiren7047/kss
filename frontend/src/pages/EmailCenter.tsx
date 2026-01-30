import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Plus,
  Search,
  Loader2,
  Edit,
  Trash2,
  Send,
  Filter,
  Users,
  Activity,
} from "lucide-react";
import { emailApi, EmailTemplate, NewsletterSubscriber, EmailLog } from "@/lib/api/email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function EmailCenter() {
  const queryClient = useQueryClient();

  // Shared state
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateType, setTemplateType] = useState<string>("all");
  const [templateStatus, setTemplateStatus] = useState<string>("all");
  const [templatePage, setTemplatePage] = useState(1);

  const [subscriberSearch, setSubscriberSearch] = useState("");
  const [subscriberStatus, setSubscriberStatus] = useState<string>("subscribed");
  const [subscriberLanguage, setSubscriberLanguage] = useState<string>("all");
  const [subscriberPage, setSubscriberPage] = useState(1);

  const [logsStatus, setLogsStatus] = useState<string>("all");
  const [logsTemplateCode, setLogsTemplateCode] = useState("");
  const [logsEmail, setLogsEmail] = useState("");
  const [logsPage, setLogsPage] = useState(1);

  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    code: "",
    type: "newsletter" as "newsletter" | "transactional",
    subject: "",
    bodyHtml: "",
    bodyText: "",
    variablesText: "",
    status: "active" as "active" | "inactive",
  });

  const [sendTemplateId, setSendTemplateId] = useState<string>("");
  const [sendLanguage, setSendLanguage] = useState<string>("all");
  const [testEmail, setTestEmail] = useState("");
  const [onlySubscribed, setOnlySubscribed] = useState(true);

  // Templates query
  const {
    data: templatesData,
    isLoading: templatesLoading,
  } = useQuery({
    queryKey: ["email-templates", templatePage, templateSearch, templateType, templateStatus],
    queryFn: () =>
      emailApi.getTemplates({
        page: templatePage,
        limit: 10,
        search: templateSearch || undefined,
        type: templateType !== "all" ? templateType : undefined,
        status: templateStatus !== "all" ? templateStatus : undefined,
      }),
  });

  // Subscribers query
  const {
    data: subscribersData,
    isLoading: subscribersLoading,
  } = useQuery({
    queryKey: [
      "newsletter-subscribers",
      subscriberPage,
      subscriberSearch,
      subscriberStatus,
      subscriberLanguage,
    ],
    queryFn: () =>
      emailApi.getSubscribers({
        page: subscriberPage,
        limit: 10,
        search: subscriberSearch || undefined,
        isSubscribed:
          subscriberStatus === "all" ? undefined : subscriberStatus === "subscribed" ? "true" : "false",
        language: subscriberLanguage !== "all" ? subscriberLanguage : undefined,
      }),
  });

  // Logs query
  const {
    data: logsData,
    isLoading: logsLoading,
  } = useQuery({
    queryKey: ["email-logs", logsPage, logsStatus, logsTemplateCode, logsEmail],
    queryFn: () =>
      emailApi.getEmailLogs({
        page: logsPage,
        limit: 10,
        status: logsStatus !== "all" ? logsStatus : undefined,
        templateCode: logsTemplateCode || undefined,
        email: logsEmail || undefined,
      }),
  });

  const createTemplateMutation = useMutation({
    mutationFn: emailApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Email template created successfully");
      setIsTemplateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create template");
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => emailApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Email template updated successfully");
      setIsTemplateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update template");
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: emailApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email-templates"] });
      toast.success("Email template deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete template");
    },
  });

  const sendNewsletterMutation = useMutation({
    mutationFn: emailApi.sendNewsletter,
    onSuccess: (resp) => {
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
      toast.success(resp.message || "Newsletter sent");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send newsletter");
    },
  });

  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      code: "",
      type: "newsletter",
      subject: "",
      bodyHtml: "",
      bodyText: "",
      variablesText: "",
      status: "active",
    });
  };

  const openCreateTemplate = () => {
    resetTemplateForm();
    setIsTemplateDialogOpen(true);
  };

  const openEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      code: template.code,
      type: template.type,
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      bodyText: template.bodyText || "",
      variablesText: (template.variables || []).join(","),
      status: template.status,
    });
    setIsTemplateDialogOpen(true);
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const variables = templateForm.variablesText
      .split(",")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate._id,
        data: {
          name: templateForm.name,
          subject: templateForm.subject,
          bodyHtml: templateForm.bodyHtml,
          bodyText: templateForm.bodyText || undefined,
          variables,
          status: templateForm.status,
        },
      });
    } else {
      createTemplateMutation.mutate({
        name: templateForm.name,
        code: templateForm.code,
        type: templateForm.type,
        subject: templateForm.subject,
        bodyHtml: templateForm.bodyHtml,
        bodyText: templateForm.bodyText || undefined,
        variables,
        status: templateForm.status,
      });
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const templates = templatesData?.data || [];
  const templatesPagination = templatesData?.pagination;

  const subscribers = subscribersData?.data || [];
  const subscribersPagination = subscribersData?.pagination;

  const logs = logsData?.data || [];
  const logsPagination = logsData?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Mail className="h-7 w-7 text-primary" />
              Email & Newsletter Center
            </h1>
            <p className="page-description">
              Manage email templates, newsletter subscribers, and send bulk newsletters from one place.
            </p>
          </div>
          <Button onClick={openCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <Tabs defaultValue="templates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="send">Send Newsletter</TabsTrigger>
          <TabsTrigger value="logs">Email Logs</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, code or subject..."
                    value={templateSearch}
                    onChange={(e) => {
                      setTemplateSearch(e.target.value);
                      setTemplatePage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={templateType}
                  onValueChange={(value) => {
                    setTemplateType(value);
                    setTemplatePage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={templateStatus}
                  onValueChange={(value) => {
                    setTemplateStatus(value);
                    setTemplatePage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                {templatesLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : templates.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <Mail className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No templates found</p>
                    <p className="text-sm">Create your first email template to get started.</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Usage</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {templates.map((template) => (
                          <TableRow key={template._id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono text-xs">
                                {template.code}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={template.type === "newsletter" ? "default" : "secondary"}
                              >
                                {template.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {template.subject}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  template.status === "active" ? "outline" : "secondary"
                                }
                              >
                                {template.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">
                                {template.usageCount}{" "}
                                <span className="text-muted-foreground">sends</span>
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSendTemplateId(template._id);
                                  }}
                                  title="Use in Send tab"
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditTemplate(template)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTemplate(template._id)}
                                  disabled={deleteTemplateMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {templatesPagination && templatesPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing{" "}
                          {(templatesPagination.currentPage - 1) *
                            templatesPagination.itemsPerPage +
                            1}
                          -
                          {Math.min(
                            templatesPagination.currentPage *
                              templatesPagination.itemsPerPage,
                            templatesPagination.totalItems
                          )}{" "}
                          of {templatesPagination.totalItems} templates
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              !templatesPagination.hasPrevPage || templatesLoading
                            }
                            onClick={() =>
                              setTemplatePage((p) => Math.max(1, p - 1))
                            }
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              !templatesPagination.hasNextPage || templatesLoading
                            }
                            onClick={() => setTemplatePage((p) => p + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Newsletter Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or name..."
                    value={subscriberSearch}
                    onChange={(e) => {
                      setSubscriberSearch(e.target.value);
                      setSubscriberPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={subscriberStatus}
                  onValueChange={(value) => {
                    setSubscriberStatus(value);
                    setSubscriberPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={subscriberLanguage}
                  onValueChange={(value) => {
                    setSubscriberLanguage(value);
                    setSubscriberPage(1);
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Lang</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="gu">Gujarati</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                {subscribersLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No subscribers found</p>
                    <p className="text-sm">
                      Subscribers who join from mainsite newsletter form will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Language</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Subscribed At</TableHead>
                          <TableHead>Unsubscribed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscribers.map((sub: NewsletterSubscriber) => (
                          <TableRow key={sub._id}>
                            <TableCell className="font-mono text-xs">{sub.email}</TableCell>
                            <TableCell>{sub.name || "-"}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="uppercase text-xs">
                                {sub.language}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={sub.isSubscribed ? "default" : "secondary"}
                              >
                                {sub.isSubscribed ? "Subscribed" : "Unsubscribed"}
                              </Badge>
                            </TableCell>
                            <TableCell className="capitalize text-xs text-muted-foreground">
                              {sub.source}
                            </TableCell>
                            <TableCell className="text-xs">
                              {sub.subscribedAt
                                ? new Date(sub.subscribedAt).toLocaleString()
                                : "-"}
                            </TableCell>
                            <TableCell className="text-xs">
                              {sub.unsubscribedAt
                                ? new Date(sub.unsubscribedAt).toLocaleString()
                                : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {subscribersPagination && subscribersPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing{" "}
                          {(subscribersPagination.currentPage - 1) *
                            subscribersPagination.itemsPerPage +
                            1}
                          -
                          {Math.min(
                            subscribersPagination.currentPage *
                              subscribersPagination.itemsPerPage,
                            subscribersPagination.totalItems
                          )}{" "}
                          of {subscribersPagination.totalItems} subscribers
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              !subscribersPagination.hasPrevPage || subscribersLoading
                            }
                            onClick={() =>
                              setSubscriberPage((p) => Math.max(1, p - 1))
                            }
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              !subscribersPagination.hasNextPage || subscribersLoading
                            }
                            onClick={() => setSubscriberPage((p) => p + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Send Newsletter Tab */}
        <TabsContent value="send">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  Send Newsletter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Template</Label>
                  <Select
                    value={sendTemplateId}
                    onValueChange={(value) => setSendTemplateId(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a newsletter template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates
                        .filter((t) => t.type === "newsletter" && t.status === "active")
                        .map((t) => (
                          <SelectItem key={t._id} value={t._id}>
                            {t.name} ({t.code})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language Filter</Label>
                  <Select
                    value={sendLanguage}
                    onValueChange={(value) => setSendLanguage(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Languages</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="gu">Gujarati</SelectItem>
                      <SelectItem value="hi">Hindi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Email (optional)</Label>
                  <Input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    If you enter a test email, newsletter will be sent only to that address.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="onlySubscribed"
                    type="checkbox"
                    checked={onlySubscribed}
                    onChange={(e) => setOnlySubscribed(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="onlySubscribed" className="text-sm">
                    Send only to currently subscribed users
                  </Label>
                </div>

                <Button
                  className="w-full"
                  disabled={
                    !sendTemplateId || sendNewsletterMutation.isPending
                  }
                  onClick={() => {
                    const selectedTemplate = templates.find(
                      (t) => t._id === sendTemplateId
                    );
                    if (!selectedTemplate) {
                      toast.error("Please select a template");
                      return;
                    }
                    sendNewsletterMutation.mutate({
                      templateId: sendTemplateId,
                      language:
                        sendLanguage === "all"
                          ? undefined
                          : (sendLanguage as "en" | "gu" | "hi"),
                      onlySubscribed,
                      testEmail: testEmail || undefined,
                    });
                  }}
                >
                  {sendNewsletterMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Send {testEmail ? "Test Email" : "Newsletter"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Tips for Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Use variables like {"{{name}}"} and {"{{unsubscribeUrl}}"} in your HTML
                  body to personalize emails and include unsubscribe link.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Ensure your template includes a clear subject line and call to
                    action.
                  </li>
                  <li>
                    For newsletters, always include {"{{unsubscribeUrl}}"} so
                    subscribers can opt out easily.
                  </li>
                  <li>
                    Use the <strong>Test Email</strong> option before sending bulk
                    newsletters.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Email Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4 items-center">
                <Select
                  value={logsStatus}
                  onValueChange={(value) => {
                    setLogsStatus(value);
                    setLogsPage(1);
                  }}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Filter by template code..."
                  value={logsTemplateCode}
                  onChange={(e) => {
                    setLogsTemplateCode(e.target.value.toUpperCase());
                    setLogsPage(1);
                  }}
                  className="max-w-[200px]"
                />
                <Input
                  placeholder="Filter by recipient email..."
                  value={logsEmail}
                  onChange={(e) => {
                    setLogsEmail(e.target.value);
                    setLogsPage(1);
                  }}
                  className="max-w-[240px]"
                />
              </div>

              <div className="border rounded-lg">
                {logsLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No email logs yet</p>
                    <p className="text-sm">
                      When emails are sent using templates, they will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sent At</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Template</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Error</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log: EmailLog) => (
                          <TableRow key={log._id}>
                            <TableCell className="text-xs">
                              {log.sentAt
                                ? new Date(log.sentAt).toLocaleString()
                                : "-"}
                            </TableCell>
                            <TableCell className="font-mono text-xs max-w-[220px] truncate">
                              {log.to}
                            </TableCell>
                            <TableCell>
                              {log.templateCode ? (
                                <Badge variant="outline" className="font-mono text-xs">
                                  {log.templateCode}
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {log.subject}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  log.status === "sent" ? "default" : "destructive"
                                }
                              >
                                {log.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs max-w-xs truncate text-destructive">
                              {log.errorMessage || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {logsPagination && logsPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="text-sm text-muted-foreground">
                          Showing{" "}
                          {(logsPagination.currentPage - 1) *
                            logsPagination.itemsPerPage +
                            1}
                          -
                          {Math.min(
                            logsPagination.currentPage *
                              logsPagination.itemsPerPage,
                            logsPagination.totalItems
                          )}{" "}
                          of {logsPagination.totalItems} logs
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!logsPagination.hasPrevPage || logsLoading}
                            onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                          >
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!logsPagination.hasNextPage || logsLoading}
                            onClick={() => setLogsPage((p) => p + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create / Edit Template Dialog */}
      <Dialog
        open={isTemplateDialogOpen}
        onOpenChange={(open) => {
          setIsTemplateDialogOpen(open);
          if (!open) resetTemplateForm();
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Email Template" : "Create Email Template"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTemplateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={templateForm.name}
                  onChange={(e) =>
                    setTemplateForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  placeholder="Monthly Newsletter"
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={templateForm.code}
                  onChange={(e) =>
                    setTemplateForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  required
                  placeholder="NEWSLETTER_MONTHLY"
                  disabled={!!editingTemplate}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={templateForm.type}
                  onValueChange={(value: "newsletter" | "transactional") =>
                    setTemplateForm((f) => ({ ...f, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={templateForm.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setTemplateForm((f) => ({ ...f, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Input
                value={templateForm.subject}
                onChange={(e) =>
                  setTemplateForm((f) => ({ ...f, subject: e.target.value }))
                }
                required
                placeholder="Thank you for supporting Krushna Sada Sahayate"
              />
            </div>

            <div className="space-y-2">
              <Label>HTML Body *</Label>
              <Textarea
                value={templateForm.bodyHtml}
                onChange={(e) =>
                  setTemplateForm((f) => ({ ...f, bodyHtml: e.target.value }))
                }
                required
                rows={10}
                placeholder={`<p>Jai Shri Krishna {{name}},</p>
<p>Thank you for being part of our Seva.</p>
<p><a href="{{unsubscribeUrl}}">Unsubscribe</a> if you no longer wish to receive emails.</p>`}
              />
              <p className="text-xs text-muted-foreground">
                Use {"{{name}}"} and {"{{unsubscribeUrl}}"} variables for personalization.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Plain Text Body (optional)</Label>
              <Textarea
                value={templateForm.bodyText}
                onChange={(e) =>
                  setTemplateForm((f) => ({ ...f, bodyText: e.target.value }))
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Variables (comma separated)</Label>
              <Input
                value={templateForm.variablesText}
                onChange={(e) =>
                  setTemplateForm((f) => ({ ...f, variablesText: e.target.value }))
                }
                placeholder="name, unsubscribeUrl, language"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsTemplateDialogOpen(false);
                  resetTemplateForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createTemplateMutation.isPending || updateTemplateMutation.isPending
                }
              >
                {(createTemplateMutation.isPending ||
                  updateTemplateMutation.isPending) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

