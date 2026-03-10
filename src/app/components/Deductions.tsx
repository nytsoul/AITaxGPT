import { CheckCircle2, Lightbulb, ShieldCheck, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useTaxData } from "../providers/TaxDataProvider";

function currency(value: number) {
  return `$${value.toLocaleString()}`;
}

export function Deductions() {
  const { deductions, toggleDeduction, isLoading, error } = useTaxData();

  if (isLoading && !deductions) {
    return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading deductions...</div>;
  }

  if (!deductions) {
    return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Deductions data is unavailable."}</div>;
  }

  const applied = deductions.items.filter((item) => item.applied);
  const available = deductions.items.filter((item) => !item.applied);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden border-border/70 bg-[linear-gradient(135deg,rgba(255,252,245,0.96),rgba(215,232,222,0.92))] shadow-sm">
          <CardContent className="p-8">
            <Badge className="rounded-full bg-primary px-4 py-1 text-[11px] uppercase tracking-[0.2em] text-primary-foreground shadow-none">Deduction engine</Badge>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-primary">Deduction control board</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">Every toggle here updates the backend deduction set and propagates into the dashboard, calculator, and assistant context.</p>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Applied</p>
              <p className="mt-2 text-3xl font-bold text-primary">{currency(deductions.summary.appliedTotal)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Available</p>
              <p className="mt-2 text-3xl font-bold text-primary">{currency(deductions.summary.availableTotal)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardContent className="p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Potential savings</p>
              <p className="mt-2 text-3xl font-bold text-primary">{currency(deductions.summary.potentialSavings)}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Alert className="border-border/70 bg-background/70">
        <Lightbulb className="size-4" />
        <AlertDescription>
          {available.length} inactive deductions remain. Turning them on in the backend could unlock about {currency(deductions.summary.potentialSavings)} in tax savings.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active and inactive</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="categories">Category map</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="grid gap-6 lg:grid-cols-2">
          {[{ title: "Applied deductions", items: applied }, { title: "Available deductions", items: available }].map((group) => (
            <Card key={group.title} className="border-border/70 bg-card/92 shadow-sm">
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
                <CardDescription>{group.items.length} deduction entries returned by the backend.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between rounded-3xl border border-border/60 bg-background/70 p-5">
                    <div className="flex gap-3">
                      <div className={`rounded-2xl p-3 ${item.applied ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {item.applied ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
                      </div>
                      <div>
                        <p className="font-semibold">{item.type}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        <p className="mt-3 text-lg font-bold text-primary">{currency(item.amount)}</p>
                      </div>
                    </div>
                    <Switch checked={item.applied} onCheckedChange={(checked) => void toggleDeduction(item.id, checked)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="border-border/70 bg-card/92 shadow-sm">
            <CardHeader>
              <CardTitle>Backend recommendations</CardTitle>
              <CardDescription>Each recommendation is based on the current saved tax profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deductions.recommendations.map((item) => (
                <div key={item.title} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{item.title}</p>
                        <Badge className="rounded-full bg-secondary px-3 py-1 text-primary shadow-none">{item.difficulty}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{item.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tax savings</p>
                      <p className="mt-1 text-2xl font-bold text-primary">{currency(item.potentialSavings)}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Current: {currency(item.currentAmount)}</span>
                      <span>Target: {currency(item.recommendedAmount)}</span>
                    </div>
                    <Progress value={Math.min((item.currentAmount / item.recommendedAmount) * 100 || 0, 100)} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          {deductions.categories.map((category) => (
            <Card key={category.name} className="border-border/70 bg-card/92 shadow-sm">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <div key={item.name} className="rounded-3xl border border-border/60 bg-background/70 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold">{item.name}</p>
                      {item.max ? <Badge className="rounded-full bg-secondary px-3 py-1 text-primary shadow-none">Max {currency(item.max)}</Badge> : <ShieldCheck className="size-4 text-muted-foreground" />}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}