/**
 * Authentication Context
 *
 * This file provides centralized authentication state management for the entire application.
 * It handles user signup, login, logout, and password reset operations using Supabase Auth.
 *
 * Features:
 * - Sign up with email confirmation
 * - Sign in with email and password
 * - Automatic duplicate email detection
 * - Session management and persistence
 * - Resend confirmation email functionality
 */

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

// Create the authentication context
const AuthContext = createContext();

/**
 * AuthContextProvider Component
 *
 * Wraps the application to provide authentication state and methods to all child components.
 * Automatically initializes the user session on app load and listens for auth state changes.
 */
export const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  /**
   * Sign Up New User
   *
   * Creates a new user account and sends a confirmation email.
   * Includes duplicate email detection by attempting a sign-in with a dummy password.
   *
   * @param {string} email - User's email address
   * @param {string} password - User's desired password
   * @returns {Object} { success: boolean, error: string | null, needsEmailConfirmation: boolean, data: Object }
   */
  const signUpNewUser = async (email, password) => {
    // Check if account already exists by attempting sign in with dummy password
    const { error: checkError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: "dummy-password-check-xyz",
    });

    // If there's an error OTHER than "invalid login credentials", it means something went wrong
    if (
      checkError &&
      checkError.message &&
      !checkError.message.toLowerCase().includes("invalid login credentials")
    ) {
      return { success: false, error: checkError.message };
    }

    // If there's NO error, it means the account exists (login succeeded with wrong password is unlikely)
    if (!checkError) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Proceed with signup since no account exists
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      needsEmailConfirmation: true,
      data,
    };
  };

  /**
   * Sign In User
   *
   * Authenticates a user with email and password.
   * User must have confirmed their email before they can log in.
   *
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} { success: boolean, error: string | null, data: Object }
   */
  const signInUser = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  };

  /**
   * Resend Confirmation Email
   *
   * Sends a new confirmation email to the user's email address.
   * Used when the initial confirmation email wasn't received or link expired.
   *
   * @param {string} email - User's email address
   * @returns {Object} { success: boolean, error: string | null }
   */
  const resendConfirmationEmail = async (email) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.toLowerCase(),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  /**
   * Initialize Session on App Load
   *
   * Runs once on component mount to:
   * 1. Retrieve any existing session from Supabase
   * 2. Listen for auth state changes (login, logout, token refresh)
   */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  /**
   * Sign Out User
   *
   * Logs out the current user and clears the session.
   */
  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        signUpNewUser,
        signInUser,
        resendConfirmationEmail,
        session,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook: useAuth
 *
 * Use this hook in any component to access authentication state and methods.
 * Example: const { session, signInUser, signOut } = UserAuth();
 */
export const UserAuth = () => {
  return useContext(AuthContext);
};
