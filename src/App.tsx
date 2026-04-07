import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";
import Index from "./pages/Index.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import DashboardHome from "./pages/dashboard/DashboardHome.tsx";
import NewAd from "./pages/dashboard/NewAd.tsx";
import AdsList from "./pages/dashboard/AdsList.tsx";
import AdDetail from "./pages/dashboard/AdDetail.tsx";
import NewCampaign from "./pages/dashboard/NewCampaign.tsx";
import CampaignsList from "./pages/dashboard/CampaignsList.tsx";
import SettingsPage from "./pages/dashboard/SettingsPage.tsx";
import TeamPage from "./pages/dashboard/TeamPage.tsx";
import BillingPage from "./pages/dashboard/BillingPage.tsx";
import NotificationsPage from "./pages/dashboard/NotificationsPage.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes - landing page untouched */}
            <Route path="/" element={<Index />} />
            <Route path="/privacidad" element={<PrivacyPolicy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<AdminPanel />} />
            </Route>
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<DashboardHome />} />
              <Route path="new-ad" element={<NewAd />} />
              <Route path="new-campaign" element={<NewCampaign />} />
              <Route path="ads" element={<AdsList />} />
              <Route path="ads/:id" element={<AdDetail />} />
              <Route path="campaigns" element={<CampaignsList />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="team" element={<TeamPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
