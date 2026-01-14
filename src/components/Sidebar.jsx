import { useEffect, useState } from "react";
import { UserAuth } from "../context/AuthContext";
import { supabase } from "../supabaseClient";
import SignUp from "./Auth/SignUp";

export default function Sidebar({ onProfileSelect }) {
  const { session, signOut } = UserAuth();
  const [profiles, setProfiles] = useState([]); // array of { id, name }
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  useEffect(() => {
    if (session) fetchProfiles();
    else setProfiles([]);
  }, [session]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // List all files at root and derive unique folder names (user ids)
      const { data, error } = await supabase.storage.from("images").list("", {
        limit: 1000,
      });

      if (error) throw error;

      // data may contain file names like "<userId>/<file>" or top-level files
      const folders = new Set();
      data.forEach((item) => {
        // If item.name contains a slash, extract prefix, else treat as top-level
        const parts = item.name.split("/");
        if (parts.length > 1) folders.add(parts[0]);
      });

      // Ensure current user is included even if they have no files yet
      if (session?.user?.id) folders.add(session.user.id);

      const profileList = Array.from(folders).map((id) => ({
        id,
        // For current user show email prefix; for others, shorten id
        name:
          id === session?.user?.id
            ? (session.user.email || "").split("@")[0] || id.slice(0, 8)
            : `User-${id.slice(0, 6)}`,
      }));

      setProfiles(profileList);
    } catch (err) {
      console.error("Failed to list profiles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClickProfile = (id) => {
    if (onProfileSelect) onProfileSelect(id);
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      // Call Supabase admin function to delete user
      const { error } = await supabase.auth.admin.deleteUser(session.user.id);
      if (error) throw error;

      // Sign out after deletion
      await signOut();
      alert("Account deleted successfully.");
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account. Please try again.");
    }
  };

  if (!session) {
    return (
      <div className="sidebar">
        <p style={{ color: "#ccc" }}>You must be logged in to view this</p>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <img
          className="img"
          src="https://freesvg.org/img/abstract-user-flat-4.png"
          alt="profile"
        />
        <div style={{ color: "#fff", fontWeight: "bold" }}>Profiles</div>
      </div>

      <hr style={{ borderColor: "#333" }} />
      {loading && <p style={{ color: "#ccc" }}>Loading...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {profiles.map((p) => (
          <button
            key={p.id}
            onClick={() => handleClickProfile(p.id)}
            style={{
              background: "transparent",
              border: "1px solid #333",
              color: "#fff",
              padding: "8px 10px",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div style={{ marginTop: "auto", color: "#777" }}>Made in 2025</div>

      {/* Settings Icon */}
      <div style={{ position: "relative", marginTop: 16 }}>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 20,
            cursor: "pointer",
            marginLeft: "auto",
            display: "block",
          }}
          title="Settings"
        >
          ⚙️
        </button>

        {/* Settings Menu */}
        {showSettings && (
          <div
            style={{
              position: "absolute",
              bottom: 30,
              right: 0,
              background: "#1a1a1a",
              border: "1px solid #7701ff",
              borderRadius: 4,
              minWidth: 180,
              zIndex: 100,
            }}
          >
            <button
              onClick={() => {
                setShowResetPasswordModal(true);
                setShowSettings(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                color: "#fff",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Reset Password
            </button>
            <hr style={{ margin: 0, borderColor: "#333" }} />
            <button
              onClick={() => {
                handleDeleteAccount();
                setShowSettings(false);
              }}
              style={{
                display: "block",
                width: "100%",
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                color: "#ff6b6b",
                textAlign: "left",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Delete Account
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showResetPasswordModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={() => setShowResetPasswordModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <SignUp
              onClose={() => setShowResetPasswordModal(false)}
              initialMode="reset"
            />
          </div>
        </div>
      )}
    </div>
  );
}
