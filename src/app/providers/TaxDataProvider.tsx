import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setAuthToken } from "../lib/api";
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
} from "../lib/types";

interface TaxDataContextValue {
  dashboard: DashboardResponse | null;
  calculator: CalculatorResponse | null;
  assistant: AssistantResponse | null;
  deductions: DeductionsResponse | null;
  expenses: ExpensesResponse | null;
  documents: DocumentsResponse | null;
  scenarios: ScenariosResponse | null;
  reports: ReportsResponse | null;
  isLoading: boolean;
  error: string | null;
  user: { id: string; email: string; full_name?: string } | null;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, full_name: string | undefined, password: string) => Promise<void>;
  logout: () => void;
  checkRoutes: () => Promise<Record<string, boolean>>;
  refreshAll: () => Promise<void>;
  sendAssistantMessage: (message: string) => Promise<AssistantReply>;
  updateCalculator: (payload: CalculatorInput) => Promise<CalculatorResponse>;
  toggleDeduction: (id: string, applied: boolean) => Promise<void>;
  addExpense: (payload: {
    category: string;
    description: string;
    amount: number;
    date: string;
  }) => Promise<void>;
  toggleExpense: (id: string, deductible: boolean) => Promise<void>;
  uploadDocument: (file: File, category: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  simulateScenario: (payload: {
    baseIncome: number;
    baseDeductions: number;
    additionalInvestment: number;
  }) => Promise<ScenarioSimulation>;
  saveScenario: (payload: {
    name: string;
    description: string;
    additionalInvestment: number;
    additionalDeductions: number;
    projectedSavings: number;
  }) => Promise<void>;
}

const TaxDataContext = createContext<TaxDataContextValue | null>(null);

