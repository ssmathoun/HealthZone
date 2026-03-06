import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const API_URL = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/php/signup.php";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          username: form.name, // map name to username for PHP
          password: form.password,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.status === "error") {
        setError(data.message || "Signup failed");
        return;
      }

      // Success
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      navigate("/login");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="logo">HealthZone</div>

      <div className="auth-card">
        <h1 className="auth-title">Sign Up</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="name">
            Name:
          </label>
          <input
            id="name"
            name="name"
            className="auth-input"
            type="text"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
          />

          <label className="auth-label" htmlFor="email">
            Email:
          </label>
          <input
            id="email"
            name="email"
            className="auth-input"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <label className="auth-label" htmlFor="password">
            Password:
          </label>
          <input
            id="password"
            name="password"
            className="auth-input"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <label className="auth-label" htmlFor="confirmPassword">
            Confirm Password:
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            className="auth-input"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />

          {error && <div className="auth-error">{error}</div>}

          <button
            className="auth-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link className="auth-link" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
