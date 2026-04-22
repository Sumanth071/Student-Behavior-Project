import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { useAuth } from "./hooks/useAuth.js";
import AttendancePage from "./pages/AttendancePage.jsx";
import BehaviourPage from "./pages/BehaviourPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import MarksPage from "./pages/MarksPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";

const ProtectedShell = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dashboard-light px-6 dark:bg-dashboard-dark">
        <div className="card-surface flex items-center gap-3 px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-200">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-500" />
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

const PublicOnlyRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />;
};

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute />} />
          <Route path="/" element={<ProtectedShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="marks" element={<MarksPage />} />
            <Route path="behaviour" element={<BehaviourPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
