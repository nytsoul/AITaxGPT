import type {
  AssistantReply,
  AssistantResponse,
  CalculatorInput,
  CalculatorResponse,
  DashboardResponse,
  DeductionsResponse,
  DocumentsResponse,
  ExpensesResponse,
  ReportsResponse,
  ScenarioSimulation,
  ScenariosResponse,
  UserOut,
  Token,
} from "./types";


let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

async function request<T>(path: string, init?: RequestInit, retries = 3, retryDelayMs = 2000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const headers: Record<string, string> = {
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(init?.headers as Record<string, string> || {}),
      };
      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      const response = await fetch(path, {
        headers,
        ...init,
      });

      if (!response.ok) {
        const isRetryable = response.status >= 500 && (!init?.method || init.method === "GET");
        if (isRetryable && attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
          continue;
        }
        let errorMsg = `Request failed: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMsg = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
          }
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }

      return response.json() as Promise<T>;
    } catch (err) {
      if (attempt < retries && err instanceof TypeError) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}


export const api = {
  getDashboard: () => request<DashboardResponse>("/api/dashboard"),
  getCalculator: () => request<CalculatorResponse>("/api/calculator"),
  updateCalculator: (payload: CalculatorInput) =>
    request<CalculatorResponse>("/api/calculator/calculate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getAssistant: () => request<AssistantResponse>("/api/assistant"),
  sendAssistantMessage: (message: string) =>
    request<AssistantReply>("/api/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  getDeductions: () => request<DeductionsResponse>("/api/deductions"),
  toggleDeduction: (id: string, applied: boolean) =>
    request<DeductionsResponse>(`/api/deductions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ applied }),
    }),
  getExpenses: () => request<ExpensesResponse>("/api/expenses"),
  addExpense: (payload: {
    category: string;
    description: string;
    amount: number;
    date: string;
  }) =>
    request<ExpensesResponse>("/api/expenses", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  toggleExpense: (id: string, deductible: boolean) =>
    request<ExpensesResponse>(`/api/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ deductible }),
    }),
  getDocuments: () => request<DocumentsResponse>("/api/documents"),
  uploadDocument: (file: File, category: string) => {
    const body = new FormData();
    body.append("file", file);
    body.append("category", category);
    return request<DocumentsResponse>("/api/documents/upload", {
      method: "POST",
      body,
    });
  },
  deleteDocument: (id: string) =>
    request<DocumentsResponse>(`/api/documents/${id}`, {
      method: "DELETE",
    }),
  getScenarios: () => request<ScenariosResponse>("/api/scenarios"),
  simulateScenario: (payload: {
    baseIncome: number;
    baseDeductions: number;
    additionalInvestment: number;
  }) =>
    request<ScenarioSimulation>("/api/scenarios/simulate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  saveScenario: (payload: {
    name: string;
    description: string;
    additionalInvestment: number;
    additionalDeductions: number;
    projectedSavings: number;
  }) =>
    request<ScenariosResponse>("/api/scenarios/save", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getReports: () => request<ReportsResponse>("/api/reports"),
  // authentication
  register: (payload: { email: string; full_name?: string; password: string }) =>
    request<{ id: string; email: string; full_name?: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: { username: string; password: string }) =>
    request<{ access_token: string; token_type: string }>("/api/auth/token", {
      method: "POST",
      body: new URLSearchParams(payload as any),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }),
  getCurrentUser: () => request<{ id: string; email: string; full_name?: string }>("/api/auth/me"),
  checkRoutes: () => request<Record<string, boolean>>("/api/routes"),
};