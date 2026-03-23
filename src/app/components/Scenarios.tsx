import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowRight, Lightbulb, Play, Save, TrendingDown, Zap } from "lucide-react";
import { useTaxData } from "../providers/TaxDataProvider";
import type { ScenarioSimulation } from "../lib/types";

export function Scenarios() {
  const { scenarios, simulateScenario, saveScenario, dashboard, isLoading, error } = useTaxData();
  const [baseIncome, setBaseIncome] = useState(0);
  const [baseDeductions, setBaseDeductions] = useState(0);
  const [additionalInvestment, setAdditionalInvestment] = useState(0);
  const [simulation, setSimulation] = useState<ScenarioSimulation | null>(null);

  useEffect(() => {
    if (scenarios) {
      // Prioritize dashboard data for consistency if available
      const currentIncome = dashboard?.summary.totalIncome ?? scenarios.baseIncome;
      const currentDeductions = dashboard?.summary.totalDeductions ?? scenarios.baseDeductions;
      
      setBaseIncome(currentIncome);
      setBaseDeductions(currentDeductions);
      setSimulation(scenarios.simulation);
    }
  }, [scenarios, dashboard]);

  if (isLoading && !scenarios) {
    return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading scenarios...</div>;
  }
  if (!scenarios || !simulation) {
    return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Scenario data is unavailable."}</div>;
  }

  const runSimulation = async (investment = additionalInvestment) => {
    setAdditionalInvestment(investment);
    setSimulation(await simulateScenario({ baseIncome, baseDeductions, additionalInvestment: investment }));
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,rgba(18,52,71,0.97),rgba(32,74,70,0.92))] text-white shadow-[0_24px_70px_rgba(18,52,71,0.22)]">
        <CardContent className="p-6 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge className="rounded-full bg-white/12 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-white shadow-none hover:bg-white/12">
                Tax Scenario Simulator
              </Badge>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">What-If Tax Planner</h1>
              <p className="text-white/72 text-sm sm:text-base">
                Model investment and deduction changes before committing. See the tax impact in real time.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-[300px]">
              {[
                { label: "Base Tax", value: `$${simulation.baseTax.toLocaleString()}`, color: "text-white" },
                { label: "New Tax", value: `$${simulation.newTax.toLocaleString()}`, color: "text-emerald-300" },
                { label: "Saved", value: `$${simulation.taxSavings.toLocaleString()}`, color: "text-amber-300" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-2xl border border-white/12 bg-black/20 p-4 text-center backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">{label}</p>
                  <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="simulator" className="space-y-5">
        <TabsList className="rounded-2xl bg-secondary/70 p-1">
          <TabsTrigger value="simulator" className="rounded-xl">Live Simulator</TabsTrigger>
          <TabsTrigger value="saved" className="rounded-xl">Saved ({scenarios.savedScenarios.length})</TabsTrigger>
          <TabsTrigger value="quick" className="rounded-xl">Quick Compare</TabsTrigger>
        </TabsList>

        {/* Simulator Tab — full width two-column */}
        <TabsContent value="simulator">
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            {/* Left: Inputs */}
            <div className="space-y-4">
              <Card className="border-border/70 bg-card/92 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Zap className="size-5 text-primary" /> Simulation Inputs</CardTitle>
                  <CardDescription>Adjust variables and run the model.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="baseIncome">Total Annual Income</Label>
                    <Input id="baseIncome" type="number" value={baseIncome} onChange={(e) => setBaseIncome(Number(e.target.value) || 0)} className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="baseDeductions">Current Deductions</Label>
                    <Input id="baseDeductions" type="number" value={baseDeductions} onChange={(e) => setBaseDeductions(Number(e.target.value) || 0)} className="rounded-xl" />
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Additional Investment / Deduction</Label>
                      <span className="text-sm font-bold text-primary">${additionalInvestment.toLocaleString()}</span>
                    </div>
                    <Slider value={[additionalInvestment]} onValueChange={(v) => setAdditionalInvestment(v[0])} max={30000} step={500} className="my-2" />
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Max 401(k)", amount: 10000 },
                        { label: "Max HSA", amount: 8300 },
                        { label: "$5K Charity", amount: 5000 },
                        { label: "$15K IRA", amount: 15000 },
                      ].map(({ label, amount }) => (
                        <Button key={label} variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => void runSimulation(amount)}>
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full rounded-2xl gap-2" onClick={() => void runSimulation()}>
                    <Play className="size-4" /> Run Simulation
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border/70 bg-card/92 shadow-sm">
                <CardContent className="p-5">
                  <Button
                    variant="outline"
                    className="w-full rounded-2xl gap-2"
                    onClick={async () => {
                      try {
                        await saveScenario({
                          name: `Custom $${additionalInvestment.toLocaleString()} plan`,
                          description: "Saved from the interactive simulator.",
                          additionalInvestment,
                          additionalDeductions: additionalInvestment,
                          projectedSavings: simulation.taxSavings,
                        });
                        toast.success("Scenario saved successfully!");
                      } catch (err) {
                        toast.error("Failed to save scenario.");
                      }
                    }}
                  >
                    <Save className="size-4" /> Save This Scenario
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right: Results */}
            <div className="space-y-5">
              {/* Result stats */}
              <div className="flex flex-wrap gap-4">
                <Card className="flex-1 min-w-[240px] border-border/70 bg-card/92 shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">New Estimated Tax</p>
                    <p className="mt-2 text-3xl font-bold text-primary">${simulation.newTax.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="flex-1 min-w-[240px] border-emerald-200 bg-emerald-50 shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-xs uppercase tracking-widest text-emerald-700">Tax Saved</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-700">${simulation.taxSavings.toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card className="flex-1 min-w-[240px] border-border/70 bg-card/92 shadow-sm">
                  <CardContent className="p-6 flex items-center gap-3">
                    <TrendingDown className="size-8 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Reduction</p>
                      <p className="mt-2 text-3xl font-bold">{simulation.savingsPercentage}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Comparison chart — full width */}
              <Card className="border-border/70 bg-card/92 shadow-sm">
                <CardHeader>
                  <CardTitle>Before vs After Comparison</CardTitle>
                  <CardDescription>Baseline and scenario side-by-side — income, deductions, and tax.</CardDescription>
                </CardHeader>
                <CardContent className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={simulation.comparison} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                      <Bar dataKey="income" name="Income" fill="#123447" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="deductions" name="Deductions" fill="#4b8571" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="tax" name="Tax" fill="#d88d32" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Saved Scenarios Tab */}
        <TabsContent value="saved" className="space-y-4">
          {scenarios.savedScenarios.length === 0 && (
            <div className="flex flex-col items-center py-20 gap-4 text-center">
              <div className="rounded-2xl bg-secondary p-6"><Save className="size-10 text-primary" /></div>
              <p className="font-semibold text-lg">No saved scenarios yet</p>
              <p className="text-sm text-muted-foreground">Run the simulator and save a version to compare later.</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {scenarios.savedScenarios.map((s) => (
              <Card key={s.id} className="border-border/70 bg-card/92 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{s.name}</p>
                        <Badge className="rounded-full bg-secondary text-primary shadow-none text-xs">Saved</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 rounded-2xl bg-secondary/40 p-3 text-xs mb-4">
                    <div>
                      <p className="text-muted-foreground">Investment</p>
                      <p className="font-bold mt-0.5">${s.additionalInvestment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Deductions</p>
                      <p className="font-bold mt-0.5">${s.additionalDeductions.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Projected savings</p>
                      <p className="text-xl font-bold text-emerald-600 mt-0.5">${s.projectedSavings.toLocaleString()}</p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-xl gap-1 text-xs">
                      Load <ArrowRight className="size-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Quick Compare Tab */}
        <TabsContent value="quick">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {scenarios.quickScenarios.map((s) => (
              <Card key={s.name} className="border-border/70 bg-card/92 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="size-10 flex items-center justify-center rounded-xl bg-primary/10 mb-4">
                    <TrendingDown className="size-5 text-primary" />
                  </div>
                  <p className="font-semibold">Invest {s.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">Estimated tax reduction</p>
                  <p className="text-2xl font-bold text-emerald-600">${s.savings.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.effectiveReturn}% effective return</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-border/60 bg-secondary/30 p-5 text-sm text-muted-foreground">
            <Lightbulb className="mt-0.5 size-4 text-amber-500 shrink-0" />
            <span>Use the Live Simulator tab to model a custom deduction size and save it for future reference.</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}