import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-navy-950">
      {/* Left: brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-14 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-accent flex items-center justify-center font-display font-bold">TM</div>
          <div>
            <p className="font-display font-semibold">Internship Management System</p>
            <p className="text-xs text-steel-400">Tata Motors</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl leading-tight mb-4">
            One platform for the full internship lifecycle.
          </h1>
          <p className="text-steel-400 text-sm leading-relaxed">
            Onboarding, mentor allocation, project assignment, tasks, attendance,
            weekly reports and performance evaluation — coordinated in one place
            for Admins, Mentors and Interns.
          </p>
        </div>

        <p className="relative text-xs text-steel-400">
          Tata Motors passenger vehicles,Pune.
        </p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-canvas">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded bg-navy-950 flex items-center justify-center font-display font-bold text-white">TM</div>
            <p className="font-display font-semibold text-navy-950">Internship IMS</p>
          </div>

          <h2 className="font-display text-2xl font-semibold text-navy-950 mb-1">Sign in</h2>
          <p className="text-sm text-steel-600 mb-6">Enter your credentials to access your dashboard.</p>

          {error && <Alert type="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                required
                className="input"
                placeholder="you@tatamotors-ims.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-8 border-t border-steel-200 pt-5">
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
