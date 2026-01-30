import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Heart,
  Wallet,
  Calendar,
  UserCheck,
  PiggyBank,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  Globe,
  Sparkles,
  Image,
  MessageSquareQuote,
  TrendingUp,
  Mail,
  UserPlus,
  FileEdit,
  Eye,
  Bell,
  MessageCircle,
  Mail as MailIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, path: "/" },
  { title: "Members", icon: Users, path: "/members" },
  { title: "Donations", icon: Heart, path: "/donations" },
  { title: "Expenses", icon: Wallet, path: "/expenses" },
  { title: "Events", icon: Calendar, path: "/events" },
  { title: "Volunteers", icon: UserCheck, path: "/volunteers" },
  { title: "Volunteer Management", icon: UserCheck, path: "/admin/volunteers" },
  { title: "NGO Wallet", icon: PiggyBank, path: "/wallet" },
  { title: "Transparency", icon: Eye, path: "/transparency-admin" },
  { title: "Documents", icon: FileText, path: "/documents" },
  { title: "Communication", icon: MessageSquare, path: "/communication" },
  { title: "Email & Newsletter", icon: MailIcon, path: "/email-center" },
  { title: "WhatsApp Templates", icon: MessageCircle, path: "/whatsapp/templates" },
  { title: "WhatsApp Notifications", icon: MessageCircle, path: "/whatsapp/notifications" },
  { title: "Forms", icon: FileEdit, path: "/forms" },
];

const cmsMenuItems = [
  { title: "Page Content", icon: Globe, path: "/cms/pages" },
  { title: "Durga Content", icon: Sparkles, path: "/cms/durga" },
  { title: "Gallery", icon: Image, path: "/cms/gallery" },
  { title: "Testimonials", icon: MessageSquareQuote, path: "/cms/testimonials" },
  { title: "Impact Numbers", icon: TrendingUp, path: "/cms/impact" },
  { title: "Site Settings", icon: Settings, path: "/cms/settings" },
  { title: "Contact Forms", icon: Mail, path: "/cms/contact" },
  { title: "Volunteer Regs", icon: UserPlus, path: "/cms/volunteer-registrations" },
];

const bottomItems = [
  { title: "Notifications", icon: Bell, path: "/notifications" },
  { title: "Settings", icon: Settings, path: "/settings" },
  { title: "Security", icon: Shield, path: "/security" },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

export function AppSidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: AppSidebarProps) {
  const location = useLocation();

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border px-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <img 
              src="/kss-logo.png" 
              alt="KSS Logo" 
              className="h-10 w-10 object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm hidden">
              KSS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">KSS Admin</span>
              <span className="text-xs text-sidebar-foreground/60">Krishna Sada Sahayate</span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <>
            <img 
              src="/kss-logo.png" 
              alt="KSS Logo" 
              className="h-9 w-9 object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm hidden">
              K
            </div>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden h-8 w-8 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:flex"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
          
          {!isCollapsed && (
            <div className="px-3 py-2 mt-4">
              <div className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider mb-2">
                Content Management
              </div>
            </div>
          )}
          
          {cmsMenuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-sidebar-border p-3">
        <nav className="flex flex-col gap-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center px-2"
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
          <Separator className="my-2 bg-sidebar-border" />
          <button
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all duration-200 hover:bg-destructive/20 hover:text-destructive",
              isCollapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300 lg:relative",
          isCollapsed ? "w-[68px]" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
