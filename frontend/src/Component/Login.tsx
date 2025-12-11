import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface ILoginData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ILoginData>({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add("page-login");
    return () => document.body.classList.remove("page-login");
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage("");
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      alert("Email and password are required");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (res.status === 200) {
        const body = await res.json();
        
        // Store the access token in localStorage
        localStorage.setItem("accessToken", body.accessToken);
        localStorage.setItem("user", JSON.stringify(body.user));
        
        setData({ email: "", password: "" });
        
        // Immediately redirect to dashboard (no alert needed)
        navigate("/dashboard");
      } else {
        const body = await res.json();
        alert(body.message || "Login failed");
      }
    } catch (err) {
      console.error('Login request error:', err);
      // show a more specific message when possible
      const msg = err instanceof Error ? err.message : 'Network or server error';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="container">
      <div className="login-container">
        <div className="circle circle-one" />

        <div className="form-container">
          <h1 className="opacity">LOGIN</h1>

          <form onSubmit={handleFormSubmit}>
            <input
              type="email"
              name="email"
              placeholder="EMAIL"
              value={data.email}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              value={data.password}
              onChange={handleInputChange}
            />
            <button className="opacity" disabled={isLoading}>
              {isLoading ? "LOGGING IN..." : "SUBMIT"}
            </button>
          </form>

          {message && (
            <p className="opacity" style={{ color: "white", marginTop: "10px" }}>
              {message}
            </p>
          )}

          <div className="register-forget opacity">
            <Link to="/register">REGISTER</Link>
            <Link to="/forgot-password">FORGOT PASSWORD</Link>
          </div>
        </div>

        <div className="circle circle-two" />
      </div>
    </section>
  );
};

export default Login;
