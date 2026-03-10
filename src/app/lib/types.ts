export interface IncomeSource {
  id: string;
  type: "salary" | "freelance" | "business" | "investment";
  description: string;
  amount: number;
  year: number;
}

export interface Deduction {
  id: string;
  type: string;
  description: string;
  amount: number;
  applied: boolean;
}

export interface Expense {
  id: string;
  category: "business" | "education" | "medical" | "travel" | "insurance" | "other";
  description: string;
  amount: number;
  date: string;
  deductible: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadDate: string;
  status: "processed" | "processing" | "pending";
  extractedData: {
    amount?: number;
    date?: string;
    vendor?: string;
  } | null;
}

export interface TaxScenario {
  id: string;
  name: string;
  description: string;
  additionalInvestment: number;
  additionalDeductions: number;
  projectedSavings: number;
}

export interface YearlyTaxData {
  year: number;
  totalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  taxPaid: number;
}

export interface DashboardResponse {
  headline: {
    title: string;
    subtitle: string;
    year: number;
  };
  summary: {
    totalIncome: number;
    totalDeductions: number;
    taxableIncome: number;
    estimatedTax: number;
    effectiveTaxRate: number;
    deductibleExpenses: number;
    documentCoverage: number;
  };
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
    tax: number;
  }>;
  incomeBreakdown: Array<{
    name: string;
    value: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
  }>;
  upcomingDeadlines: Array<{
    title: string;
    date: string;
    daysLeft: number;
    status: string;
  }>;
  alerts: Array<{
    title: string;
    description: string;
    tone: "warning" | "success" | "info";
  }>;
  actions: Array<{
    title: string;
    description: string;
    path: string;
  }>;
}

export interface CalculatorInput {
  filingStatus: string;
  salary: number;
  freelance: number;
  business: number;
  investment: number;
  standard: number;
  retirement: number;
  hsa: number;
  studentLoan: number;
  charitable: number;
}

export interface CalculatorResponse {
  input: CalculatorInput;
  summary: {
    totalIncome: number;
    totalDeductions: number;
    taxableIncome: number;
    estimatedTax: number;
    effectiveTaxRate: number;
    marginalRate: string;
    quarterlyPayment: number;
  };
  brackets: Array<{
    range: string;
    rate: string;
  }>;
}

export interface AssistantResponse {
  suggestedQuestions: string[];
  profile: {
    totalIncome: number;
    estimatedTax: number;
    effectiveTaxRate: number;
    filingStatus: string;
  };
}

export interface AssistantReply {
  message: {
    id: string;
    role: "assistant";
    content: string;
    timestamp: string;
  };
}

export interface DeductionsResponse {
  summary: {
    appliedTotal: number;
    availableTotal: number;
    potentialSavings: number;
  };
  items: Deduction[];
  categories: Array<{
    name: string;
    description: string;
    items: Array<{
      name: string;
      max: number | null;
      description: string;
    }>;
  }>;
  recommendations: Array<{
    title: string;
    currentAmount: number;
    recommendedAmount: number;
    potentialSavings: number;
    difficulty: string;
    reason: string;
  }>;
}

export interface ExpensesResponse {
  summary: {
    totalExpenses: number;
    deductibleExpenses: number;
    potentialSavings: number;
  };
  items: Expense[];
  categoryBreakdown: Array<{
    name: string;
    value: number;
  }>;
  aiSuggestions: string[];
}

export interface DocumentsResponse {
  summary: {
    totalDocuments: number;
    processedDocuments: number;
    pendingDocuments: number;
  };
  items: DocumentItem[];
  checklist: Array<{
    name: string;
    required: boolean;
    uploaded: boolean;
    category: string;
  }>;
  categories: string[];
}

export interface ScenarioSimulation {
  baseTax: number;
  newTax: number;
  taxSavings: number;
  savingsPercentage: number;
  comparison: Array<{
    name: string;
    income: number;
    deductions: number;
    taxableIncome: number;
    tax: number;
  }>;
}

export interface ScenariosResponse {
  baseIncome: number;
  baseDeductions: number;
  savedScenarios: TaxScenario[];
  quickScenarios: Array<{
    name: string;
    investment: number;
    savings: number;
    effectiveReturn: number;
  }>;
  simulation: ScenarioSimulation;
}

export interface ReportsResponse {
  summary: {
    incomeGrowth: number;
    taxGrowth: number;
    deductionGrowth: number;
    averageEffectiveRate: number;
  };
  yearlyData: YearlyTaxData[];
  effectiveRates: Array<{
    year: number;
    rate: number;
  }>;
  insights: Array<{
    title: string;
    description: string;
    tone: "success" | "opportunity" | "warning";
  }>;
}

export interface UserOut {
  id: string;
  email: string;
  full_name?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}