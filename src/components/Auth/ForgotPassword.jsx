/**
 * Forgot Password Component
 *
 * This component sends a password reset email to the user's registered email address.
 * Note: This component is currently not actively used as the forgot password functionality
 * is integrated into the SignUp component's "forgot" mode.
 *
 * This file is kept for potential future use or as a standalone alternative implementation.
 * The reset link from Supabase redirects to the /reset-password route (ResetPassword.jsx).
 */

import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function ForgotPassword({ onClose }) {
  // Form input states
  const [email, setEmail] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /**
   * Handle Password Reset Email Submission
   *
   * Sends a password reset email to the provided email address.
   * Supabase will send an email with a reset link that redirects to localhost page
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const redirectTo = `${window.location.origin}/`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase(),
        { redirectTo }
      );
      if (resetError) {
        setError(resetError.message || "Failed to send reset email");
      } else {
        setMessage("Password reset email sent. Check your inbox.");
        setEmail("");
      }
    } catch (err) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      {/* Close Button */}
      <button className="close-btn" onClick={onClose} aria-label="Close">
        &times;
      </button>

      <form onSubmit={handleSubmit}>
        {/* Email input field */}
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          placeholder="Your account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Error and success messages */}
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        {/* Submit button */}
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset email"}
        </button>
      </form>
    </div>
  );
}
