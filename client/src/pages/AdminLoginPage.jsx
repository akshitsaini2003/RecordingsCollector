import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import api from "../api/client";
import Spinner from "../components/Spinner";
import { getAdminToken, setAdminToken } from "../utils/auth";

const getFriendlyErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const existingToken = getAdminToken();
  const redirectPath = location.state?.from || "/admin/dashboard";

  if (existingToken) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await api.post("/api/admin/login", {
        username: username.trim(),
        password
      });

      setAdminToken(response.data.token);
      navigate(redirectPath, { replace: true });
    } catch (error) {
      setErrorMessage(
        getFriendlyErrorMessage(
          error,
          "We could not sign you in. Please try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <section className="w-full max-w-md rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-panel backdrop-blur">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-reef/80">
          Protected Access
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">
          Admin Login
        </h1>
        <p className="mt-3 text-base text-ink/70">
          Sign in to review recordings, search submissions, and download files.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-ink/15 bg-mist/80 px-4 py-3 text-base text-ink outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/10 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-ink"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-2xl border border-ink/15 bg-mist/80 px-4 py-3 text-base text-ink outline-none transition focus:border-reef focus:ring-4 focus:ring-reef/10 disabled:cursor-not-allowed disabled:opacity-70"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-ember/20 bg-ember/10 px-4 py-3 text-sm font-medium text-ember">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-2xl bg-ink px-6 py-3.5 font-semibold text-white transition hover:bg-reef disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <Spinner label="Signing in..." tone="light" />
            ) : (
              "Login"
            )}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AdminLoginPage;
