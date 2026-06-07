import { useEffect, useState } from "react";
import axios from "axios";

import {
  Outlet,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  BUILT_IN_API_URLS,
  SIDEBAR_BUTTONS,
  type UserRole,
} from "../constants";

import Sidebar from "../components/Sidebar";
import TopNav from "../components/TopNav";
import Loading from "../components/Loading";
import PrivateFooter from "../components/PrivateFooter";

type User = {
  id: string;
  email: string;
  role: UserRole
};

export default function PrivateLayout() {
  const [loading, setLoading] = useState(true);

  const [isAuth, setIsAuth] =
    useState(false);

  const [user, setUser] =
    useState<User | null>(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          BUILT_IN_API_URLS.verify,
          {
            withCredentials: true,
          }
        );

        setIsAuth(res.data.authenticated);
        setUser(res.data.user || null);

      } catch {
        setIsAuth(false);
        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return <Loading />;
  }

  if (!isAuth || !user) {
    return <Navigate to="/login" replace />;
  }

  // ROLE CHECK
  const allowedRoute = SIDEBAR_BUTTONS.find(
    (item) =>
      item.path === location.pathname
  );

  if (
    allowedRoute &&
    !allowedRoute.roles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="h-screen flex flex-col">

      <TopNav
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />

      <div className="flex flex-1 overflow-hidden">

        <Sidebar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          user={user}
        />

        <main className="flex-1 overflow-y-auto p-4 bg-neutral-100 dark:bg-neutral-900">
          <Outlet />
          <PrivateFooter />
        </main>

      </div>

    </div>
  );
}