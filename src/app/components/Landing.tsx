import { Link } from "react-router";

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white py-16 px-4">
      <h1 className="text-5xl font-extrabold mb-4">Welcome to TaxGPT</h1>
      <p className="max-w-2xl text-center text-lg text-muted-foreground mb-8">
        An AI-powered tax planning dashboard that helps you manage income, deductions,
        expenses and long-range scenarios. Get real‑time guidance, run simulations,
        and stay audit-ready.
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="p-6 bg-white rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Live Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Monitor your income, taxes due, document status, and upcoming deadlines
            all in one place.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask questions about tax-saving strategies and get answers based on your
            profile.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Scenario Simulator</h2>
          <p className="text-sm text-muted-foreground">
            Try different investment and deduction scenarios to see potential savings.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Document Tracking</h2>
          <p className="text-sm text-muted-foreground">
            Upload receipts and forms; TaxGPT will keep track of what's processed.
          </p>
        </div>
      </div>
      <div className="mt-12 flex gap-4">
        <Link to="/login" className="rounded-lg bg-primary px-6 py-3 text-white hover:bg-primary/80">
          Log In
        </Link>
        <Link to="/register" className="rounded-lg border border-primary px-6 py-3 text-primary hover:bg-primary/10">
          Register
        </Link>
      </div>
    </div>
  );
}
