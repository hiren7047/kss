import { useQuery } from "@tanstack/react-query";
import { BarChart3, PieChart, TrendingUp, Target, DollarSign, Package, Receipt, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { eventsApi, type EventAnalytics as EventAnalyticsType } from "@/lib/api/events";
import { format } from "date-fns";

interface EventAnalyticsProps {
  eventId: string;
}

export function EventAnalytics({ eventId }: EventAnalyticsProps) {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["event-analytics", eventId],
    queryFn: () => eventsApi.getEventAnalytics(eventId),
    enabled: !!eventId,
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (!analyticsData?.data) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const { financialSummary, donationAnalysis, itemAnalysis, expenseAnalysis } = analyticsData.data;

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Achievement</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary.targetAchievement.toFixed(1)}%</div>
            <Progress value={Math.min(100, financialSummary.targetAchievement)} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              ₹{financialSummary.totalDonations.toLocaleString()} of ₹{financialSummary.targetAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Item Completion</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{itemAnalysis.itemCompletionPercentage.toFixed(1)}%</div>
            <Progress value={itemAnalysis.itemCompletionPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {itemAnalysis.totalItemDonated.toLocaleString()} of {itemAnalysis.totalItemTarget.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expense Variance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${expenseAnalysis.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {expenseAnalysis.variance >= 0 ? '+' : ''}{expenseAnalysis.variancePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              ₹{expenseAnalysis.totalActual.toLocaleString()} vs ₹{expenseAnalysis.totalPlanned.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Donation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Donation Analysis
          </CardTitle>
          <CardDescription>Breakdown of donations received</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total Donations</p>
              <p className="text-2xl font-bold mt-1">₹{donationAnalysis.total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{donationAnalysis.count} donations</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">General Donations</p>
              <p className="text-2xl font-bold mt-1">₹{donationAnalysis.generalDonations.total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {donationAnalysis.generalDonations.percentage.toFixed(1)}% of total
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Item Donations</p>
              <p className="text-2xl font-bold mt-1">₹{donationAnalysis.itemDonations.total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {donationAnalysis.itemDonations.percentage.toFixed(1)}% of total
              </p>
            </div>
          </div>

          {/* Payment Mode Distribution */}
          {Object.keys(donationAnalysis.byPaymentMode).length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-3">Payment Mode Distribution</h4>
              <div className="space-y-2">
                {Object.entries(donationAnalysis.byPaymentMode).map(([mode, data]: [string, any]) => {
                  const percentage = donationAnalysis.total > 0
                    ? (data.amount / donationAnalysis.total) * 100
                    : 0;
                  return (
                    <div key={mode} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{mode}</span>
                        <span className="font-semibold">₹{data.amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Analysis */}
      {itemAnalysis.items && itemAnalysis.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Item Funding Status
            </CardTitle>
            <CardDescription>Progress of individual items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {itemAnalysis.items.map((item) => (
                <div key={item.itemId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {item.completionPercentage.toFixed(1)}% complete
                    </span>
                  </div>
                  <Progress value={item.completionPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>₹{item.donatedAmount.toLocaleString()} / ₹{item.totalAmount.toLocaleString()}</span>
                    <span>₹{item.remainingAmount.toLocaleString()} remaining</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expense Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Expense Analysis
          </CardTitle>
          <CardDescription>Planned vs actual expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total Planned</p>
              <p className="text-2xl font-bold mt-1">₹{expenseAnalysis.totalPlanned.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{expenseAnalysis.plannedCount} items</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total Actual</p>
              <p className="text-2xl font-bold mt-1">₹{expenseAnalysis.totalActual.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{expenseAnalysis.completedCount} completed</p>
            </div>
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Variance</p>
              <p className={`text-2xl font-bold mt-1 ${expenseAnalysis.variance >= 0 ? 'text-success' : 'text-destructive'}`}>
                {expenseAnalysis.variance >= 0 ? '+' : ''}₹{Math.abs(expenseAnalysis.variance).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {expenseAnalysis.variance >= 0 ? '+' : ''}{expenseAnalysis.variancePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
