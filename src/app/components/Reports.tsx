import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { useTaxData } from "../providers/TaxDataProvider";

export function Reports() {
  const { reports, isLoading, error } = useTaxData();

  if (isLoading && !reports) {
    return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading reports...</div>;
  }

  if (!reports) {
    return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Reports data is unavailable."}</div>;
  }

  const yearOverYear = reports.yearlyData.map((year, index) => {
    const previous = index > 0 ? reports.yearlyData[index - 1] : null;
    return {
      year: year.year,
      income: year.totalIncome,
      deductions: year.totalDeductions,
      tax: year.taxPaid,
      incomeChange: previous ? (((year.totalIncome - previous.totalIncome) / previous.totalIncome) * 100).toFixed(1) : "0",
      taxChange: previous ? (((year.taxPaid - previous.taxPaid) / previous.taxPaid) * 100).toFixed(1) : "0",
    };
  });

  const previousYear = reports.yearlyData[reports.yearlyData.length - 2];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Multi-year analysis</h1>
          <p className="mt-2 text-base text-muted-foreground">Long-range backend history for tax growth, deductions, and effective rate control.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-2xl">Export PDF</Button>
          <Button variant="outline" className="rounded-2xl">Generate report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/70 bg-card/92 shadow-sm"><CardContent className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Income growth</p><p className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">{reports.summary.incomeGrowth}% <TrendingUp className="size-5 text-green-600" /></p><p className="mt-2 text-sm text-muted-foreground">vs. {previousYear.year}</p></CardContent></Card>
        <Card className="border-border/70 bg-card/92 shadow-sm"><CardContent className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tax growth</p><p className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">{reports.summary.taxGrowth}% <TrendingUp className="size-5 text-amber-600" /></p><p className="mt-2 text-sm text-muted-foreground">vs. {previousYear.year}</p></CardContent></Card>
        <Card className="border-border/70 bg-card/92 shadow-sm"><CardContent className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Deduction growth</p><p className="mt-2 flex items-center gap-2 text-3xl font-bold text-primary">{reports.summary.deductionGrowth}% <TrendingUp className="size-5 text-blue-600" /></p><p className="mt-2 text-sm text-muted-foreground">vs. {previousYear.year}</p></CardContent></Card>
        <Card className="border-border/70 bg-card/92 shadow-sm"><CardContent className="p-6"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Average effective rate</p><p className="mt-2 text-3xl font-bold text-primary">{reports.summary.averageEffectiveRate}%</p><p className="mt-2 text-sm text-muted-foreground">Across reported years</p></CardContent></Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Income and tax history</CardTitle>
            <CardDescription>Backend annual trend data.</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reports.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area dataKey="totalIncome" stroke="#123447" fill="#123447" fillOpacity={0.35} />
                <Area dataKey="taxPaid" stroke="#d88d32" fill="#d88d32" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Effective rate</CardTitle>
            <CardDescription>How tax burden changes over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reports.effectiveRates}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line dataKey="rate" stroke="#4b8571" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Year-over-year table</CardTitle>
            <CardDescription>Annual changes in income and tax.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {yearOverYear.map((year) => (
              <div key={year.year} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold">{year.year}</p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">Income {year.incomeChange}%</span>
                    <span className="text-muted-foreground">Tax {year.taxChange}%</span>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-background p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Income</p><p className="mt-2 font-semibold">${year.income.toLocaleString()}</p></div>
                  <div className="rounded-2xl bg-background p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Deductions</p><p className="mt-2 font-semibold">${year.deductions.toLocaleString()}</p></div>
                  <div className="rounded-2xl bg-background p-4"><p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tax</p><p className="mt-2 font-semibold">${year.tax.toLocaleString()}</p></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Insights</CardTitle>
            <CardDescription>Backend-generated planning signals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.insights.map((insight) => (
              <div key={insight.title} className={`rounded-3xl border-l-4 p-5 ${insight.tone === "success" ? "border-green-500 bg-green-50" : insight.tone === "opportunity" ? "border-blue-500 bg-blue-50" : "border-amber-500 bg-amber-50"}`}>
                <div className="flex items-start gap-3">
                  {insight.tone === "success" ? <TrendingUp className="mt-0.5 size-5 text-green-600" /> : insight.tone === "opportunity" ? <DollarSign className="mt-0.5 size-5 text-blue-600" /> : <AlertTriangle className="mt-0.5 size-5 text-amber-600" />}
                  <div>
                    <p className="font-semibold">{insight.title}</p>
                    <p className="mt-1 text-sm">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
            <Card className="border-border/60 bg-background/70 shadow-none">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">The report layer is now fully backend-fed. Any saved calculator or deduction change will flow into future analytical views.</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}