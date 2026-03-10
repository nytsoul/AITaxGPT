import { useEffect, useState } from "react";
import { Calculator, Landmark, Percent, Receipt, Save } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { useTaxData } from "../providers/TaxDataProvider";
import type { CalculatorInput } from "../lib/types";

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

const emptyInput: CalculatorInput = {
  filingStatus: "single",
  salary: 0,
  freelance: 0,
  business: 0,
  investment: 0,
  standard: 13850,
  retirement: 0,
  hsa: 0,
  studentLoan: 0,
  charitable: 0,
};

export function TaxCalculator() {
  const { calculator, updateCalculator, isLoading, error } = useTaxData();
  const [form, setForm] = useState<CalculatorInput>(emptyInput);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (calculator) {
      setForm(calculator.input);
    }
  }, [calculator]);

  if (isLoading && !calculator) {
    return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading calculator...</div>;
  }

  if (!calculator) {
    return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Calculator data is unavailable."}</div>;
  }

  const summary = calculator.summary;

  const handleNumberChange = (field: keyof CalculatorInput, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: field === "filingStatus" ? value : Number(value) || 0,
    } as CalculatorInput));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateCalculator(form);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(255,252,245,0.92),rgba(219,231,227,0.92))] shadow-sm">
          <CardContent className="p-8">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl space-y-4">
                <Badge className="rounded-full bg-primary px-4 py-1 text-[11px] uppercase tracking-[0.2em] text-primary-foreground shadow-none">Backend calculator</Badge>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-primary">Live tax model</h1>
                  <p className="mt-3 text-base text-muted-foreground">Adjust income and deduction inputs, then persist them to the Python backend to refresh the entire planning workspace.</p>
                </div>
              </div>

              <div className="grid min-w-[280px] gap-3 rounded-[28px] border border-border/70 bg-card/80 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Estimated tax</p>
                  <p className="mt-2 text-4xl font-bold text-primary">{formatCurrency(summary.estimatedTax)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-secondary p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Effective</p>
                    <p className="mt-2 text-xl font-bold text-primary">{summary.effectiveTaxRate}%</p>
                  </div>
                  <div className="rounded-2xl bg-secondary p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Marginal</p>
                    <p className="mt-2 text-xl font-bold text-primary">{summary.marginalRate}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Quarterly operating view</CardTitle>
            <CardDescription>Useful for self-employment reserve planning.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl bg-secondary p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quarterly reserve</p>
              <p className="mt-3 text-3xl font-bold text-primary">{formatCurrency(summary.quarterlyPayment)}</p>
            </div>
            <Alert className="border-border/70 bg-background/70">
              <Percent className="size-4" />
              <AlertDescription>
                Your current structure implies a {summary.effectiveTaxRate}% effective rate on {formatCurrency(summary.totalIncome)} of income.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Calculator inputs</CardTitle>
            <CardDescription>Persist these values to update dashboard, deductions, and reports.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="filingStatus">Filing status</Label>
                <Select value={form.filingStatus} onValueChange={(value) => handleNumberChange("filingStatus", value)}>
                  <SelectTrigger id="filingStatus" className="rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married Filing Jointly</SelectItem>
                    <SelectItem value="married-separate">Married Filing Separately</SelectItem>
                    <SelectItem value="head">Head of Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Landmark className="size-4" />
                  Income sources
                </div>
                {[
                  ["salary", "Salary income"],
                  ["freelance", "Freelance income"],
                  ["business", "Business income"],
                  ["investment", "Investment income"],
                ].map(([field, label]) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{label}</Label>
                    <Input
                      id={field}
                      type="number"
                      value={form[field as keyof CalculatorInput] as number}
                      onChange={(event) => handleNumberChange(field as keyof CalculatorInput, event.target.value)}
                      className="rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Receipt className="size-4" />
                  Deductions
                </div>
                {[
                  ["standard", "Standard deduction"],
                  ["retirement", "Retirement contributions"],
                  ["hsa", "Health savings account"],
                  ["studentLoan", "Student loan interest"],
                  ["charitable", "Charitable contributions"],
                ].map(([field, label]) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{label}</Label>
                    <Input
                      id={field}
                      type="number"
                      value={form[field as keyof CalculatorInput] as number}
                      onChange={(event) => handleNumberChange(field as keyof CalculatorInput, event.target.value)}
                      className="rounded-2xl"
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button className="flex-1 rounded-2xl" onClick={handleSave} disabled={isSaving}>
                  <Save className="size-4" />
                  {isSaving ? "Saving..." : "Save to backend"}
                </Button>
                <Button variant="outline" className="flex-1 rounded-2xl" onClick={() => setForm(calculator.input)}>
                  Reset to saved
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardHeader>
              <CardTitle>Current result</CardTitle>
              <CardDescription>Returned by the Python calculator endpoint.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-secondary p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Taxable income</p>
                <p className="mt-2 text-3xl font-bold text-primary">{formatCurrency(summary.taxableIncome)}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total income</p>
                  <p className="mt-2 text-xl font-bold text-primary">{formatCurrency(summary.totalIncome)}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Total deductions</p>
                  <p className="mt-2 text-xl font-bold text-primary">{formatCurrency(summary.totalDeductions)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardHeader>
              <CardTitle>Bracket reference</CardTitle>
              <CardDescription>Current static ranges returned with the calculation payload.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {calculator.brackets.map((bracket) => (
                <div key={bracket.range} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3">
                  <span className="text-sm text-muted-foreground">{bracket.range}</span>
                  <Badge className="rounded-full bg-secondary px-3 py-1 text-primary shadow-none">{bracket.rate}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Alert className="border-border/70 bg-background/70">
            <Calculator className="size-4" />
            <AlertDescription>
              Saving here updates the backend profile used by the dashboard, deduction engine, assistant context, and scenario simulator.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    </div>
  );
}
