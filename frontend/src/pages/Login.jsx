import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // OAuth Modal State
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [oauthProvider, setOauthProvider] = useState(null); // 'google' | 'github'
  const [oauthEmail, setOauthEmail] = useState("");
  const [oauthError, setOauthError] = useState("");
  const [isVerifyingOAuth, setIsVerifyingOAuth] = useState(false);

  const { login, loginWithOAuth } = useAuth();
  const { tr } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsAuthenticating(true);
    try {
      const success = await login(username, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError(tr("Incorrect admin name or password. Please try again."));
      }
    } catch {
      setError(tr("Authentication server error. Please try again."));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const openOAuthDialog = (provider) => {
    setError("");
    setOauthError("");
    setOauthProvider(provider);
    setOauthEmail(provider === "google" ? "jayasric776@gmail.com" : "");
    setOauthModalOpen(true);
  };

  const handleOAuthSubmit = async (e) => {
    e.preventDefault();
    setOauthError("");

    const trimmedEmail = oauthEmail.trim();
    if (!trimmedEmail) {
      setOauthError(tr("Please enter your email address to continue."));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setOauthError(tr("Please enter a valid email address (e.g. name@domain.com)."));
      return;
    }

    if (oauthProvider === "google" && !trimmedEmail.toLowerCase().includes("gmail.com") && !trimmedEmail.toLowerCase().includes("@")) {
      setOauthError(tr("Please provide a valid Google Mail (@gmail.com) account."));
      return;
    }

    setIsVerifyingOAuth(true);

    try {
      // Extract clean name from email or format nicely
      const namePart = trimmedEmail.split("@")[0];
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1).replace(/[._]/g, " ");

      const profile = {
        name: formattedName || "Temple Authorized Devotee",
        email: trimmedEmail,
        avatar: oauthProvider === "google"
          ? "https://lh3.googleusercontent.com/a/default-user"
          : "https://github.com/identicons/user.png"
      };

      const success = await loginWithOAuth(oauthProvider, profile);
      if (success) {
        setOauthModalOpen(false);
        navigate(from, { replace: true });
      } else {
        setOauthError(tr("OAuth verification failed. Please try again."));
      }
    } catch (err) {
      console.error("OAuth authentication error:", err);
      setOauthError(tr("Could not connect to OAuth service. Please try again."));
    } finally {
      setIsVerifyingOAuth(false);
    }
  };

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p className="login-eyebrow">{tr("Arupadai Veedu · Coastal Shrine")}</p>
        </div>
        <h1 className="login-title">{tr("Temple Admin Login")}</h1>
        <p className="login-sub">
          {tr("Subramaniya Swamy Temple, Tiruchendur — Activity Management")}
        </p>

        {/* OAuth Authentication Buttons */}
        <div className="oauth-section" style={{ marginBottom: "1.25rem" }}>
          <button
            type="button"
            className="btn-outline"
            onClick={() => openOAuthDialog("google")}
            disabled={isAuthenticating}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", borderRadius: "8px", background: "#fff", cursor: "pointer", border: "1px solid #cbd5e1" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span style={{ fontWeight: "600", fontSize: "0.88rem", color: "#1e293b" }}>{tr("Sign in with Google")}</span>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", margin: "1rem 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color, #e2e8f0)" }}></div>
          <span style={{ padding: "0 10px" }}>{tr("OR WITH CREDENTIALS")}</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color, #e2e8f0)" }}></div>
        </div>

        <label className="login-label" htmlFor="username">
          {tr("Admin Name / Username")}
        </label>
        <input
          id="username"
          className="login-input"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={tr("Enter admin name (e.g. admin)")}
          required
        />

        <label className="login-label" htmlFor="password">
          {tr("Password")}
        </label>
        <input
          id="password"
          className="login-input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={tr("Enter password")}
          required
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="btn-primary login-submit" disabled={isAuthenticating}>
          {isAuthenticating ? tr("Authenticating...") : tr("Log In")}
        </button>
      </form>

      {/* OAuth Email Verification Dialog Modal */}
      {oauthModalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "16px"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            width: "100%",
            maxWidth: "420px",
            padding: "24px",
            animation: "fadeIn 0.2s ease-out"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
              {oauthProvider === "google" ? (
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e2e8f0" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                </div>
              ) : (
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </div>
              )}
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#0f172a" }}>
                  {oauthProvider === "google" ? tr("Sign in with Google") : tr("Sign in with GitHub")}
                </h3>
                <p style={{ margin: 0, fontSize: "0.82rem", color: "#64748b" }}>
                  {tr("OAuth 2.0 Account Verification")}
                </p>
              </div>
            </div>

            <form onSubmit={handleOAuthSubmit}>
              <p style={{ fontSize: "0.88rem", color: "#334155", marginBottom: "12px", lineHeight: "1.4" }}>
                {tr("Please enter your email address to verify your account and complete OAuth authentication:")}
              </p>

              <label htmlFor="oauth-email-input" style={{ display: "block", fontSize: "0.82rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>
                {tr("Email Address")}
              </label>
              <input
                id="oauth-email-input"
                type="email"
                className="login-input"
                value={oauthEmail}
                onChange={(e) => setOauthEmail(e.target.value)}
                placeholder={oauthProvider === "google" ? "e.g. jayasric776@gmail.com" : "e.g. user@domain.com"}
                autoFocus
                required
                style={{ width: "100%", boxSizing: "border-box", marginBottom: "12px" }}
              />

              {oauthError && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "8px 12px", borderRadius: "6px", fontSize: "0.82rem", marginBottom: "12px" }}>
                  {oauthError}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setOauthModalOpen(false)}
                  disabled={isVerifyingOAuth}
                  style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "0.88rem" }}
                >
                  {tr("Cancel")}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isVerifyingOAuth}
                  style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "0.88rem" }}
                >
                  {isVerifyingOAuth ? tr("Verifying Email...") : tr("Verify & Sign In")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
