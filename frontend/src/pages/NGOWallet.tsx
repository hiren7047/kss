import { useQuery } from "@tanstack/react-query";
import { PiggyBank, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { walletApi } from "@/lib/api/wallet";
import { donationsApi } from "@/lib/api/donations";
import { expensesApi } from "@/lib/api/expenses";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function NGOWallet() {
  // Fetch wallet summary
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => walletApi.getWalletSummary(),
  });

  // Fetch this month donations
  const { data: thisMonthDonations, isLoading: donationsLoading } = useQuery({
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

  // Fetch this month expenses
  const { data: thisMonthExpenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["expenses", "this-month"],
    queryFn: () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return expensesApi.getExpenseReport({
        startDate: startOfMonth.toISOString(),
        endDate: now.toISOString(),
      });
    },
  });

  const isLoading = walletLoading || donationsLoading || expensesLoading;

  const wallet = walletData?.data;
  const availableBalance = wallet?.availableBalance || 0;
  const totalDonations = wallet?.totalDonations || 0;
  const totalExpenses = wallet?.totalExpenses || 0;
  const restrictedFunds = wallet?.restrictedFunds || 0;

  const thisMonthIncome = thisMonthDonations?.data?.summary?.totalAmount || 0;
  const thisMonthExpense = thisMonthExpenses?.data?.summary?.approvedAmount || 0;

  // Calculate percentages for fund breakdown
  const totalFunds = availableBalance + restrictedFunds;
  const generalFundPercentage =
    totalFunds > 0 ? (availableBalance / totalFunds) * 100 : 0;
  const restrictedFundPercentage =
    totalFunds > 0 ? (restrictedFunds / totalFunds) * 100 : 0;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <PiggyBank className="h-7 w-7 text-warning" />
            NGO Wallet
          </h1>
          <p className="page-description">
            Central financial overview and fund allocation status.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <PiggyBank className="h-7 w-7 text-warning" />
          NGO Wallet
        </h1>
        <p className="page-description">
          Central financial overview and fund allocation status.
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Available Balance"
          value={formatCurrency(availableBalance)}
          subtitle="Total available funds"
          icon={PiggyBank}
          variant="success"
        />
        <StatsCard
          title="This Month Income"
          value={formatCurrency(thisMonthIncome)}
          subtitle="Total donations received"
          icon={TrendingUp}
          variant="info"
        />
        <StatsCard
          title="This Month Expenses"
          value={formatCurrency(thisMonthExpense)}
          subtitle="Total expenses"
          icon={TrendingDown}
          variant="warning"
        />
        <StatsCard
          title="Restricted Funds"
          value={formatCurrency(restrictedFunds)}
          subtitle="Event-specific reserves"
          icon={AlertTriangle}
          variant="primary"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">
              {formatCurrency(totalDonations)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              All-time contributions received
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-warning">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              All-time approved expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fund Breakdown */}
      {totalFunds > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Fund Allocation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Available Funds</span>
                <span className="text-muted-foreground">
                  {formatCurrency(availableBalance)} ({generalFundPercentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={generalFundPercentage} className="h-2" />
            </div>
            {restrictedFunds > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Restricted Funds</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(restrictedFunds)} ({restrictedFundPercentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={restrictedFundPercentage} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
