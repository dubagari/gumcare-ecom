import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const Privateroute = ({ requiredRole }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // actual role from redux shape
  const role = user?.user?.role;

  // 🔒 Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🛑 Role protection
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authorized
  return <Outlet />;
};

export default Privateroute;
