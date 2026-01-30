import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { donationsApi } from "@/lib/api/donations";
import { formatDistanceToNow } from "date-fns";

export function RecentDonations() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["donations", "recent"],
    queryFn: () => donationsApi.getDonations({ limit: 5 }),
  });

  const donations = data?.data || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-success" />
            <h3 className="text-lg font-semibold">Recent Donations</h3>
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-success" />
          <h3 className="text-lg font-semibold">Recent Donations</h3>
        </div>
        <button
          onClick={() => navigate("/donations")}
          className="text-sm font-medium text-primary hover:underline"
        >
          View All
        </button>
      </div>
      <div className="space-y-4">
        {donations.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No donations yet
          </div>
        ) : (
          donations.map((donation) => (
            <div
              key={donation._id}
              className="flex items-center justify-between rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-success/10 text-success text-sm font-medium">
                    {getInitials(donation.donorName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{donation.donorName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {donation.purpose}
                    {donation.eventId && ` - ${donation.eventId.name}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-success">
                  ₹{donation.amount.toLocaleString()}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {donation.paymentMode}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(donation.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
