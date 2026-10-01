import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";
import FloatingInput, { VisibilityToggle } from "../Components/FloatingInput";

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Tell people as they type, not only after they press the button
  const mismatch =
    formData.password2.length > 0 && formData.password !== formData.password2;

  const toggle = (
    <VisibilityToggle shown={showPw} onToggle={() => setShowPw((s) => !s)} />
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password2) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate("/predict"); // Redirect after successful registration
    } catch (err) {
      // The server sends field errors as JSON; turn them into one readable line
      try {
        const errorObj = JSON.parse(
          err instanceof Error ? err.message : String(err),
        );
        setError(
          Object.entries(errorObj)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", "),
        );
      } catch {
        setError(
          (err instanceof Error ? err.message : String(err)) ||
            "Registration failed",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-8 pt-24">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm sm:p-8">
        <h1 className="text-center text-3xl font-bold text-white">
          Create your account
        </h1>
        <p className="mb-6 mt-1 text-center text-gray-400">
          Sign up to start predicting.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500 bg-red-500/20 p-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FloatingInput
              label="First name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              autoComplete="given-name"
              required
            />
            <FloatingInput
              label="Last name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              autoComplete="family-name"
              required
            />
          </div>
          <FloatingInput
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            required
          />
          <FloatingInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            autoCapitalize="none"
            required
          />
          <FloatingInput
            label="Password"
            name="password"
            type={showPw ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            hint="Use at least 8 characters."
            trailing={toggle}
            required
          />
          <FloatingInput
            label="Confirm password"
            name="password2"
            type={showPw ? "text" : "password"}
            value={formData.password2}
            onChange={handleChange}
            autoComplete="new-password"
            error={mismatch}
            hint={mismatch ? "Passwords don't match." : undefined}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {loading && (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            )}
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
