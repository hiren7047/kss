import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Heart,
  Wallet,
  Calendar,
  UserCheck,
  TrendingUp,
  Clock,
  AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DonationChart } from "@/components/dashboard/DonationChart";
import { MemberGrowthChart } from "@/components/dashboard/MemberGrowthChart";
import { RecentDonations } from "@/components/dashboard/RecentDonations";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { membersApi } from "@/lib/api/members";
import { donationsApi } from "@/lib/api/donations";
import { expensesApi } from "@/lib/api/expenses";
import { eventsApi } from "@/lib/api/events";
import { walletApi } from "@/lib/api/wallet";
import { formatDistanceToNow } from "date-fns";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Dashboard() {
  // Fetch wallet summary
  const { data: walletData } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => walletApi.getWalletSummary(),
  });

  // Fetch members count
  const { data: membersData } = useQuery({
    queryKey: ["members", "count"],
    queryFn: () => membersApi.getMembers({ limit: 1 }),
  });

  // Fetch donations summary
  const { data: donationsData } = useQuery({
    queryKey: ["donations", "summary"],
    queryFn: () => donationsApi.getDonationReport(),
  });

  // Fetch this month donations
  const { data: thisMonthDonations } = useQuery({
    queryKey: ["donations", "this-month"],
    queryFn: () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return donationsApi.getDonationReport({
        startDate: startOfMonth.toISOString(),
        endDate: now.toISOString(),
      });
    },
  });

  // Fetch expenses for pending count
  const { data: expensesData } = useQuery({
    queryKey: ["expenses", "pending"],
    queryFn: () => expensesApi.getExpenses({ approvalStatus: "pending", limit: 1 }),
  });

  // Fetch events
  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.getEvents({ limit: 100 }),
  });

  // Calculate stats
  const totalMembers = membersData?.pagination?.totalItems || 0;
  const totalDonations = donationsData?.data?.summary?.totalAmount || 0;
  const thisMonthTotal = thisMonthDonations?.data?.summary?.totalAmount || 0;
  const availableBalance = walletData?.data?.availableBalance || 0;
  const pendingExpenses = expensesData?.pagination?.totalItems || 0;

  // Calculate active volunteers (members with type volunteer)
  const activeVolunteers = membersData?.data?.filter(
    (m) => m.memberType === "volunteer" && m.status === "active"
  ).length || 0;

  // Calculate active and upcoming events
  const activeEvents = eventsData?.data?.filter((e) => e.status === "ongoing").length || 0;
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingEvents = eventsData?.data?.filter(
    (e) => new Date(e.startDate) > now && new Date(e.startDate) <= thirtyDaysFromNow
  ).length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Welcome back! Here's an overview of KSS activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={totalMembers.toLocaleString()}
          subtitle="Active community members"
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Total Donations"
          value={formatCurrency(totalDonations)}
          subtitle="All time contributions"
          icon={Heart}
          variant="success"
        />
        <StatsCard
          title="This Month"
          value={formatCurrency(thisMonthTotal)}
          subtitle={`${new Date().toLocaleString("default", { month: "long" })} donations`}
          icon={TrendingUp}
          variant="info"
        />
        <StatsCard
          title="Available Balance"
          value={formatCurrency(availableBalance)}
          subtitle="NGO wallet balance"
          icon={Wallet}
          variant="warning"
        />
      </div>

      {/* Second Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Volunteers"
          value={activeVolunteers}
          subtitle="Currently active"
          icon={UserCheck}
          variant="primary"
        />
        <StatsCard
          title="Active Events"
          value={activeEvents}
          subtitle="Ongoing activities"
          icon={Calendar}
          variant="info"
        />
        <StatsCard
          title="Upcoming Events"
          value={upcomingEvents}
          subtitle="In next 30 days"
          icon={Clock}
          variant="success"
        />
        <StatsCard
          title="Pending Requests"
          value={pendingExpenses}
          subtitle="Awaiting approval"
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DonationChart />
        <MemberGrowthChart />
      </div>

      {/* Recent Activity Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentDonations />
        <UpcomingEvents />
      </div>
    </div>
  );
}
