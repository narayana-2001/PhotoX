/**
 * Sign Up / Login / Forgot Password / Reset Password Component
 *
 * This is a multi-mode authentication component that handles:
 * 1. Login - Authenticate existing users with email/password
 * 2. Sign Up - Register new users and send confirmation email
 * 3. Forgot Password - Send password reset email
 * 4. Reset Password - Set new password (for in-app password changes)
 *
 * The component uses a mode-based state system to switch between these forms.
 * Default mode is "login" to encourage existing users to sign in first.
 */

import { useState, useEffect } from "react";
import { UserAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

export default function SignUp({ onClose, initialMode = "login" }) {
  // Get auth methods from context
  const { signUpNewUser, signInUser, resendConfirmationEmail } = UserAuth();

  // Form mode: "signup", "login", "forgot", or "reset"
  const [mode, setMode] = useState(initialMode);

  // Controls fade-in animation when component mounts
  const [showAnimation, setShowAnimation] = useState(false);

  // Form input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  /**
   * Trigger fade-in animation on component mount
   */
  useEffect(() => {
    setShowAnimation(true);
  }, []);

  /**
   * Handle Form Submission
   *
   * Routes to different handlers based on the current mode:
   * - login: Authenticate user and close modal
   * - signup: Create new account and send confirmation email
   * - forgot: Send password reset email
   * - reset: Update password for logged-in user
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // ============================================
      // LOGIN MODE
      // ============================================
      if (mode === "login") {
        const result = await signInUser(email, password);
        setLoading(false);

        if (!result.success) {
          // Check if error is related to unconfirmed email
          if (
            result.error.toLowerCase().includes("email") ||
            result.error.toLowerCase().includes("confirm")
          ) {
            const resend = window.confirm(
              "Your email is not confirmed or the link has expired.\n\nResend confirmation email?"
            );
            if (resend) {
              const resendResult = await resendConfirmationEmail(email);
              if (resendResult.success) {
                alert("Confirmation email resent. Please check your inbox.");
              } else {
                alert("Failed to resend confirmation email.");
              }
            }
            return;
          }
          setError(result.error);
          return;
        }
        // Close modal on successful login
        onClose();
      }

      // ============================================
      // SIGNUP MODE
      // ============================================
      else if (mode === "signup") {
        const result = await signUpNewUser(email, password);
        setLoading(false);

        if (!result.success) {
          setError(result.error);
          return;
        }

        alert(
          "Account created!\n\nPlease check your email to confirm your account before logging in."
        );
        // Switch to login mode after successful signup
        setMode("login");
      }

      // ============================================
      // FORGOT PASSWORD MODE
      // ============================================
      else if (mode === "forgot") {
        const redirectUrl = `${window.location.origin}/`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(
          email,
          { redirectTo: redirectUrl }
        );

        setLoading(false);
        if (resetError) {
          setError(resetError.message || "Failed to send reset email");
        } else {
          setMessage(
            "Password reset email sent! Check your inbox for the link. If you don't see it, check your spam folder."
          );
          setEmail("");
        }
      }

      // ============================================
      // RESET PASSWORD MODE (logged-in user)
      // ============================================
      else if (mode === "reset") {
        // Validate password strength
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        // Validate password confirmation
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password,
        });

        setLoading(false);
        if (updateError) {
          setError(updateError.message || "Failed to update password");
        } else {
          setMessage("Password updated successfully!");
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || "Unexpected error");
    }
  };

  // Determine form CSS class based on animation state
  const formClass = `auth-form ${showAnimation ? "show" : "hide"}`;

  return (
    <div className={formClass}>
      {/* Close Button */}
      <button className="close-btn" onClick={onClose} aria-label="Close form">
        &times;
      </button>

      {/* Form Title - Changes based on current mode */}
      <h2>
        {mode === "login"
          ? "Login"
          : mode === "signup"
          ? "Sign Up"
          : mode === "forgot"
          ? "Reset Password"
          : "Set New Password"}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Email field - shown for login, signup, and forgot password modes */}
        {(mode === "login" || mode === "signup" || mode === "forgot") && (
          <input
            type="email"
            name="email"
            autoComplete="username"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        )}

        {/* Password field - shown for login and signup modes */}
        {(mode === "login" || mode === "signup") && (
          <input
            type="password"
            name="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {/* Password confirmation fields - shown for reset mode only */}
        {mode === "reset" && (
          <>
            <input
              type="password"
              name="new-password"
              autoComplete="new-password"
              required
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              required
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </>
        )}

        {/* Error and success messages */}
        {error && <p className="auth-error">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        {/* Submit button - Label changes based on mode */}
        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Login"
            : mode === "signup"
            ? "Create Account"
            : mode === "forgot"
            ? "Send reset email"
            : "Update password"}
        </button>
      </form>

      <hr />

      {/* Navigation Links - Allows switching between modes */}
      <div className="register-content">
        {/* Login Mode - Show signup and forgot password links */}
        {mode === "login" && (
          <>
            <p onClick={() => setMode("signup")} style={{ cursor: "pointer" }}>
              Don't have an account? Sign Up
            </p>
            <p
              onClick={() => {
                setMode("forgot");
                setEmail("");
                setError("");
              }}
              style={{ cursor: "pointer", color: "#7701ff" }}
            >
              Forgot Password?
            </p>
          </>
        )}

        {/* Signup Mode - Show login link */}
        {mode === "signup" && (
          <p onClick={() => setMode("login")} style={{ cursor: "pointer" }}>
            Already have an account? Login
          </p>
        )}

        {/* Forgot Password Mode - Show back to login link */}
        {mode === "forgot" && (
          <>
            {!message && (
              <p onClick={() => setMode("login")} style={{ cursor: "pointer" }}>
                Back to Login
              </p>
            )}
            {message && (
              <p
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                style={{ cursor: "pointer", color: "#7701ff" }}
              >
                Back to Login
              </p>
            )}
          </>
        )}

        {/* Reset Mode - Show helper text */}
        {mode === "reset" && (
          <p style={{ color: "#999", fontSize: 12 }}>
            Use this form to set a new password for your account
          </p>
        )}
      </div>
    </div>
  );
}
