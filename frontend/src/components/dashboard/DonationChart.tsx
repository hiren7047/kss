import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", donations: 45000, expenses: 32000 },
  { month: "Feb", donations: 52000, expenses: 28000 },
  { month: "Mar", donations: 48000, expenses: 35000 },
  { month: "Apr", donations: 61000, expenses: 42000 },
  { month: "May", donations: 55000, expenses: 38000 },
  { month: "Jun", donations: 67000, expenses: 45000 },
  { month: "Jul", donations: 72000, expenses: 52000 },
  { month: "Aug", donations: 69000, expenses: 48000 },
  { month: "Sep", donations: 81000, expenses: 55000 },
  { month: "Oct", donations: 76000, expenses: 51000 },
  { month: "Nov", donations: 84000, expenses: 58000 },
  { month: "Dec", donations: 95000, expenses: 62000 },
];

export function DonationChart() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Donations vs Expenses</h3>
          <p className="text-sm text-muted-foreground">Monthly financial overview</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Donations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-3" />
            <span className="text-muted-foreground">Expenses</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(168, 65%, 32%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(168, 65%, 32%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              className="text-xs fill-muted-foreground"
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, ""]}
            />
            <Area
              type="monotone"
              dataKey="donations"
              stroke="hsl(168, 65%, 32%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDonations)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpenses)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
