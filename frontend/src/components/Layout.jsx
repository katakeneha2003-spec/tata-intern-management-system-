import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, FolderKanban, ListChecks, CalendarCheck,
  FileText, ClipboardList, FolderOpen, Bell, UserCircle, LogOut, Menu, X, GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import API from "../services/api";

const navByRole = {
  admin: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/interns", label: "Interns", icon: Users },
    { to: "/mentors", label: "Mentors", icon: GraduationCap },
    { to: "/departments", label: "Departments", icon: Building2 },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/tasks", label: "Tasks", icon: ListChecks },
    { to: "/reports", label: "Weekly Reports", icon: FileText },
    { to: "/evaluations", label: "Evaluations", icon: ClipboardList },
  ],
  mentor: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/interns", label: "My Interns", icon: Users },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/tasks", label: "Tasks", icon: ListChecks },
    { to: "/reports", label: "Weekly Reports", icon: FileText },
    { to: "/evaluations", label: "Evaluations", icon: ClipboardList },
  ],
  intern: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tasks", label: "My Tasks", icon: ListChecks },
    { to: "/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/reports", label: "Weekly Reports", icon: FileText },
    { to: "/documents", label: "Documents", icon: FolderOpen },
  ],
};

const roleLabel = { admin: "Admin / HR", mentor: "Mentor", intern: "Intern" };

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const navItems = navByRole[user?.role] || [];

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data.data);
      setUnreadCount(res.data.unreadCount);
    } catch (e) {
      
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openNotifications = async () => {
    setNotifOpen((o) => !o);
    if (!notifOpen && unreadCount > 0) {
      await API.put("/notifications/read-all");
      setUnreadCount(0);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 inset-y-0 left-0 w-64 bg-navy-950 text-white flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10">
          <div className="w-8 h-8 rounded bg-accent flex items-center justify-center font-display font-bold text-sm">TM</div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-sm">Internship IMS</p>
            <p className="text-[11px] text-steel-400">Tata Motors</p>
          </div>
          <button className="ml-auto lg:hidden text-steel-400" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  isActive ? "bg-white/10 text-white font-medium" : "text-steel-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
                isActive ? "bg-white/10 text-white" : "text-steel-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <UserCircle size={18} strokeWidth={1.75} />
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-steel-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-navy-950/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-steel-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-navy-950" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <p className="text-sm text-steel-600 hidden sm:block">{roleLabel[user?.role]}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={notifRef}>
              <button onClick={openNotifications} className="relative text-navy-950 p-2 rounded-md hover:bg-steel-100">
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-steel-200 rounded-lg shadow-lg">
                  <div className="px-4 py-3 border-b border-steel-100 font-medium text-sm text-navy-950">Notifications</div>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-steel-600 px-4 py-6 text-center">You're all caught up.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n._id} className="px-4 py-3 border-b border-steel-100 last:border-0">
                        <p className="text-sm font-medium text-navy-950">{n.title}</p>
                        <p className="text-xs text-steel-600 mt-0.5">{n.message}</p>
                        <p className="text-[11px] text-steel-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-medium">
                {user?.name?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-medium text-navy-950">{user?.name}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
