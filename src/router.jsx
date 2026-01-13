/**
 * Application Router Configuration
 *
 * Defines all routes in the application using React Router.
 * Each route maps a URL path to a specific component.
 *
 * Routes:
 * - "/" - Main app page with gallery, sidebar, navbar, and auth forms
 *
 * Note: Password reset is now handled on the home page. When user clicks
 * a Supabase reset link, it redirects to "/" with recovery tokens in the URL hash.
 * The App component detects these tokens and shows the reset password form.
 */

import { createBrowserRouter } from "react-router-dom";
import App from "./App";

/**
 * Router configuration object
 *
 * Creates the browser router with defined routes.
 * This router is passed to RouterProvider in Main.jsx for navigation functionality.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);
