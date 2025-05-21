import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

export default function TokenLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    const redirectBack = new URLSearchParams(window.location.search).get("redirectBack");

    if (token) {
      const credential = GoogleAuthProvider.credential(token);
      signInWithCredential(auth, credential)
        .then(() => {
          if (redirectBack) {
            window.location.href = redirectBack;
          } else {
            navigate("/");
          }
        })
        .catch((err) => {
          console.error("Token login failed:", err);
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

  return <p>Logging in...</p>;
}