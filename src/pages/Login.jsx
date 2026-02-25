import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/shabad_signup_backend/signup.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.status === "success") {
        localStorage.setItem("username", data.user.username);
        alert("Login successful!");
        window.location.href = "https://aptitude.cse.buffalo.edu/CSE442/2026-Spring/cse-442v/healthzone/";
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to connect to backend script.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: "red" }}>{error}</p>}
          <button disabled={loading}>{loading ? "Checking..." : "Login"}</button>
        </form>
      </div>
    </div>
  );
}