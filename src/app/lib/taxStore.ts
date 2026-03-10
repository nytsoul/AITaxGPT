export interface IncomeSource {
  id: string;
  type: 'salary' | 'freelance' | 'business' | 'investment';
  description: string;
  amount: number;
  year: number;
}

export interface Expense {
  id: string;
  category: 'business' | 'education' | 'medical' | 'travel' | 'insurance' | 'other';
  description: string;
  amount: number;
  date: string;
  deductible: boolean;
}

export interface Deduction {
  id: string;
  type: string;
  description: string;
  amount: number;
  applied: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

// Mock data
export const mockIncomeSources: IncomeSource[] = [
  {
    id: '1',
    type: 'salary',
    description: 'Annual Salary',
    amount: 75000,
    year: 2026,
  },
  {
    id: '2',
    type: 'freelance',
    description: 'Consulting Work',
    amount: 15000,
    year: 2026,
  },
  {
    id: '3',
    type: 'investment',
    description: 'Dividend Income',
    amount: 5000,
    year: 2026,
  },
];

export const mockExpenses: Expense[] = [
  {
    id: '1',
    category: 'business',
    description: 'Home Office Equipment',
    amount: 2500,
    date: '2026-01-15',
    deductible: true,
  },
  {
    id: '2',
    category: 'education',
    description: 'Professional Course',
    amount: 1500,
    date: '2026-02-20',
    deductible: true,
  },
  {
    id: '3',
    category: 'medical',
    description: 'Health Insurance Premium',
    amount: 3600,
    date: '2026-01-01',
    deductible: true,
  },
  {
    id: '4',
    category: 'travel',
    description: 'Business Trip',
    amount: 1200,
    date: '2026-03-10',
    deductible: true,
  },
  {
    id: '5',
    category: 'other',
    description: 'Personal Shopping',
    amount: 800,
    date: '2026-02-14',
    deductible: false,
  },
];

export const mockDeductions: Deduction[] = [
  {
    id: '1',
    type: 'Standard Deduction',
    description: 'Standard deduction for single filer',
    amount: 13850,
    applied: true,
  },
  {
    id: '2',
    type: 'Retirement Contribution',
    description: '401(k) contribution',
    amount: 8000,
    applied: true,
  },
  {
    id: '3',
    type: 'Health Savings Account',
    description: 'HSA contribution',
    amount: 3600,
    applied: true,
  },
  {
    id: '4',
    type: 'Student Loan Interest',
    description: 'Student loan interest deduction',
    amount: 2500,
    applied: false,
  },
  {
    id: '5',
    type: 'Charitable Contributions',
    description: 'Donations to qualified charities',
    amount: 1200,
    applied: false,
  },
];

export const mockYearlyData: YearlyTaxData[] = [
  { year: 2023, totalIncome: 65000, totalDeductions: 18000, taxableIncome: 47000, taxPaid: 7800 },
  { year: 2024, totalIncome: 70000, totalDeductions: 20000, taxableIncome: 50000, taxPaid: 8400 },
  { year: 2025, totalIncome: 85000, totalDeductions: 22000, taxableIncome: 63000, taxPaid: 11200 },
  { year: 2026, totalIncome: 95000, totalDeductions: 25450, taxableIncome: 69550, taxPaid: 12500 },
];

export const mockScenarios: TaxScenario[] = [
  {
    id: '1',
    name: 'Maximize Retirement',
    description: 'Increase 401(k) contribution to the maximum limit',
    additionalInvestment: 10000,
    additionalDeductions: 10000,
    projectedSavings: 2200,
  },
  {
    id: '2',
    name: 'Health Savings Strategy',
    description: 'Max out HSA contributions',
    additionalInvestment: 4500,
    additionalDeductions: 4500,
    projectedSavings: 990,
  },
  {
    id: '3',
    name: 'Education Investment',
    description: 'Open a 529 education savings plan',
    additionalInvestment: 5000,
    additionalDeductions: 5000,
    projectedSavings: 1100,
  },
];

// Tax calculation functions
export function calculateTax(income: number): number {
  // Simplified progressive tax calculation
  const brackets = [
    { limit: 11000, rate: 0.10 },
    { limit: 44725, rate: 0.12 },
    { limit: 95375, rate: 0.22 },
    { limit: 182100, rate: 0.24 },
    { limit: 231250, rate: 0.32 },
    { limit: 578125, rate: 0.35 },
    { limit: Infinity, rate: 0.37 },
  ];

  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (income > previousLimit) {
      const taxableAtThisRate = Math.min(income, bracket.limit) - previousLimit;
      tax += taxableAtThisRate * bracket.rate;
      previousLimit = bracket.limit;
    } else {
      break;
    }
  }

  return Math.round(tax);
}

