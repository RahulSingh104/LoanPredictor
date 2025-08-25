import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LogIn,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from "../context/AuthContext";  // ✅ global context

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);     // mobile drawer
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuTimerRef = useRef(null);
  const navigate = useNavigate();

  // Get auth values
  const { isLoggedIn, username, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate('/');
  };

  const handleUserMenuEnter = () => {
    clearTimeout(userMenuTimerRef.current);
    if (isLoggedIn) setIsUserMenuOpen(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimerRef.current = setTimeout(() => setIsUserMenuOpen(false), 300);
  };

  const navItems = [
    { path: "/predict", label: "Predict Loan", icon: <Home size={18} /> },
    { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { path: "/loans", label: "My Loans", icon: <FileText size={18} /> },
  ];

  // 🔒 Lock scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
      {/* ----------------- Desktop Sidebar ----------------- */}
      <aside
        className={`hidden md:fixed md:top-0 md:left-0 md:z-20 md:h-full shadow-lg bg-white dark:bg-slate-800 transition-all duration-300
        ${sidebarCollapsed ? "md:w-20" : "md:w-64"}`}
      >
        <div className="p-4 flex items-center justify-between h-16 border-b border-slate-200 dark:border-slate-700">
          {!sidebarCollapsed && (
            <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              LoanPredictor
            </span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden md:block p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="space-y-2 p-4">
          {navItems.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors 
                ${isActive
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`
              }
            >
              {icon}
              {!sidebarCollapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ----------------- Mobile Sidebar (Drawer) ----------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Drawer */}
          <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-800 shadow-lg transform transition-transform duration-300">
            <div className="flex justify-between items-center h-16 px-4 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                LoanPredictor
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map(({ path, label, icon }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-md transition-colors 
                    ${isActive
                      ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300"
                      : "hover:bg-slate-100 dark:hover:bg-slate-700"}`
                  }
                >
                  {icon}
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* ----------------- Main Layout ----------------- */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
        ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}
      >
        <header className="bg-white dark:bg-slate-800 shadow px-6 py-3 flex justify-between items-center sticky top-0 z-10 h-16">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Menu size={22} />
          </button>

          <div className="font-bold text-lg">Loan Predictor Dashboard</div>

          {isLoggedIn ? (
            <div
              className="relative"
              onMouseEnter={handleUserMenuEnter}
              onMouseLeave={handleUserMenuLeave}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src={`https://placehold.co/32x32/E2E8F0/4A5568?text=${username.charAt(
                    0
                  ).toUpperCase()}`}
                  alt="User"
                  className="w-8 h-8 rounded-full"
                />
                <div className="hidden md:block">{username}</div>
              </div>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 rounded-md shadow-xl z-50 py-1">
                  <NavLink
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut size={16} /> Logout
                    </div>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className="bg-indigo-600 text-white flex items-center gap-2 rounded-full px-4 py-2 font-semibold hover:bg-indigo-700 transition duration-300"
            >
              <LogIn size={16} /> Login
            </NavLink>
          )}
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
