import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", donors: 12, volunteers: 5, beneficiaries: 25 },
  { month: "Feb", donors: 15, volunteers: 8, beneficiaries: 30 },
  { month: "Mar", donors: 18, volunteers: 10, beneficiaries: 35 },
  { month: "Apr", donors: 22, volunteers: 12, beneficiaries: 42 },
  { month: "May", donors: 28, volunteers: 15, beneficiaries: 48 },
  { month: "Jun", donors: 35, volunteers: 18, beneficiaries: 55 },
];

export function MemberGrowthChart() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Member Growth</h3>
          <p className="text-sm text-muted-foreground">New registrations by type</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Donors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-info" />
            <span className="text-muted-foreground">Volunteers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Beneficiaries</span>
          </div>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
              }}
            />
            <Bar dataKey="donors" fill="hsl(168, 65%, 32%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="volunteers" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="beneficiaries" fill="hsl(142, 70%, 40%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
