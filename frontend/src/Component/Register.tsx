import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

interface IUserModel {
  email: string;
  username: string;
  password: string;
}

const Register = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<IUserModel>({
    email: "",
    username: "",
    password: "",
  });

  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    document.body.classList.add("page-register");
    return () => document.body.classList.remove("page-register");
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

    if (!data.email || !data.username || !data.password) {
      alert("All fields are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 201) {
        const body = await res.json();
        
        // Store the access token and user in localStorage
        localStorage.setItem("accessToken", body.accessToken);
        localStorage.setItem("user", JSON.stringify(body.user));
        
        setData({ email: "", username: "", password: "" });
        
        // Immediately redirect to dashboard (no alerts needed)
        navigate("/dashboard");
      } else {
        const body = await res.json();
        alert(body.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network or server error");
    }
  };

  return (
    <section className="container">
      <div className="login-container">
        <div className="circle circle-one" />

        <div className="form-container">
          <h1 className="opacity">REGISTER</h1>

          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={data.email}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="username"
              placeholder="USERNAME"
              value={data.username}
              onChange={handleInputChange}
            />
            <input
              type="password"
              name="password"
              placeholder="PASSWORD"
              value={data.password}
              onChange={handleInputChange}
            />
            <button className="opacity">CREATE ACCOUNT</button>
          </form>

           {message && <p className="opacity" style={{ color: "white", marginTop: "10px" }}>{message}</p>}


          <div className="register-forget opacity">
            <Link to="/login">BACK TO LOGIN</Link>
            <Link to="/forgot-password">NEED HELP?</Link>
          </div>
        </div>

        <div className="circle circle-two" />
      </div>
    </section>
  );
};

export default Register;
