import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    setError("");
    setLoading(true);

    // Mock login
    setTimeout(() => {
      setLoading(false);
      alert("Login successful (mock)");
    }, 1000);
  };

  return (
    <div className="auth-container">
        <div className="logo">HealthZone</div>
      <div className="auth-card">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input type="email" onChange={(e) => setEmail(e.target.value)} />

          <label>Password:</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} />

          {error && <p className="error">{error}</p>}

          <button disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="switch">
          Don’t have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}