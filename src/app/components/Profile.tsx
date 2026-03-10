import { useEffect, useState } from "react";
import { useTaxData } from "../providers/TaxDataProvider";
import { Link } from "react-router";
import { Button } from "./ui/button";

const modules = [
  "dashboard",
  "calculator",
  "assistant",
  "deductions",
  "expenses",
  "documents",
  "scenarios",
  "reports",
];

export function Profile() {
  const { user, logout, checkRoutes } = useTaxData();
  const [routes, setRoutes] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    checkRoutes()
      .then((r) => {
        if (!cancelled) setRoutes(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [checkRoutes]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {user ? (
        <div className="mb-6">
          <p className="mb-1">
            <strong>Email:</strong> {user.email}
          </p>
          {user.full_name && (
            <p className="mb-1">
              <strong>Name:</strong> {user.full_name}
            </p>
          )}
          <Button onClick={logout} variant="outline" className="mt-2">
            Logout
          </Button>
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}

      <nav className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Module status</h2>
        <ul className="space-y-1">
          {modules.map((mod) => (
            <li key={mod} className="flex items-center gap-2">
              <span>{mod}</span>
              {loading ? (
                <span className="text-gray-400">(checking...)</span>
              ) : routes[mod] ? (
                <span className="text-green-500">✔</span>
              ) : (
                <span className="text-red-500">✖</span>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <p className="text-sm text-gray-600">
        Use the links above to navigate to a module; green checkmarks indicate the
        backend route is available.
      </p>
    </div>
  );
}
