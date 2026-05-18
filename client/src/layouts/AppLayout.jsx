import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, Flame, LogOut, Target, CalendarDays, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import Logo from "../components/Logo";
import UserSearch from "../components/UserSearch";
import { deleteAccount } from "../api/users";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.username) {
      toast.error("Type your username to confirm account deletion");
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
      logout();
      toast.success("Your account and all related data were deleted");
      navigate("/register", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
      setDeleteConfirm("");
    }
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
            <span className="hidden sm:inline font-semibold text-black dark:text-white tracking-tight">Movathon</span>
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
          <div className="flex items-center gap-1 sm:gap-3">
            <span className="hidden sm:inline text-sm text-zinc-500 dark:text-zinc-400">
              @{user?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDeleteConfirm("");
                setDeleteOpen(true);
              }}
              aria-label="Account settings"
              title="Account settings"
              className="text-zinc-500 hover:text-black hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800 h-8 px-2"
            >
              <UserRound className="w-4 h-4" />
            </Button>
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

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-white">
          <DialogHeader>
            <DialogTitle>Account settings</DialogTitle>
            <DialogDescription>
              Account deletion is permanent and removes your profile, habits, goals, and habit entries.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20">
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Danger zone</p>
              <p className="mt-1 text-xs text-red-600/80 dark:text-red-300/70">
                Type <span className="font-semibold">@{user?.username}</span> without the @ symbol to enable deletion.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-red-700 dark:text-red-300">Confirm username</Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={user?.username || "username"}
                className="border-red-200 bg-white text-black placeholder:text-red-300 focus:border-red-500 dark:border-red-900/60 dark:bg-zinc-950 dark:text-white dark:placeholder:text-red-900"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleDeleteAccount} disabled={deleting || deleteConfirm !== user?.username} className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-50">
              {deleting ? "Deleting..." : "Delete account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
