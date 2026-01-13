import { UserAuth } from "../../context/AuthContext";

export default function SignOut() {
  const { session, signOut } = UserAuth();

  if (!session) return null;

  return (
    <button className="signout-btn" onClick={signOut}>
      Log Out
    </button>
  );
}
