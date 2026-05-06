import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // ❌ No token → redirect to login
    return <Navigate to="/admin-login" replace />;
  }

  // ✅ Token found → allow access
  return <>{children}</>;
};

export default ProtectedRoute;
