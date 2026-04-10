import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, PlusCircle, Megaphone, Settings, Users,
  CreditCard, Bell, LogOut, Menu, X, ChevronRight, Target
} from "lucide-react";
import ticoflowLogo from "@/assets/ticoflow-logo.png";
import TobyAI from "@/components/TobyAI";

const sidebarLinks = [
  { label: "Panel", href: "/dashboard", icon: LayoutDashboard },
  { label: "Nueva campaña", href: "/dashboard/new-campaign", icon: PlusCircle },
  { label: "Mis campañas", href: "/dashboard/campaigns", icon: Target },
  { label: "Anuncios", href: "/dashboard/ads", icon: Megaphone },
  { label: "Equipo", href: "/dashboard/team", icon: Users },
  { label: "Facturación", href: "/dashboard/billing", icon: CreditCard },
  { label: "Configuración", href: "/dashboard/settings", icon: Settings },
];

const DashboardLayout = () => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transform transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <img src={ticoflowLogo} alt="TicoFlow" className="h-8 w-8 rounded-full" />
          <span className="font-heading font-bold text-lg text-primary">TicoFlowAds<span className="text-accent">.ia</span></span>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-background flex items-center px-4 gap-4 md:px-6">
          <button className="md:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link to="/dashboard/notifications" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <TobyAI variant="dashboard" />
    </div>
  );
};

export default DashboardLayout;
