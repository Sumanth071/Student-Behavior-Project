import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import apiClient from "../api/apiClient.js";
import Sidebar from "../components/common/Sidebar.jsx";
import Topbar from "../components/common/Topbar.jsx";
import { useAuth } from "../hooks/useAuth.js";

const DashboardLayout = ({ children }) => {
  const { token } = useAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) {
        return;
      }

      try {
        const notifications = await apiClient.get("/notifications", { token });
        setNotificationCount(notifications.filter((entry) => entry.isActive).length);
      } catch (error) {
        setNotificationCount(0);
      }
    };

    fetchNotifications();
  }, [pathname, token]);

  return (
    <div className="min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notificationCount={notificationCount}
      />

      <div className="lg:pl-80">
        <main className="min-h-screen px-4 py-4 md:px-6 lg:px-8">
          <div className="subtle-grid min-h-[calc(100vh-2rem)] rounded-[32px] p-3 md:p-4">
            <Topbar
              onMenuClick={() => setSidebarOpen(true)}
              notificationCount={notificationCount}
            />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