export function TaxDataProvider({ children }: { children: ReactNode }) {
  // toggle fake auth; set VITE_USE_DUMMY_AUTH=1 in .env to enable
  const USE_DUMMY_AUTH = import.meta.env.VITE_USE_DUMMY_AUTH === "1";

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [calculator, setCalculator] = useState<CalculatorResponse | null>(null);
  const [assistant, setAssistant] = useState<AssistantResponse | null>(null);
  const [deductions, setDeductions] = useState<DeductionsResponse | null>(null);
  const [expenses, setExpenses] = useState<ExpensesResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentsResponse | null>(null);
  const [scenarios, setScenarios] = useState<ScenariosResponse | null>(null);
  const [reports, setReports] = useState<ReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; full_name?: string } | null>(null);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        dashboardData,
        calculatorData,
        assistantData,
        deductionsData,
        expensesData,
        documentsData,
        scenariosData,
        reportsData,
      ] = await Promise.all([
        api.getDashboard(),
        api.getCalculator(),
        api.getAssistant(),
        api.getDeductions(),
        api.getExpenses(),
        api.getDocuments(),
        api.getScenarios(),
        api.getReports(),
      ]);

      setDashboard(dashboardData);
      setCalculator(calculatorData);
      setAssistant(assistantData);
      setDeductions(deductionsData);
      setExpenses(expensesData);
      setDocuments(documentsData);
      setScenarios(scenariosData);
      setReports(reportsData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load tax data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // capture token from query string (google callback)
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    if (tokenParam) {
      setAuthToken(tokenParam);
      localStorage.setItem("authToken", tokenParam);
      api.getCurrentUser()
        .then((u) => setUser(u))
        .catch(() => {
          setAuthToken(null);
          localStorage.removeItem("authToken");
        });
      // remove token from url
      params.delete("token");
      const newUrl = `${window.location.pathname}${
        params.toString() ? "?" + params.toString() : ""
      }`;
      window.history.replaceState({}, "", newUrl);
    }

    void refreshAll();
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthToken(token);
      api.getCurrentUser()
        .then((u) => setUser(u))
        .catch(() => {
          setAuthToken(null);
          localStorage.removeItem("authToken");
        });
    }
  }, [refreshAll]);

  const updateCalculator = useCallback(async (payload: CalculatorInput) => {
    const next = await api.updateCalculator(payload);
    setCalculator(next);
    setDashboard(await api.getDashboard());
    setAssistant(await api.getAssistant());
    setDeductions(await api.getDeductions());
    setScenarios(await api.getScenarios());
    setReports(await api.getReports());
    return next;
  }, []);

  const sendAssistantMessage = useCallback(async (message: string) => {
    return api.sendAssistantMessage(message);
  }, []);

  const toggleDeduction = useCallback(async (id: string, applied: boolean) => {
    const next = await api.toggleDeduction(id, applied);
    setDeductions(next);
    setDashboard(await api.getDashboard());
    setCalculator(await api.getCalculator());
    setAssistant(await api.getAssistant());
  }, []);

  const addExpense = useCallback(async (payload: { category: string; description: string; amount: number; date: string }) => {
    const next = await api.addExpense(payload);
    setExpenses(next);
    setDashboard(await api.getDashboard());
  }, []);

  const toggleExpense = useCallback(async (id: string, deductible: boolean) => {
    const next = await api.toggleExpense(id, deductible);
    setExpenses(next);
    setDashboard(await api.getDashboard());
  }, []);

  const uploadDocument = useCallback(async (file: File, category: string) => {
    const next = await api.uploadDocument(file, category);
    setDocuments(next);
    setDashboard(await api.getDashboard());
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    const next = await api.deleteDocument(id);
    setDocuments(next);
    setDashboard(await api.getDashboard());
  }, []);

  const simulateScenario = useCallback(async (payload: { baseIncome: number; baseDeductions: number; additionalInvestment: number }) => {
    return api.simulateScenario(payload);
  }, []);

  const saveScenario = useCallback(async (payload: {
    name: string;
    description: string;
    additionalInvestment: number;
    additionalDeductions: number;
    projectedSavings: number;
  }) => {
    const next = await api.saveScenario(payload);
    setScenarios(next);
  }, []);

  // authentication helpers
  const login = useCallback(async (username: string, password: string) => {
    if (USE_DUMMY_AUTH) {
      if (!username || !password) throw new Error("Email and password required");
      const fakeToken = crypto.randomUUID();
      setAuthToken(fakeToken);
      localStorage.setItem("authToken", fakeToken);
      setUser({ id: "user-1", email: username, full_name: "Test User" });
      return;
    }
    const tokenResp = await api.login({ username, password });
    // store token
    setAuthToken(tokenResp.access_token);
    localStorage.setItem("authToken", tokenResp.access_token);
    const userInfo = await api.getCurrentUser();
    setUser(userInfo);
  }, []);

  const register = useCallback(async (email: string, full_name: string | undefined, password: string) => {
    if (USE_DUMMY_AUTH) {
      // just call login
      await login(email, password);
      return;
    }
    await api.register({ email, full_name, password });
    // automatically log in after register
    await login(email, password);
  }, [login]);

  const logout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem("authToken");
    setUser(null);
  }, []);

  const checkRoutes = useCallback(() => {
    return api.checkRoutes();
  }, []);

  const value = useMemo(
    () => ({
      dashboard,
      calculator,
      assistant,
      deductions,
      expenses,
      documents,
      scenarios,
      reports,
      isLoading,
      error,
      user,
      login,
      register,
      logout,
      checkRoutes,
      refreshAll,
      sendAssistantMessage,
      updateCalculator,
      toggleDeduction,
      addExpense,
      toggleExpense,
      uploadDocument,
      deleteDocument,
      simulateScenario,
      saveScenario,
    }),
    [
      dashboard,
      calculator,
      assistant,
      deductions,
      expenses,
      documents,
      scenarios,
      reports,
      isLoading,
      error,
      user,
      login,
      register,
      logout,
      checkRoutes,
      refreshAll,
      sendAssistantMessage,
      updateCalculator,
      toggleDeduction,
      addExpense,
      toggleExpense,
      uploadDocument,
      deleteDocument,
      simulateScenario,
      saveScenario,
    ],
  );

  return <TaxDataContext.Provider value={value}>{children}</TaxDataContext.Provider>;
}

export function useTaxData() {
  const context = useContext(TaxDataContext);
  if (!context) {
    throw new Error("useTaxData must be used inside TaxDataProvider");
  }
  return context;
}