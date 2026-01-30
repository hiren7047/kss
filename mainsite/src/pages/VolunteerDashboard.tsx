import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  LogOut,
  Calendar,
  Award,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Eye,
  Loader2,
  User,
  Activity,
  Trophy,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { volunteerApi } from '@/lib/volunteerApi';
import { publicApi } from '@/lib/api';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const langClass = language === 'gu' ? 'lang-gu' : language === 'hi' ? 'lang-hi' : '';
  
  const [volunteer, setVolunteer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isWorkDialogOpen, setIsWorkDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [workFormData, setWorkFormData] = useState({
    eventId: '',
    workTitle: '',
    workDescription: '',
    workType: 'task_completion',
  });
  const [expenseFormData, setExpenseFormData] = useState({
    title: '',
    category: '',
    amount: '',
    eventId: '',
    billUrl: '',
  });

  // Check authentication
  useEffect(() => {
    const storedVolunteer = localStorage.getItem('volunteer');
    const token = localStorage.getItem('volunteerAccessToken');
    
    if (!storedVolunteer || !token) {
      navigate('/volunteer/login', { replace: true });
      return;
    }

    try {
      setVolunteer(JSON.parse(storedVolunteer));
    } catch (error) {
      navigate('/volunteer/login', { replace: true });
    }
  }, [navigate]);

  // Fetch volunteer profile
  const { data: profileData } = useQuery({
    queryKey: ['volunteer-profile'],
    queryFn: () => volunteerApi.getProfile(),
    enabled: !!volunteer,
  });

  // Fetch activity summary
  const { data: activitySummary } = useQuery({
    queryKey: ['volunteer-activity-summary'],
    queryFn: () => volunteerApi.getActivitySummary(),
    enabled: !!volunteer,
  });

  // Fetch activities
  const { data: activitiesData } = useQuery({
    queryKey: ['volunteer-activities'],
    queryFn: () => volunteerApi.getActivities({ page: 1, limit: 10 }),
    enabled: !!volunteer,
  });

  // Fetch work submissions
  const { data: workData } = useQuery({
    queryKey: ['volunteer-work-submissions'],
    queryFn: () => volunteerApi.getWorkSubmissions({ page: 1, limit: 10 }),
    enabled: !!volunteer,
  });

  // Fetch expenses
  const { data: expensesData } = useQuery({
    queryKey: ['volunteer-expenses'],
    queryFn: () => volunteerApi.getMyExpenses({ page: 1, limit: 10 }),
    enabled: !!volunteer,
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['volunteer-stats'],
    queryFn: () => volunteerApi.getMyStats(),
    enabled: !!volunteer,
  });

  // Fetch leaderboard
  const { data: leaderboardData } = useQuery({
    queryKey: ['volunteer-leaderboard'],
    queryFn: () => volunteerApi.getLeaderboard({ page: 1, limit: 20 }),
    enabled: !!volunteer,
  });

  // Fetch events for work submission
  const { data: eventsData } = useQuery({
    queryKey: ['public-events'],
    queryFn: () => publicApi.getEvents({ limit: 100 }),
  });

  const handleLogout = () => {
    localStorage.removeItem('volunteerAccessToken');
    localStorage.removeItem('volunteerRefreshToken');
    localStorage.removeItem('volunteer');
    toast.success('Logged out successfully');
    navigate('/volunteer/login');
  };

  const handleSubmitWork = async () => {
    if (!workFormData.eventId || !workFormData.workTitle || !workFormData.workDescription) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await volunteerApi.submitWork({
        eventId: workFormData.eventId,
        workTitle: workFormData.workTitle,
        workDescription: workFormData.workDescription,
        workType: workFormData.workType,
      });
      toast.success('Work submitted successfully!');
      setIsWorkDialogOpen(false);
      setWorkFormData({ eventId: '', workTitle: '', workDescription: '', workType: 'task_completion' });
      // Refetch work submissions
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit work');
    }
  };

  const handleSubmitExpense = async () => {
    if (!expenseFormData.title || !expenseFormData.category || !expenseFormData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await volunteerApi.submitExpense({
        title: expenseFormData.title,
        category: expenseFormData.category,
        amount: parseFloat(expenseFormData.amount),
        eventId: expenseFormData.eventId || undefined,
        billUrl: expenseFormData.billUrl || undefined,
      });
      toast.success('Expense submitted successfully! Waiting for admin approval.');
      setIsExpenseDialogOpen(false);
      setExpenseFormData({ title: '', category: '', amount: '', eventId: '', billUrl: '' });
      // Refetch expenses
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit expense');
    }
  };

  if (!volunteer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activities = activitiesData?.data?.data || [];
  const workSubmissions = workData?.data?.data || [];
  const expenses = expensesData?.data?.data || [];
  const leaderboard = leaderboardData?.data?.data || [];
  const events = eventsData?.data || [];
  const summary = activitySummary?.data;
  const stats = statsData?.data;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${langClass}`}>
                Welcome, {volunteer.name}!
              </h1>
              <p className="text-muted-foreground">
                Registration ID: <span className="font-mono font-semibold">{volunteer.registrationId}</span>
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats?.points || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.verifiedPoints || 0} verified, {stats?.pendingPoints || 0} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rank</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.rank ? `#${stats.rank}` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">Leaderboard position</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.totalEvents || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {summary?.presentEvents || 0} present
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Work Submissions</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary?.workSubmissions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {summary?.approvedWork || 0} approved
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">My Activities</TabsTrigger>
              <TabsTrigger value="work">Work Submissions</TabsTrigger>
              <TabsTrigger value="expenses">My Expenses</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Submit work or expenses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => setIsWorkDialogOpen(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Work
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsExpenseDialogOpen(true)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Submit Expense
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activities.length > 0 ? (
                      <div className="space-y-3">
                        {activities.slice(0, 3).map((activity: any) => (
                          <div key={activity.assignment._id} className="flex items-center gap-3 p-2 rounded border">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                {activity.event?.name || 'Unknown Event'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.assignment.assignedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              activity.assignment.attendance === 'present' ? 'default' :
                              activity.assignment.attendance === 'absent' ? 'destructive' : 'secondary'
                            }>
                              {activity.assignment.attendance}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activities</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Activities</CardTitle>
                  <CardDescription>Events you've participated in</CardDescription>
                </CardHeader>
                <CardContent>
                  {activities.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No activities found</p>
                  ) : (
                    <div className="space-y-4">
                      {activities.map((activity: any) => (
                        <div key={activity.assignment._id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold">{activity.event?.name || 'Unknown Event'}</h3>
                              <p className="text-sm text-muted-foreground">
                                {activity.event?.location && (
                                  <span>{activity.event.location} • </span>
                                )}
                                {new Date(activity.event?.startDate || '').toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={
                              activity.assignment.attendance === 'present' ? 'default' :
                              activity.assignment.attendance === 'absent' ? 'destructive' : 'secondary'
                            }>
                              {activity.assignment.attendance}
                            </Badge>
                          </div>
                          {activity.workSubmissions.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-sm font-medium mb-2">Work Submissions:</p>
                              {activity.workSubmissions.map((work: any, idx: number) => (
                                <div key={idx} className="text-sm text-muted-foreground">
                                  • {work.workTitle} - {work.pointsAwarded} points ({work.status})
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work Submissions Tab */}
            <TabsContent value="work" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Work Submissions</CardTitle>
                    <CardDescription>Your submitted work</CardDescription>
                  </div>
                  <Button onClick={() => setIsWorkDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Work
                  </Button>
                </CardHeader>
                <CardContent>
                  {workSubmissions.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No work submissions yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Work Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {workSubmissions.map((work: any) => (
                          <TableRow key={work._id}>
                            <TableCell className="font-medium">
                              {work.eventId?.name || 'Unknown'}
                            </TableCell>
                            <TableCell>{work.workTitle}</TableCell>
                            <TableCell>
                              <Badge variant={
                                work.status === 'approved' ? 'default' :
                                work.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {work.status === 'submitted' && <Clock className="h-3 w-3 mr-1" />}
                                {work.status === 'approved' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {work.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                                {work.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {work.pointsAwarded > 0 ? (
                                <span className="font-bold text-primary">{work.pointsAwarded}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(work.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Expenses</CardTitle>
                    <CardDescription>Expenses you've submitted</CardDescription>
                  </div>
                  <Button onClick={() => setIsExpenseDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Expense
                  </Button>
                </CardHeader>
                <CardContent>
                  {expenses.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No expenses submitted yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses.map((expense: any) => (
                          <TableRow key={expense._id}>
                            <TableCell className="font-medium">{expense.title}</TableCell>
                            <TableCell>{expense.category}</TableCell>
                            <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={
                                expense.approvalStatus === 'approved' ? 'default' :
                                expense.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {expense.approvalStatus.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(expense.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Leaderboard</CardTitle>
                  <CardDescription>Top volunteers by points</CardDescription>
                </CardHeader>
                <CardContent>
                  {leaderboard.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No leaderboard data available</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Volunteer</TableHead>
                          <TableHead>Total Points</TableHead>
                          <TableHead>Verified Points</TableHead>
                          <TableHead>Pending</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leaderboard.map((entry: any) => (
                          <TableRow
                            key={entry.volunteer._id}
                            className={
                              entry.volunteer._id === volunteer._id ? 'bg-primary/5' : ''
                            }
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {entry.rank <= 3 && (
                                  <Trophy className={`h-4 w-4 ${
                                    entry.rank === 1 ? 'text-yellow-500' :
                                    entry.rank === 2 ? 'text-gray-400' :
                                    'text-orange-500'
                                  }`} />
                                )}
                                <span className="font-bold">#{entry.rank}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {entry.volunteer.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {entry.volunteer.name}
                                    {entry.volunteer._id === volunteer._id && (
                                      <Badge variant="outline" className="ml-2">You</Badge>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {entry.volunteer.registrationId}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-bold text-primary">
                              {entry.points}
                            </TableCell>
                            <TableCell className="text-success">
                              {entry.verifiedPoints}
                            </TableCell>
                            <TableCell className="text-warning">
                              {entry.pendingPoints}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Submit Work Dialog */}
      <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Work</DialogTitle>
            <DialogDescription>
              Submit your work for an event to earn points
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="event">Event *</Label>
              <Select
                value={workFormData.eventId}
                onValueChange={(value) => setWorkFormData({ ...workFormData, eventId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event: any) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.name} - {new Date(event.startDate).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="workTitle">Work Title *</Label>
              <Input
                id="workTitle"
                value={workFormData.workTitle}
                onChange={(e) => setWorkFormData({ ...workFormData, workTitle: e.target.value })}
                placeholder="e.g., Organized food distribution"
              />
            </div>
            <div>
              <Label htmlFor="workDescription">Work Description *</Label>
              <Textarea
                id="workDescription"
                value={workFormData.workDescription}
                onChange={(e) => setWorkFormData({ ...workFormData, workDescription: e.target.value })}
                placeholder="Describe the work you did..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="workType">Work Type</Label>
              <Select
                value={workFormData.workType}
                onValueChange={(value) => setWorkFormData({ ...workFormData, workType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="task_completion">Task Completion</SelectItem>
                  <SelectItem value="event_organization">Event Organization</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWorkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitWork}>
              Submit Work
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Submit Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Expense</DialogTitle>
            <DialogDescription>
              Submit an expense for admin approval
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="expenseTitle">Title *</Label>
              <Input
                id="expenseTitle"
                value={expenseFormData.title}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, title: e.target.value })}
                placeholder="e.g., Transportation for event"
              />
            </div>
            <div>
              <Label htmlFor="expenseCategory">Category *</Label>
              <Input
                id="expenseCategory"
                value={expenseFormData.category}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                placeholder="e.g., Transportation, Food, Materials"
              />
            </div>
            <div>
              <Label htmlFor="expenseAmount">Amount (₹) *</Label>
              <Input
                id="expenseAmount"
                type="number"
                min="0"
                step="0.01"
                value={expenseFormData.amount}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="expenseEvent">Event (Optional)</Label>
              <Select
                value={expenseFormData.eventId}
                onValueChange={(value) => setExpenseFormData({ ...expenseFormData, eventId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {events.map((event: any) => (
                    <SelectItem key={event._id} value={event._id}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="billUrl">Bill URL (Optional)</Label>
              <Input
                id="billUrl"
                type="url"
                value={expenseFormData.billUrl}
                onChange={(e) => setExpenseFormData({ ...expenseFormData, billUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitExpense}>
              Submit Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
