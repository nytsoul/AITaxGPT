import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTaxData } from "../providers/TaxDataProvider";

export function Register() {
  const navigate = useNavigate();
  const { register, user } = useTaxData();
  const USE_DUMMY_AUTH = import.meta.env.VITE_USE_DUMMY_AUTH === "1";

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(email, fullName || undefined, password);
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/50 py-12 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold">TaxGPT</h1>
          <p className="text-sm text-muted-foreground">Create a new account</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl bg-card/90 p-8 shadow-lg"
        >
          <div className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="text"
              label="Full name"
              placeholder="Optional"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <Button type="submit" className="w-full">
            Register
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              window.location.href = "/api/auth/google";
            }}
          >
            Google
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-primary hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
