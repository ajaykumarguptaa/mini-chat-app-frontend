import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] px-4">
      <div className="w-full max-w-md bg-[#1A1A1A] border border-[#1A1A1A] rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-center mb-2 text-[#E5E5E5]">
          Welcome back
        </h2>
        <p className="text-xs text-center mb-6 text-[#E5E5E5]/60">
          Sign in to continue to your team workspace.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-[#0F0F0F] border border-[#4F46E5] text-[#E5E5E5] px-3 py-2 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-[#E5E5E5]">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full rounded-lg text-[#E5E5E5] border border-[#1A1A1A] bg-[#0F0F0F] px-3 py-2 text-sm outline-none focus:border-[#4F46E5]"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#E5E5E5]">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full rounded-lg text-[#E5E5E5] border border-[#1A1A1A] bg-[#0F0F0F] px-3 py-2 text-sm outline-none focus:border-[#4F46E5]"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center rounded-lg  bg-[#000000] hover:bg-[rgb(127,137,144)] disabled:opacity-60 px-4 py-2.5 text-sm font-medium text-[#E5E5E5] transition-colors"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-center text-[#E5E5E5]/60 mt-5">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-[#4F46E5] hover:text-[#3F3AC9]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
