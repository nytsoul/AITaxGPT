import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calculator,
  MessageSquare,
  Tags,
  Receipt,
  FileText,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  RefreshCcw,
  ArrowUpRight,
  Menu,
  X
} from "lucide-react";
import { Toaster } from "./ui/sonner";
import { Button } from "./ui/button";
import { useTaxData } from "../providers/TaxDataProvider";
import { Footer } from "./Footer";

const navItems = [
  { path: "/app", label: "Dashboard", icon: LayoutDashboard },
  { path: "/app/calculator", label: "Tax Calculator", icon: Calculator },
  { path: "/app/assistant", label: "AI Assistant", icon: MessageSquare },
  { path: "/app/deductions", label: "Deductions", icon: Tags },
  { path: "/app/expenses", label: "Expenses", icon: Receipt },
  { path: "/app/documents", label: "Documents", icon: FileText },
  { path: "/app/scenarios", label: "Scenarios", icon: TrendingUp },
  { path: "/app/reports", label: "Multi-Year Report", icon: BarChart3 },
];

export function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { dashboard, refreshAll, isLoading, user, logout } = useTaxData();
  const navigate = useNavigate();
  const summary = dashboard?.summary;
  const currentItem = navItems.find((n) => n.path === location.pathname);
  const pageTitle = currentItem ? currentItem.label : "";

  useEffect(() => {
    // Close mobile sidebars on navigation
    setIsMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // simple guard: if not logged in redirect to login (except auth/landing paths)
    if (
      !user &&
      !["/login", "/register", "/"].includes(location.pathname) &&
      !location.pathname.startsWith("/api")
    ) {
      navigate("/login", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <>
      <div className="flex min-h-screen bg-transparent text-foreground relative">
        {/* Sidebar for Desktop */}
        <aside
          className={`sticky top-0 hidden h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[24px_0_60px_rgba(12,24,32,0.24)] transition-all duration-300 lg:flex ${collapsed ? 'w-16' : 'w-64'
            }`}
        >
          <div className="border-b border-sidebar-border px-4 py-5">
            <div className="mb-6 flex items-center justify-between">
              {!collapsed && (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.24em] text-sidebar-foreground/60">TaxGPT</p>
                  <h1 className="text-xl font-bold text-sidebar-foreground">Planning cockpit</h1>
                </div>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="rounded-xl border border-sidebar-border bg-white/5 p-2 text-sidebar-foreground/80 transition hover:bg-white/10 hover:text-sidebar-foreground"
              >
                {collapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
              </button>
            </div>

            {!collapsed && (
              <div className="rounded-2xl border border-white/8 bg-white/6 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sidebar-foreground">Audit readiness</p>
                    <p className="text-xs text-sidebar-foreground/65">Live tax operations overview</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/55">Income</p>
                    <p className="mt-1 text-lg font-bold">${summary?.totalIncome.toLocaleString() ?? "--"}</p>
                  </div>
                  <div className="rounded-xl bg-black/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/55">Tax</p>
                    <p className="mt-1 text-lg font-bold">${summary?.estimatedTax.toLocaleString() ?? "--"}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10'
                    : 'text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                    }`}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="size-5 flex-shrink-0" />
                  {!collapsed && (
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium">{item.label}</span>
                      {isActive && <ArrowUpRight className="size-4" />}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-sidebar-border px-3 py-4">
            <div className="space-y-1">
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sidebar-foreground/72 transition hover:bg-sidebar-accent hover:text-sidebar-foreground">
                <Bell className="size-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">Notifications</span>}
              </button>
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sidebar-foreground/72 transition hover:bg-sidebar-accent hover:text-sidebar-foreground">
                <Settings className="size-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">Settings</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <div
              className="h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-sidebar-border px-4 py-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.24em] text-sidebar-foreground/60">TaxGPT</p>
                  <h1 className="text-xl font-bold text-sidebar-foreground">Planning cockpit</h1>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/5"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10'
                        : 'text-sidebar-foreground/72 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                        }`}
                    >
                      <Icon className="size-5 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="border-t border-sidebar-border px-3 py-4">
                <button
                  onClick={() => logout()}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-red-400 hover:bg-red-400/10 transition"
                >
                  <RefreshCcw className="size-5 flex-shrink-0" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto w-full">
          <div className="sticky top-0 z-20 border-b border-border/60 bg-background/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1680px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsMobileOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-sidebar border border-sidebar-border text-sidebar-foreground"
                >
                  <Menu className="size-5" />
                </button>
                <div>
                  <p className="text-[10px] md:text-xs uppercase tracking-[0.24em] text-muted-foreground">Tax operations</p>
                  <div className="mt-1 flex items-center gap-2 md:gap-3">
                    <Sparkles className="size-4 md:size-5 text-chart-3" />
                    <h2 className="text-lg md:text-xl font-bold truncate max-w-[180px] sm:max-w-none">
                      {pageTitle || "AI Control Room"}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {!collapsed && summary && (
                  <div className="hidden rounded-2xl border border-border/70 bg-card px-4 py-3 text-right shadow-sm md:block">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Effective rate</p>
                    <p className="text-lg font-bold text-primary">{summary.effectiveTaxRate}%</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-2xl border-border/70 bg-card/80 px-2 sm:px-4"
                  onClick={() => void refreshAll()}
                  disabled={isLoading}
                >
                  <RefreshCcw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline ml-1">Refresh</span>
                </Button>
                {/* auth links */}
                {user ? (
                  <button
                    onClick={() => logout()}
                    className="text-sm text-primary hover:underline"
                  >
                    Logout
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <Link to="/login" className="text-sm text-primary hover:underline">
                      Login
                    </Link>
                    <Link to="/register" className="text-sm text-primary hover:underline">
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-[1680px] px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
      <Toaster />
    </>
  );
}