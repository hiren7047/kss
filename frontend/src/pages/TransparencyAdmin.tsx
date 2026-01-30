import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Eye, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Receipt, 
  FileText,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { api } from "@/lib/api";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function TransparencyAdmin() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch transparency summary
  const { 
    data: summaryData, 
    isLoading: summaryLoading, 
    isError: summaryError,
    refetch: refetchSummary 
  } = useQuery({
    queryKey: ["transparencySummary"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/public/transparency/summary`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  // Fetch public donations
  const { 
    data: donationsData, 
    isLoading: donationsLoading,
    refetch: refetchDonations 
  } = useQuery({
    queryKey: ["transparencyDonations"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/public/transparency/donations?limit=10`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  // Fetch public expenses
  const { 
    data: expensesData, 
    isLoading: expensesLoading,
    refetch: refetchExpenses 
  } = useQuery({
    queryKey: ["transparencyExpenses"],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/public/transparency/expenses?limit=10`);
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchSummary(),
      refetchDonations(),
      refetchExpenses(),
    ]);
    setRefreshing(false);
  };

  const wallet = summaryData?.data?.wallet;
  const statistics = summaryData?.data?.statistics;
  const donations = donationsData?.data || [];
  const expenses = expensesData?.data || [];

  const isLoading = summaryLoading || donationsLoading || expensesLoading;

  // Get public transparency URL
  const publicTransparencyUrl = `${window.location.origin.replace('8080', '5173')}/transparency`;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <Eye className="h-7 w-7 text-primary" />
            Transparency Management
          </h1>
          <p className="page-description">
            View and manage public transparency data
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (summaryError) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <Eye className="h-7 w-7 text-primary" />
            Transparency Management
          </h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-foreground/60">Failed to load transparency data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Eye className="h-7 w-7 text-primary" />
              Transparency Management
            </h1>
            <p className="page-description">
              View what the public sees on the transparency page
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => window.open(publicTransparencyUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Public Page
            </Button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground mb-1">
                Public Transparency Page
              </p>
              <p className="text-sm text-foreground/70">
                This page shows exactly what visitors see on the public transparency page. 
                Only completed donations and approved expenses are displayed. 
                Anonymous donations are shown as "Anonymous Donor".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Available Balance"
          value={formatCurrency(wallet?.availableBalance || 0)}
          icon={Wallet}
          trend="neutral"
          description="Current NGO balance"
        />
        <StatsCard
          title="Total Donations"
          value={formatCurrency(wallet?.totalDonations || 0)}
          icon={TrendingUp}
          trend="up"
          description="All time donations"
        />
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(wallet?.totalExpenses || 0)}
          icon={TrendingDown}
          trend="down"
          description="All approved expenses"
        />
        <StatsCard
          title="Restricted Funds"
          value={formatCurrency(wallet?.restrictedFunds || 0)}
          icon={FileText}
          trend="neutral"
          description="Funds set aside"
        />
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-primary" />
                Donation Statistics
              </CardTitle>
              <CardDescription>
                Breakdown by purpose and payment mode
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70 mb-2">Total Donations</p>
                <p className="text-2xl font-bold text-primary">
                  {statistics.donations.totalCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/70 mb-2">By Purpose</p>
                <div className="space-y-2">
                  {Object.entries(statistics.donations.byPurpose || {}).map(([purpose, amount]: [string, any]) => (
                    <div key={purpose} className="flex justify-between items-center">
                      <Badge variant="outline">{purpose}</Badge>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Expense Statistics
              </CardTitle>
              <CardDescription>
                Breakdown by category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-foreground/70 mb-2">Total Expenses</p>
                <p className="text-2xl font-bold text-orange-600">
                  {statistics.expenses.totalCount}
                </p>
              </div>
              <div>
                <p className="text-sm text-foreground/70 mb-2">By Category</p>
                <div className="space-y-2">
                  {Object.entries(statistics.expenses.byCategory || {}).map(([category, amount]: [string, any]) => (
                    <div key={category} className="flex justify-between items-center">
                      <Badge variant="outline">{category}</Badge>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Recent Donations (Public View)
          </CardTitle>
          <CardDescription>
            Last 10 donations as shown on public transparency page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="text-foreground/60 text-center py-8">No donations yet</p>
          ) : (
            <div className="space-y-3">
              {donations.map((donation: any) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{donation.donorName}</p>
                    <p className="text-sm text-foreground/60">
                      {donation.purpose} • {donation.paymentMode} • {formatDate(donation.date)}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">
                    {formatCurrency(donation.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Recent Expenses (Public View)
          </CardTitle>
          <CardDescription>
            Last 10 approved expenses as shown on public transparency page
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-foreground/60 text-center py-8">No expenses yet</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense: any) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{expense.title}</p>
                    <p className="text-sm text-foreground/60">
                      {expense.category} • {expense.approvedBy} • {formatDate(expense.date)}
                    </p>
                  </div>
                  <p className="font-bold text-orange-600">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      {wallet?.lastUpdated && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-foreground/60">
              Last updated: {formatDate(wallet.lastUpdated)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
