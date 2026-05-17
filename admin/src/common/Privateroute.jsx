import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const Privateroute = ({ requiredRole }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // 🔒 Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🛑 Admin route protection
  if (requiredRole === "admin" && !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authorized access
  return <Outlet />;
};

export default Privateroute;
