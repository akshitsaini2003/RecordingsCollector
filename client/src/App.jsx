import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import RegisterPage from "./pages/RegisterPage";
import UploadPage from "./pages/UploadPage";
import UserLoginPage from "./pages/UserLoginPage";
import { getAdminToken, getUserToken } from "./utils/auth";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<UserLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        element={
          <ProtectedRoute
            getToken={getUserToken}
            redirectTo="/login"
          />
        }
      >
        <Route path="/" element={<UploadPage />} />
      </Route>
      <Route
        element={
          <ProtectedRoute
            getToken={getAdminToken}
            redirectTo="/admin/login"
          />
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
