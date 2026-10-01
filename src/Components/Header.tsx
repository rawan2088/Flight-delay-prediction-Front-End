import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Plane, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../Hooks/useAuth";

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/", label: "Home" },
    { to: "/predict", label: "Predict" },
    ...(isAuthenticated ? [{ to: "/history", label: "History" }] : []),
  ];

  const close = () => {
    setMobileOpen(false);
    setMenuOpen(false);
  };
  const handleLogout = () => {
    close();
    logout();
    navigate("/");
  };
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-blue-400" : "text-gray-300 hover:text-white"
    }`;

  return (
    <header className="fixed top-0 w-full bg-slate-900/50 backdrop-blur-md border-b border-slate-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" onClick={close} className="flex items-center gap-2">
            <Plane className="w-7 h-7 text-blue-500" />
            <span className="text-xl font-bold text-white">FlightPredict</span>
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={linkCls}
              >
                {l.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 text-gray-200 hover:text-white"
                  aria-expanded={menuOpen}
                >
                  <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
                    {user?.username?.[0]?.toUpperCase()}
                  </span>
                  <span className="text-sm">{user?.username}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-lg bg-slate-800 border border-slate-700 shadow-xl py-1">
                    <Link
                      to="/profile"
                      onClick={close}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-200 hover:bg-slate-700"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-300 hover:bg-slate-700"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-300 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={close}
                className={(s) => `px-4 py-2 ${linkCls(s)}`}
              >
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  onClick={close}
                  className={(s) => `px-4 py-2 ${linkCls(s)}`}
                >
                  Profile ({user?.username})
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="text-left px-4 py-2 text-sm text-rose-300"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={close}
                  className="px-4 py-2 text-sm text-gray-300"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={close}
                  className="px-4 py-2 text-sm text-blue-400"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
