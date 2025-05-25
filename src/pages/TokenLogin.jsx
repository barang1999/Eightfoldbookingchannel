import { signInWithCustomToken } from "firebase/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

export default function TokenLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    const redirectBack = new URLSearchParams(window.location.search).get("redirectBack");

    if (token) {
      signInWithCustomToken(auth, token)
        .then(() => {
          if (redirectBack) {
            window.location.href = redirectBack;
          } else {
            navigate("/");
          }
        })
        .catch((err) => {
          console.error("Custom token login failed:", err);
          navigate("/login");
        });
    } else if (auth.currentUser) {
      console.log("[TokenLogin] Using currentUser from Firebase.");
      auth.currentUser.getIdToken().then((token) => {
        if (redirectBack) {
          window.location.href = redirectBack;
        } else {
          navigate("/");
        }
      });
    } else {
      console.warn("[TokenLogin] No token or currentUser found.");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-800 mx-auto mb-4"></div>
        <p className="text-gray-700 text-lg font-medium">Logging you in, please wait...</p>
      </div>
    </div>
  );
}