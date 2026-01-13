/**
 * Password Reset Component
 *
 * This is a dedicated page component (not a modal) that handles password reset.
 * It's accessed in two ways:
 * 1. Via Supabase reset email link - User clicks reset link in email and arrives here
 * 2. Directly in the URL: /reset-password
 *
 * Features:
 * - Validates that user has a valid reset session
 * - Detects expired reset links and shows appropriate error
 * - Requires password confirmation
 * - Redirects to home page after successful reset
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { UserAuth } from "../../context/AuthContext";

export default function ResetPassword({ onClose }) {
  // Get current user session and navigation function
  const { session } = UserAuth();
  const navigate = useNavigate();

  // Form input states
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Track if reset link is expired
  const [linkExpired, setLinkExpired] = useState(false);

  /**
   * Check Reset Link Validity
   *
   * Runs on component mount to verify:
   * 1. User has a valid recovery session (provided by Supabase when clicking reset link)
   * 2. URL contains the required access_token in the hash
   *
   * If either is missing, the link has likely expired.
   */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session: recoverySession },
          error: sessionError,
        } = await supabase.auth.getSession();

        // If no session, check if there's an access token in the URL
        if (!recoverySession) {
          const hash = window.location.hash;
          if (!hash.includes("access_token")) {
            setLinkExpired(true);
            setError(
              "Link Expired. Please request a new password reset email."
            );
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };

    checkSession();
  }, []);

  /**
   * Handle Password Update Submission
   *
   * Validates the new password, checks session validity, and updates the user's password.
   * After successful update, redirects to home page.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Validate password confirmation match
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Verify session is still valid before attempting password update
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        setLinkExpired(true);
        setError("Your reset link has expired. Please request a new one.");
        setLoading(false);
        return;
      }

      // Update user password using the recovery session
      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        // Check if error indicates expired link
        if (
          error.message.toLowerCase().includes("expired") ||
          error.message.toLowerCase().includes("invalid")
        ) {
          setLinkExpired(true);
          setError("Your reset link has expired. Please request a new one.");
        } else {
          setError(error.message || "Failed to update password");
        }
      } else {
        setMessage("Password updated successfully. You can now log in.");

        // Redirect to home page with login form after short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate Back to Login
   *
   * Redirects user to home page where they can access the login form.
   */
  const handleBackToLogin = () => {
    window.location.href = "/";
  };

  return (
    <div className="auth-form">
      {/* Close Button */}
      <button
        className="close-btn"
        onClick={handleBackToLogin}
        aria-label="Close"
      >
        &times;
      </button>

      <h2>Choose a new password</h2>

      {/* Show expired link error with back button */}
      {linkExpired ? (
        <div>
          {error && <p className="auth-error">{error}</p>}
          <button
            onClick={handleBackToLogin}
            style={{ marginTop: "16px", width: "100%" }}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <>
          {/* Helper text if no session (user should check email) */}
          {!session && (
            <p style={{ color: "#ccc", marginBottom: "8px" }}>
              If you opened the reset link from your email, Supabase should have
              provided a temporary session. If you don't see a session, open the
              reset link again from your email so the session tokens get
              applied.
            </p>
          )}

          {/* Password reset form */}
          <form onSubmit={handleSubmit}>
            {/* New password input */}
            <input
              type="password"
              name="new-password"
              autoComplete="new-password"
              required
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Confirm password input */}
            <input
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              required
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {/* Error and success messages */}
            {error && <p className="auth-error">{error}</p>}
            {message && <p className="success-message">{message}</p>}

            {/* Submit button */}
            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
