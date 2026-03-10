import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Lightbulb, Play, Save, TrendingDown } from "lucide-react";
import { useTaxData } from "../providers/TaxDataProvider";
import type { ScenarioSimulation } from "../lib/types";

export function Scenarios() {
  const { scenarios, simulateScenario, saveScenario, isLoading, error } = useTaxData();
  const [baseIncome, setBaseIncome] = useState(0);
  const [baseDeductions, setBaseDeductions] = useState(0);
  const [additionalInvestment, setAdditionalInvestment] = useState(0);
  const [simulation, setSimulation] = useState<ScenarioSimulation | null>(null);

  useEffect(() => {
    if (scenarios) {
      setBaseIncome(scenarios.baseIncome);
      setBaseDeductions(scenarios.baseDeductions);
      setSimulation(scenarios.simulation);
    }
  }, [scenarios]);

  if (isLoading && !scenarios) {
    return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading scenarios...</div>;
  }

  if (!scenarios || !simulation) {
    return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Scenario data is unavailable."}</div>;
  }

  const runSimulation = async (investment = additionalInvestment) => {
    setAdditionalInvestment(investment);
    setSimulation(await simulateScenario({
      baseIncome,
      baseDeductions,
      additionalInvestment: investment,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Scenario simulator</h1>
        <p className="mt-2 text-base text-muted-foreground">Model backend-driven tax outcomes before you commit to a strategy.</p>
      </div>

      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="recommendations">Saved scenarios</TabsTrigger>
          <TabsTrigger value="comparison">Quick comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card className="border-border/70 bg-card/92 shadow-sm">
              <CardHeader>
                <CardTitle>Base inputs</CardTitle>
                <CardDescription>Change the core variables before simulation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="baseIncome">Total income</Label>
                  <Input id="baseIncome" type="number" value={baseIncome} onChange={(event) => setBaseIncome(Number(event.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baseDeductions">Current deductions</Label>
                  <Input id="baseDeductions" type="number" value={baseDeductions} onChange={(event) => setBaseDeductions(Number(event.target.value) || 0)} />
                </div>
                <div className="space-y-3 rounded-3xl border border-border/60 bg-background/70 p-5">
                  <div className="flex items-center justify-between">
                    <Label>Additional investment or deduction</Label>
                    <span className="font-semibold">${additionalInvestment.toLocaleString()}</span>
                  </div>
                  <Slider value={[additionalInvestment]} onValueChange={(value) => setAdditionalInvestment(value[0])} max={30000} step={500} />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => void runSimulation(10000)}>Max 401(k)</Button>
                    <Button variant="outline" size="sm" onClick={() => void runSimulation(8300)}>Max HSA</Button>
                  </div>
                  <Button className="w-full rounded-2xl" onClick={() => void runSimulation()}>
                    <Play className="size-4 mr-2" />
                    Run simulation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/70 bg-card/92 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">New tax</p>
                  <p className="mt-2 text-3xl font-bold text-primary">${simulation.newTax.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-green-700">Savings</p>
                  <p className="mt-2 text-3xl font-bold text-green-700">${simulation.taxSavings.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-border/70 bg-card/92 shadow-sm">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reduction</p>
                  <p className="mt-2 text-3xl font-bold text-primary">{simulation.savingsPercentage}%</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70 bg-card/92 shadow-sm">
              <CardHeader>
                <CardTitle>Scenario comparison</CardTitle>
                <CardDescription>Before and after tax picture.</CardDescription>
              </CardHeader>
              <CardContent className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={simulation.comparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#123447" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="deductions" fill="#4b8571" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="tax" fill="#d88d32" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/92 shadow-sm">
              <CardHeader>
                <CardTitle>Save this version</CardTitle>
                <CardDescription>Persist the scenario to backend state.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="rounded-2xl"
                  onClick={() => void saveScenario({
                    name: `Custom ${additionalInvestment.toLocaleString()} plan`,
                    description: "Saved from the interactive simulator.",
                    additionalInvestment,
                    additionalDeductions: additionalInvestment,
                    projectedSavings: simulation.taxSavings,
                  })}
                >
                  <Save className="size-4 mr-2" />
                  Save scenario
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {scenarios.savedScenarios.map((scenario) => (
            <Card key={scenario.id} className="border-border/70 bg-card/92 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">{scenario.name}</p>
                      <Badge className="rounded-full bg-secondary px-3 py-1 text-primary shadow-none">Saved</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{scenario.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Projected savings</p>
                    <p className="mt-1 text-2xl font-bold text-primary">${scenario.projectedSavings.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Investment</p>
                    <p className="mt-2 font-semibold">${scenario.additionalInvestment.toLocaleString()}</p>
                  </div>
                  <div className="rounded-3xl bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Additional deductions</p>
                    <p className="mt-2 font-semibold">${scenario.additionalDeductions.toLocaleString()}</p>
                  </div>
                  <div className="rounded-3xl bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Effective return</p>
                    <p className="mt-2 font-semibold">{((scenario.projectedSavings / Math.max(scenario.additionalInvestment, 1)) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="comparison">
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardHeader>
              <CardTitle>Quick comparison</CardTitle>
              <CardDescription>What typical contribution sizes do to your tax position.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {scenarios.quickScenarios.map((scenario) => (
                <div key={scenario.name} className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/70 px-5 py-4">
                  <div>
                    <p className="font-semibold">Invest {scenario.name}</p>
                    <p className="text-sm text-muted-foreground">Estimated backend tax savings</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">${scenario.savings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{scenario.effectiveReturn}% return</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 rounded-3xl border border-border/60 bg-background/70 p-5 text-sm text-muted-foreground">
                <Lightbulb className="mt-0.5 size-4 text-chart-3" />
                <span>Use the simulator tab when you need to compare custom deduction sizes or persist a new planning option.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}