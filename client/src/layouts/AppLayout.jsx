import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Flame, LogOut, Activity, Target, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Logo from "../components/Logo";
import UserSearch from "../components/UserSearch";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/habits", label: "Habits", icon: Flame },
    { to: "/goals", label: "Goals", icon: Target },
    { to: "/weekly-review", label: "Review", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-[linear-gradient(180deg,#f0fdf4_0%,#f8fafc_34%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#06110b_0%,#09090b_34%,#0a0a0a_100%)] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Navbar */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800/80 bg-white/75 dark:bg-zinc-950/75 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <Logo />
            <span className="font-semibold text-black dark:text-white tracking-tight">Movathon</span>
          </Link>

          {/* Nav Links & Search */}
          <div className="flex items-center gap-1 md:gap-4">
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    location.pathname === to
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-lime-400/10 dark:text-lime-200 dark:border-lime-400/20 shadow-sm dark:shadow-none"
                      : "text-zinc-600 hover:text-black hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/70 border border-transparent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
            <UserSearch className="ml-2 md:ml-0" />
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline text-sm text-zinc-500 dark:text-zinc-400">
              @{user?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-zinc-500 hover:text-black hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 h-8 px-2"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-50 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                location.pathname === to
                  ? "text-emerald-600 dark:text-lime-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
