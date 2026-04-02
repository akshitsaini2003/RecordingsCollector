import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectedRoute({ getToken, redirectTo }) {
  const location = useLocation();
  const token = getToken();

  if (!token) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
