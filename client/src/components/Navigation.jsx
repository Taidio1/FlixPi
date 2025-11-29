import { Home, Search, Heart, User, LogOut, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

export function Navigation() {
  const location = useLocation();
  const { currentProfile, logout } = useAuth();

  const navItems = [
    { path: "/", icon: Home, label: "Home", testId: "nav-home" },
    { path: "/search", icon: Search, label: "Search", testId: "nav-search" },
    { path: "/watchlist", icon: Heart, label: "Watchlist", testId: "nav-watchlist" },
    { path: "/profile", icon: User, label: "Profile", testId: "nav-profile" },
  ];

  // Add Admin link if current profile has admin role
  if (currentProfile?.role === 'admin') {
    navItems.push({
      path: "/admin",
      icon: Shield,
      label: "Admin",
      testId: "nav-admin"
    });
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <button
                  data-testid={item.testId}
                  className={`flex flex-col items-center justify-center gap-1 min-w-[60px] h-12 rounded-md transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover-elevate"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/">
              <h1 className="text-2xl font-bold text-primary cursor-pointer" data-testid="logo">
                FLIXPI
              </h1>
            </Link>
            <nav className="flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <button
                      data-testid={item.testId}
                      className={`text-sm font-medium transition-colors ${
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {currentProfile && (
              <>
                <Link to="/profiles">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover-elevate"
                    style={{ backgroundColor: currentProfile.avatar_color || '#E50914' }}
                    data-testid="avatar-desktop"
                  >
                    {currentProfile.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default Navigation;
