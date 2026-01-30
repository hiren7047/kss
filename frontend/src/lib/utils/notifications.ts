import {
  Heart,
  Wallet,
  UserPlus,
  Calendar,
  AlertTriangle,
  FileText,
  UserCheck,
  Mail,
  Bell,
  DollarSign,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type NotificationType =
  | "DONATION_RECEIVED"
  | "EXPENSE_PENDING"
  | "EXPENSE_APPROVED"
  | "EXPENSE_REJECTED"
  | "MEMBER_REGISTERED"
  | "VOLUNTEER_REGISTERED"
  | "EVENT_CREATED"
  | "EVENT_UPDATED"
  | "LOW_WALLET_BALANCE"
  | "FORM_SUBMISSION"
  | "VOLUNTEER_WORK_SUBMITTED"
  | "DOCUMENT_UPLOADED"
  | "CONTACT_SUBMISSION"
  | "SYSTEM_ALERT";

export function getNotificationIcon(type: NotificationType): LucideIcon {
  switch (type) {
    case "DONATION_RECEIVED":
      return Heart;
    case "EXPENSE_PENDING":
    case "EXPENSE_APPROVED":
    case "EXPENSE_REJECTED":
      return Wallet;
    case "MEMBER_REGISTERED":
      return UserPlus;
    case "VOLUNTEER_REGISTERED":
    case "VOLUNTEER_WORK_SUBMITTED":
      return UserCheck;
    case "EVENT_CREATED":
    case "EVENT_UPDATED":
      return Calendar;
    case "LOW_WALLET_BALANCE":
      return AlertTriangle;
    case "FORM_SUBMISSION":
      return FileText;
    case "DOCUMENT_UPLOADED":
      return FileText;
    case "CONTACT_SUBMISSION":
      return Mail;
    case "SYSTEM_ALERT":
      return Bell;
    default:
      return Bell;
  }
}

export function getNotificationColor(priority: "low" | "medium" | "high" | "urgent"): string {
  switch (priority) {
    case "urgent":
      return "text-destructive";
    case "high":
      return "text-orange-500";
    case "medium":
      return "text-blue-500";
    case "low":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground";
  }
}
