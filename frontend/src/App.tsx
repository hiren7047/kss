import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Donations from "./pages/Donations";
import Expenses from "./pages/Expenses";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Volunteers from "./pages/Volunteers";
import AdminVolunteerManagement from "./pages/AdminVolunteerManagement";
import NGOWallet from "./pages/NGOWallet";
import TransparencyAdmin from "./pages/TransparencyAdmin";
import Documents from "./pages/Documents";
import Communication from "./pages/Communication";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PublicRegistration from "./pages/PublicRegistration";
import AdminRegistration from "./pages/AdminRegistration";
import DonatePage from "./pages/DonatePage";
// CMS Pages
import PageContentManagement from "./pages/cms/PageContent";
import DurgaContentManagement from "./pages/cms/DurgaContent";
import GalleryManagement from "./pages/cms/Gallery";
import TestimonialsManagement from "./pages/cms/Testimonials";
import ImpactNumbersManagement from "./pages/cms/ImpactNumbers";
import SiteSettingsManagement from "./pages/cms/SiteSettings";
import ContactSubmissionsManagement from "./pages/cms/ContactSubmissions";
import VolunteerRegistrationsManagement from "./pages/cms/VolunteerRegistrations";
import Forms from "./pages/Forms";
import FormCreateEdit from "./pages/FormCreateEdit";
import PublicForm from "./pages/PublicForm";
import FormSubmissions from "./pages/FormSubmissions";
import WhatsAppTemplates from "./pages/WhatsAppTemplates";
import WhatsAppNotifications from "./pages/WhatsAppNotifications";
import EmailCenter from "./pages/EmailCenter";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<PublicRegistration />} />
            <Route path="/admin/register" element={<AdminRegistration />} />
            <Route path="/donate/:slug" element={<DonatePage />} />
            <Route path="/forms/public/:token" element={<PublicForm />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/members" element={<Members />} />
                <Route path="/donations" element={<Donations />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/admin/volunteers" element={<AdminVolunteerManagement />} />
                <Route path="/wallet" element={<NGOWallet />} />
                <Route path="/transparency-admin" element={<TransparencyAdmin />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/communication" element={<Communication />} />
                <Route path="/email-center" element={<EmailCenter />} />
                <Route path="/whatsapp/templates" element={<WhatsAppTemplates />} />
                <Route path="/whatsapp/notifications" element={<WhatsAppNotifications />} />
                <Route path="/forms" element={<Forms />} />
                <Route path="/forms/create" element={<FormCreateEdit />} />
                <Route path="/forms/:id/edit" element={<FormCreateEdit />} />
                <Route path="/forms/:id/submissions" element={<FormSubmissions />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/security" element={<Security />} />
                {/* CMS Routes */}
                <Route path="/cms/pages" element={<PageContentManagement />} />
                <Route path="/cms/durga" element={<DurgaContentManagement />} />
                <Route path="/cms/gallery" element={<GalleryManagement />} />
                <Route path="/cms/testimonials" element={<TestimonialsManagement />} />
                <Route path="/cms/impact" element={<ImpactNumbersManagement />} />
                <Route path="/cms/settings" element={<SiteSettingsManagement />} />
                <Route path="/cms/contact" element={<ContactSubmissionsManagement />} />
                <Route path="/cms/volunteer-registrations" element={<VolunteerRegistrationsManagement />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
