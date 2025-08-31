import React, { useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getMe } from "../services/auth";

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");
  const didStart = useRef(false);

  useEffect(() => {
    if (didStart.current) return; // guard against double calls in strict mode
    didStart.current = true;

    (async () => {
      try {
        await getMe();
        setStatus("authorized");
      } catch (_err) {
        // Network/API failure → treat as unauthorized to avoid locking users out
        setStatus("unauthorized");
      }
    })();
  }, []);

  if (status === "loading") {
    // Lightweight placeholder to avoid flashing redirects
    return <div style={{ padding: 16 }}>Checking your session…</div>;
  }

  if (status === "authorized") {
    return children;
  }

  return <Navigate to="/signin" replace state={{ from: location }} />;
};

export default PrivateRoute;