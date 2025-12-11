import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1: email input, 2: reset password

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:4000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        // For development, if resetToken is returned, move to step 2
        if (data.resetToken) {
          setResetToken(data.resetToken);
          setStep(2);
        } else {
          setMessage("If an account exists with this email, check your inbox for password reset instructions.");
        }
      } else {
        setMessage(data.message || "Error processing request");
      }
    } catch (err) {
      setMessage("Error: Unable to process request");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setMessage(data.message || "Error resetting password");
      }
    } catch (err) {
      setMessage("Error: Unable to reset password");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Reset Password</h2>

      {step === 1 ? (
        <form onSubmit={handleEmailSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      {message && <p className="message">{message}</p>}

      <button
        type="button"
        onClick={() => navigate("/login")}
        className="back-link"
      >
        Back to Login
      </button>
    </div>
  );
};

export default ForgotPassword;
