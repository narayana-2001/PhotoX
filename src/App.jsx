/**
 * Main Application Component
 *
 * This is the root component of the Photo Gallery application.
 * It manages the main layout including navbar, sidebar, gallery, and authentication modal.
 *
 * Layout Structure:
 * - Navbar: Top navigation with auth button
 * - Sidebar: Profile selection panel
 * - MainGallery: Displays photos for selected profile
 * - Auth Modal: Login/Sign-up/Password reset forms
 */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MainGallery from "./components/MainGallery";
import SignUp from "./components/Auth/SignUp";
import SignOut from "./components/Auth/Signout";
import { UserAuth } from "./context/AuthContext";
import UploadButton from "./components/UploadButton";
import "./index.css";

export default function App() {
  // Get current user session from auth context
  const { session } = UserAuth();

  // State for managing auth modal visibility
  const [showSignUp, setShowSignUp] = useState(false);

  // State to track if password reset is needed (when user clicks reset link from email)
  const [showResetPassword, setShowResetPassword] = useState(false);

  // State for tracking which profile is selected in the sidebar
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  // State for managing the CSS animation class of the auth container
  const [containerClass, setContainerClass] = useState("auth-container");

  // State for managing the CSS animation class of the reset password container
  const [resetPasswordClass, setResetPasswordClass] =
    useState("auth-container");

  /**
   * Detect Password Reset Link from Email
   *
   * When user clicks the password reset link in their email, Supabase appends
   * recovery tokens to the URL hash. This effect detects those tokens and
   * opens the reset password form.
   */
  useEffect(() => {
    const hash = window.location.hash;
    // Check if URL contains recovery tokens (access_token and type=recovery)
    if (hash.includes("access_token") && hash.includes("type=recovery")) {
      setShowResetPassword(true);
    }
  }, []);

  /**
   * Handle Animation of Auth Modal
   *
   * When the modal opens or closes, apply the appropriate CSS class for smooth transitions.
   * When closing, ensure the container is removed from DOM after animation completes.
   */
  useEffect(() => {
    if (showSignUp) {
      setContainerClass("auth-container show");
    } else {
      setContainerClass("auth-container hide");
      // Remove the container from DOM after animation completes (300ms)
      const timeout = setTimeout(() => {
        setContainerClass("auth-container");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [showSignUp]);

  /**
   * Handle Animation of Reset Password Modal
   *
   * When the reset password modal opens or closes, apply the appropriate CSS class for smooth transitions.
   * When closing, ensure the container is removed from DOM after animation completes.
   */
  useEffect(() => {
    if (showResetPassword) {
      setResetPasswordClass("auth-container show");
    } else {
      setResetPasswordClass("auth-container hide");
      // Remove the container from DOM after animation completes (300ms)
      const timeout = setTimeout(() => {
        setResetPasswordClass("auth-container");
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [showResetPassword]);

  /**
   * Open Auth Modal
   *
   * Only shows the modal if user is not already logged in.
   */
  const openSignUp = () => {
    if (!session) setShowSignUp(true);
  };

  /**
   * Close Auth Modal
   */
  const closeSignUp = () => {
    setShowSignUp(false);
  };

  /**
   * Close Reset Password Form
   */
  const closeResetPassword = () => {
    setShowResetPassword(false);
  };

  return (
    <>
      {/* Navigation Bar - Contains app title and auth/logout button */}
      <Navbar onAuthClick={openSignUp}>
        {/* Show logout button only when logged in */}
        <SignOut />
      </Navbar>

      {/* Main Content Area */}
      <div className="container">
        {/* Sidebar - Allows user to select which profile's photos to view */}
        <Sidebar onProfileSelect={setSelectedProfileId} />
        {/* Gallery - Displays photos for the selected profile */}
        <MainGallery profileId={selectedProfileId} />
      </div>

      {/* Auth Modal Overlay - Shows login/signup/password reset forms */}
      <div
        className={containerClass}
        onClick={closeSignUp}
        aria-hidden={!showSignUp}
      >
        {showSignUp && (
          <div onClick={(e) => e.stopPropagation()}>
            <SignUp onClose={closeSignUp} />
          </div>
        )}
      </div>

      {/* Reset Password Modal - Shows when user clicks reset link from email */}
      {showResetPassword && (
        <div
          className={resetPasswordClass}
          onClick={closeResetPassword}
          aria-hidden={!showResetPassword}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SignUp onClose={closeResetPassword} initialMode="reset" />
          </div>
        </div>
      )}
    </>
  );
}