export function getAIResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

  if (message.includes('reduce') && message.includes('tax')) {
    return "Here are some effective ways to reduce your tax liability:\n\n1. **Maximize Retirement Contributions**: Contributing to a 401(k) or IRA reduces your taxable income. For 2026, you can contribute up to $23,000 to a 401(k).\n\n2. **Health Savings Account (HSA)**: If eligible, HSA contributions are tax-deductible and can save you significantly.\n\n3. **Charitable Donations**: Donations to qualified charities are deductible.\n\n4. **Business Expenses**: If you're self-employed or freelancing, track all business-related expenses.\n\n5. **Education Credits**: The Lifetime Learning Credit or American Opportunity Credit can reduce taxes if you're pursuing education.\n\nBased on your current profile, I recommend focusing on maximizing your 401(k) contributions, which could save you approximately $2,200 annually.";
  }

  if (message.includes('deduction')) {
    return "Based on your financial profile, here are the deductions you're currently eligible for:\n\n✓ **Applied Deductions:**\n- Standard Deduction: $13,850\n- 401(k) Contribution: $8,000\n- Health Savings Account: $3,600\n\n💡 **Recommended Deductions:**\n- Student Loan Interest: Up to $2,500\n- Charitable Contributions: $1,200 (requires documentation)\n- Home Office Deduction: Based on your freelance work, you may qualify\n\nAdding these recommended deductions could save you an additional $836 in taxes.";
  }

  if (message.includes('how much') && message.includes('pay')) {
    return "Based on your current income and deductions:\n\n**Total Income:** $95,000\n**Total Deductions:** $25,450\n**Taxable Income:** $69,550\n\n**Estimated Tax:** $12,500\n\nThis breaks down to approximately $1,042 per month. Remember:\n- Make quarterly estimated payments if you have freelance income\n- Next payment due: April 15, 2026\n- You're currently on track with your withholdings";
  }

  if (message.includes('deadline')) {
    return "Here are your upcoming tax deadlines:\n\n📅 **2026 Tax Calendar:**\n- **April 15, 2026**: Q1 estimated tax payment & 2025 tax return filing\n- **June 16, 2026**: Q2 estimated tax payment\n- **September 15, 2026**: Q3 estimated tax payment\n- **January 15, 2027**: Q4 estimated tax payment\n\nI've set up reminders for all these dates. You'll receive notifications 1 week before each deadline.";
  }

  if (message.includes('freelance') || message.includes('self-employed')) {
    return "As a freelancer, here's what you need to know:\n\n**Tax Obligations:**\n- Pay self-employment tax (15.3% on net earnings)\n- Make quarterly estimated tax payments\n- Track all business expenses meticulously\n\n**Deductible Expenses:**\n✓ Home office (if you have a dedicated space)\n✓ Equipment and software\n✓ Internet and phone (business portion)\n✓ Professional development and courses\n✓ Travel for business purposes\n✓ Health insurance premiums\n\n**Your Current Status:**\nBased on your $15,000 freelance income, your self-employment tax is approximately $2,295. Make sure to set aside 25-30% of freelance income for taxes.";
  }

  if (message.includes('save') || message.includes('saving')) {
    return "I've analyzed your financial situation and identified several tax-saving opportunities:\n\n💰 **Immediate Savings (2026):**\n1. Increase 401(k): Save $2,200 by maxing out contributions\n2. Maximize HSA: Save $990 with additional $4,500 contribution\n3. Document charitable giving: Save $264\n\n**Total Potential Savings: $3,454**\n\n📈 **Long-term Strategy:**\n- Consider opening a backdoor Roth IRA\n- Explore tax-loss harvesting for investments\n- Set up a solo 401(k) for freelance income\n\nWould you like me to create a detailed action plan for any of these strategies?";
  }

  if (message.includes('investment')) {
    return "Tax-efficient investment strategies:\n\n**Tax-Advantaged Accounts:**\n- 401(k): Pre-tax contributions, reduces current taxable income\n- Roth IRA: After-tax contributions, tax-free growth\n- HSA: Triple tax advantage (deductible, tax-free growth, tax-free withdrawals for medical)\n\n**Your Investment Income:**\nYou reported $5,000 in dividend income. Consider:\n- Qualified dividends are taxed at lower capital gains rates\n- Tax-loss harvesting to offset gains\n- Holding investments longer than 1 year for long-term capital gains treatment\n\n**Recommendation:** Based on your income level, maximizing tax-deferred accounts should be your priority before investing in taxable accounts.";
  }

  // Default response
  return "I'm here to help with your tax questions! I can assist you with:\n\n• Tax calculations and estimates\n• Finding deductions you may have missed\n• Understanding tax deadlines\n• Freelance and business tax guidance\n• Investment tax strategies\n• Tax-saving recommendations\n\nWhat specific tax question can I help you with today?";
}
