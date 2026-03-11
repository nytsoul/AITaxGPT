import { useMemo, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CheckCircle, Filter, Plus, Sparkles, XCircle } from "lucide-react";
import { useTaxData } from "../providers/TaxDataProvider";

const COLORS = ["#123447", "#4b8571", "#d88d32", "#b44c3b", "#8cae9c", "#5e6b73"];

export function Expenses() {
  const { expenses, addExpense, toggleExpense, isLoading, error } = useTaxData();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "business" as "business" | "education" | "medical" | "travel" | "insurance" | "other",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  if (isLoading && !expenses) {
    return <div className="rounded-[28px] border border-border/70 bg-card p-10 text-sm text-muted-foreground shadow-sm">Loading expenses...</div>;
  }

  if (!expenses) {
    return <div className="rounded-[28px] border border-destructive/20 bg-red-50 p-10 text-sm text-red-700">{error ?? "Expenses data is unavailable."}</div>;
  }

  const filteredExpenses = filterCategory === "all"
    ? expenses.items
    : expenses.items.filter((expense) => expense.category === filterCategory);

  const chartData = useMemo(() => expenses.categoryBreakdown, [expenses.categoryBreakdown]);

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      return;
    }

    await addExpense({
      category: newExpense.category,
      description: newExpense.description,
      amount: Number(newExpense.amount),
      date: newExpense.date,
    });

    setNewExpense({
      category: "business",
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Expense operations</h1>
          <p className="mt-2 text-base text-muted-foreground">Backend-tracked transactions with live deductibility flags.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl">
              <Plus className="size-4 mr-2" />
              Add expense
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add new expense</DialogTitle>
              <DialogDescription>This writes a new transaction to the backend expense list.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newExpense.category}
                  onValueChange={(value: "business" | "education" | "medical" | "travel" | "insurance" | "other") => setNewExpense((current) => ({ ...current, category: value }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={newExpense.description} onChange={(event) => setNewExpense((current) => ({ ...current, description: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" type="number" value={newExpense.amount} onChange={(event) => setNewExpense((current) => ({ ...current, amount: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={newExpense.date} onChange={(event) => setNewExpense((current) => ({ ...current, date: event.target.value }))} />
              </div>
              <Button className="w-full rounded-2xl" onClick={() => void handleAddExpense()}>Save expense</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Total expenses</CardDescription>
            <CardTitle className="text-2xl">${expenses.summary.totalExpenses.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{expenses.items.length} transactions stored</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Deductible expenses</CardDescription>
            <CardTitle className="text-2xl text-green-600">${expenses.summary.deductibleExpenses.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{expenses.items.filter((item) => item.deductible).length} deductible items</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader className="pb-3">
            <CardDescription>Potential tax savings</CardDescription>
            <CardTitle className="text-2xl text-blue-600">${expenses.summary.potentialSavings.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Estimated at a 22% rate</p>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-blue-200 bg-blue-50">
        <Sparkles className="size-4 text-blue-600" />
        <AlertDescription>
          <p className="mb-2 font-medium text-blue-900">Backend suggestions</p>
          <div className="space-y-1 text-sm text-blue-700">
            {expenses.aiSuggestions.map((suggestion, idx) => (
              <p key={`${suggestion}-${idx}`}>• {suggestion}</p>
            ))}
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <CardTitle>Expense distribution</CardTitle>
            <CardDescription>Current category mix from the backend list.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={108}>
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/92 shadow-sm">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>Expense ledger</CardTitle>
                <CardDescription>Toggle deductibility without leaving the table.</CardDescription>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px] rounded-2xl">
                  <Filter className="size-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-center">Deductible</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense, idx) => (
                  <TableRow key={`${expense.id}-${idx}`}>
                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">${expense.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <button className="inline-flex items-center" onClick={() => void toggleExpense(expense.id, !expense.deductible)}>
                        {expense.deductible ? <CheckCircle className="size-5 text-green-600" /> : <XCircle className="size-5 text-slate-300" />}
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}