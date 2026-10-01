import React, { useState } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { Loader2, Plane } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";
import FloatingInput, { VisibilityToggle } from "../Components/FloatingInput";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // ProtectedRoute stores the page the user originally wanted
  const from = (location.state as { from?: string } | null)?.from ?? "/predict";

  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-8 pt-24">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm sm:p-8">
        <Plane className="mx-auto mb-3 h-10 w-10 text-blue-500" />
        <h1 className="text-center text-3xl font-bold text-white">
          Welcome back
        </h1>
        <p className="mb-6 mt-1 text-center text-gray-400">
          Sign in to use the prediction agent.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-rose-500/50 bg-rose-500/15 p-3 text-sm text-rose-200"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FloatingInput
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
          <FloatingInput
            label="Password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            trailing={
              <VisibilityToggle
                shown={showPw}
                onToggle={() => setShowPw((s) => !s)}
              />
            }
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {submitting && (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            )}
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-gray-400">
          New here?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
