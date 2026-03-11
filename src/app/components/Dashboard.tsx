import { Link } from "react-router";
import {
  Area,
  AreaChart,
  Bar,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { AlertTriangle, ArrowRight, CalendarClock, FolderCheck, ReceiptText, Wallet, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useTaxData } from "../providers/TaxDataProvider";

const COLORS = ["#123447", "#4b8571", "#d88d32", "#8cae9c", "#b44c3b"];

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

export function Dashboard() {
  const { dashboard, isLoading, error } = useTaxData();

  if (isLoading && !dashboard) {
    return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading tax command center...</div>;
  }

  if (!dashboard) {
    return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Dashboard data is unavailable."}</div>;
  }

  const summaryCards = [
    {
      label: "Total income",
      value: formatCurrency(dashboard.summary.totalIncome),
      meta: "Live across salary, freelance, business, and investment streams",
      icon: Wallet,
    },
    {
      label: "Deductions secured",
      value: formatCurrency(dashboard.summary.totalDeductions),
      meta: "Confirmed write-offs currently reducing taxable income",
      icon: ReceiptText,
    },
    {
      label: "Estimated tax",
      value: formatCurrency(dashboard.summary.estimatedTax),
      meta: `${dashboard.summary.effectiveTaxRate}% effective rate at current settings`,
      icon: AlertTriangle,
    },
    {
      label: "Document coverage",
      value: `${dashboard.summary.documentCoverage}%`,
      meta: "Processed documents available for audit support",
      icon: FolderCheck,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(18,52,71,0.96),rgba(32,74,70,0.88))] text-white shadow-[0_24px_70px_rgba(18,52,71,0.25)]">
          <CardContent className="p-5 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl space-y-4">
                <Badge className="rounded-full bg-white/12 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-white shadow-none hover:bg-white/12">
                  {dashboard.headline.year} planning cycle
                </Badge>
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">{dashboard.headline.title}</h1>
                  <p className="max-w-xl text-sm sm:text-base text-white/72">{dashboard.headline.subtitle}</p>
                </div>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/60">Taxable income</p>
                    <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">{formatCurrency(dashboard.summary.taxableIncome)}</p>
                  </div>
                  <div className="rounded-3xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/60">Deductible spend</p>
                    <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">{formatCurrency(dashboard.summary.deductibleExpenses)}</p>
                  </div>
                  <div className="rounded-3xl border border-white/12 bg-white/8 p-4 backdrop-blur-sm">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/60">Next deadline</p>
                    <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-bold">{dashboard.upcomingDeadlines[0]?.daysLeft ?? 0}d</p>
                  </div>
                </div>
              </div>

              <div className="w-full max-w-sm rounded-[28px] border border-white/12 bg-black/15 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-white/55">Tax pressure</p>
                    <p className="mt-1 sm:mt-2 text-3xl sm:text-4xl font-bold">{dashboard.summary.effectiveTaxRate}%</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3">
                    <CalendarClock className="size-6" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-white/68">Stay ahead of quarterly obligations by keeping deductions and receipts current.</p>
                <Progress value={Math.min(dashboard.summary.documentCoverage, 100)} className="mt-5 h-2 bg-white/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border/70 bg-card/90 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                Audit Risk & Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold">{dashboard.health.score}/100</p>
                  <p className={`text-sm font-medium ${dashboard.health.score > 80 ? 'text-emerald-600' : dashboard.health.score > 50 ? 'text-amber-600' : 'text-red-600'}`}>
                    {dashboard.health.status}
                  </p>
                </div>
                <div className="size-12 rounded-full border-4 border-secondary flex items-center justify-center text-xs font-bold" style={{ borderColor: dashboard.health.score > 80 ? '#10b981' : dashboard.health.score > 50 ? '#f59e0b' : '#ef4444' }}>
                  {dashboard.health.score}%
                </div>
              </div>
              <div className="space-y-2">
                {dashboard.health.issues.map((issue, i) => (
                  <div key={i} className="flex gap-2 text-xs p-2 rounded-lg bg-secondary/50 border border-border/40">
                    <AlertTriangle className={`size-3.5 mt-0.5 shrink-0 ${issue.type === 'error' || issue.type === 'risk' ? 'text-red-500' : 'text-amber-500'}`} />
                    <span>{issue.message}</span>
                  </div>
                ))}
                {dashboard.health.issues.length === 0 && (
                  <p className="text-xs text-muted-foreground italic text-center py-2">No critical issues detected. Your profile is optimized.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {dashboard.alerts.map((alert) => (
            <Card key={alert.title} className="border-border/70 bg-card/90 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`rounded-2xl p-3 ${alert.tone === "success" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    <AlertTriangle className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-border/70 bg-card/92 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{card.label}</p>
                    <p className="mt-3 text-3xl font-bold text-primary">{card.value}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{card.meta}</p>
                  </div>
                  <div className="rounded-2xl bg-secondary p-3 text-primary">
                    <Icon className="size-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Income, expense, and tax trend</CardTitle>
            <CardDescription>Six-month operational pulse across the tax stack.</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboard.monthlyData}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#123447" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#123447" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="taxFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d88d32" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#d88d32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 36, 48, 0.08)" />
                <XAxis dataKey="month" stroke="#5e6b73" />
                <YAxis stroke="#5e6b73" />
                <Tooltip />
                <Area type="monotone" dataKey="income" stroke="#123447" fill="url(#incomeFill)" strokeWidth={2.4} />
                <Area type="monotone" dataKey="tax" stroke="#d88d32" fill="url(#taxFill)" strokeWidth={2.4} />
                <Bar dataKey="expenses" fill="#4b8571" radius={[8, 8, 0, 0]} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Income mix</CardTitle>
            <CardDescription>Distribution of active income streams.</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboard.incomeBreakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={4}>
                  {dashboard.incomeBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming deadlines</CardTitle>
            <CardDescription>Operational timing for filings and estimated payments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.upcomingDeadlines.map((deadline) => (
              <div key={deadline.title} className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/70 px-5 py-4">
                <div>
                  <p className="font-semibold">{deadline.title}</p>
                  <p className="text-sm text-muted-foreground">{deadline.date}</p>
                </div>
                <Badge className="rounded-full bg-secondary px-3 py-1 text-primary shadow-none">{deadline.daysLeft} days</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Priority actions</CardTitle>
            <CardDescription>Best next moves generated from current backend data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard.actions.map((action) => (
              <div key={action.title} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold">{action.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <Button asChild className="rounded-2xl">
                    <Link to={action.path}>
                      Open
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            <div className="rounded-3xl border border-border/60 bg-background/70 p-5">
              <p className="mb-3 font-semibold">Expense pressure by category</p>
              <div className="space-y-3">
                {dashboard.expenseBreakdown.map((expense) => {
                  const total = dashboard.expenseBreakdown.reduce((sum, item) => sum + item.amount, 0) || 1;
                  return (
                    <div key={expense.category}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{expense.category}</span>
                        <span className="font-semibold text-primary">{formatCurrency(expense.amount)}</span>
                      </div>
                      <Progress value={(expense.amount / total) * 100} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
