/**
 * Supabase Client Configuration
 *
 * This file initializes and exports the Supabase client instance that is used throughout
 * the application for authentication and database operations.
 *
 * Environment variables required:
 * - VITE_SUPABASE_URL: The URL of the Supabase project
 * - VITE_SUPABASE_ANON_KEY: The anonymous API key for public operations
 */

import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Creates a Supabase client instance with the provided credentials.
 * This instance is used for all authentication and database operations.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
