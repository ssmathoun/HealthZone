import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/auth.css";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    // Mock submit (frontend only)
    setTimeout(() => {
      setLoading(false);
      alert("Signup successful (mock)");
    }, 1000);
  };

  return (
    
    <div className="auth-container">
        <div className="logo">HealthZone</div>
      <div className="auth-card">
        <h2>Sign Up</h2>

        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input name="name" onChange={handleChange} />

          <label>Email:</label>
          <input name="email" type="email" onChange={handleChange} />

          <label>Password:</label>
          <input name="password" type="password" onChange={handleChange} />

          <label>Confirm Password:</label>
          <input name="confirmPassword" type="password" onChange={handleChange} />

          {error && <p className="error">{error}</p>}

          <button disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <p className="switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}