import { UserAuth } from "../context/AuthContext";

export default function Navbar({ onAuthClick }) {
  const { session, signOut } = UserAuth();

  return (
    <div className="navbar">
      <div>
        <img src="/PhotoX.png" alt="PhotoX Logo" className="navbar-logo" />
      </div>

      <div className="welcome-sign">
        <p>Welcome to Photo X</p>
      </div>

      <div className="authentication">
        {!session ? (
          <button className="auth-button" onClick={onAuthClick}>
            Sign Up / Login
          </button>
        ) : (
          <button className="auth-button" onClick={signOut}>
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}
