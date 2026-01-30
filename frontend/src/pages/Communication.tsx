import { MessageSquare } from "lucide-react";

export default function Communication() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-info" />
          Communication
        </h1>
        <p className="page-description">
          Send bulk SMS, emails, and WhatsApp messages to members.
        </p>
      </div>
      <div className="rounded-xl border bg-card p-12 text-center shadow-card">
        <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground/30" />
        <h3 className="mt-4 text-xl font-semibold">Communication Hub</h3>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Send event reminders, donation thank-you messages, and bulk notifications to your community.
        </p>
      </div>
    </div>
  );
}
