import { createBrowserRouter } from "react-router";
import { Dashboard } from "./components/Dashboard";
import { TaxCalculator } from "./components/TaxCalculator";
import { AIAssistant } from "./components/AIAssistant";
import { Deductions } from "./components/Deductions";
import { Expenses } from "./components/Expenses";
import { Documents } from "./components/Documents";
import { Scenarios } from "./components/Scenarios";
import { Reports } from "./components/Reports";
import { Layout } from "./components/Layout";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { Profile } from "./components/Profile";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  { path: "/register", Component: Register },
  { path: "/profile", Component: Profile },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "calculator", Component: TaxCalculator },
      { path: "assistant", Component: AIAssistant },
      { path: "deductions", Component: Deductions },
      { path: "expenses", Component: Expenses },
      { path: "documents", Component: Documents },
      { path: "scenarios", Component: Scenarios },
      { path: "reports", Component: Reports },
    ],
  },
]);
