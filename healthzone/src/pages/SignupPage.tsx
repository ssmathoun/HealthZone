import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/signup.php";

export function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirmPassword) { setError("All fields are required"); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, username: form.name, password: form.password, confirmPassword: form.confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.status === "error") { setError(data.message || "Signup failed"); return; }
      navigate("/login");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e293b] flex flex-col items-center justify-center px-4">
      <div className="mb-8">
        <span className="text-3xl font-bold"><span className="text-[#d97706]">Health</span><span className="text-white">Zone</span></span>
      </div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1e293b] mb-6 text-center">Sign Up</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1e293b] mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name" placeholder="Your name" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e293b] mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e293b] mb-1">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} autoComplete="new-password" placeholder="••••••••" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e293b] mb-1">Confirm Password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" placeholder="••••••••" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] bg-white" />
          </div>
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg">{error}</div>}
          <button onClick={handleSubmit} disabled={loading} className={`w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all ${loading ? 'bg-gray-400' : 'bg-[#d97706] hover:bg-[#b45309] shadow-md active:scale-[0.98]'}`}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
        <p className="text-center text-sm text-[#64748b] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#d97706] font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
