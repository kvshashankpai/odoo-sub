import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, ShoppingCart, FileText, Package, LogOut, 
  BarChart, Settings, ShoppingBag, CreditCard, Tag, Menu, Bell,
  Users as UsersIcon,
} from 'lucide-react';

export default function Layout({ type = 'admin' }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Admin Navigation
  const adminLinks = [
    { path: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/app/products', label: 'Products', icon: Package },
    { path: '/app/subscriptions', label: 'Subscriptions', icon: FileText },
    { path: '/app/reporting', label: 'Reporting', icon: BarChart },
    { path: '/app/configuration', label: 'Configuration', icon: Settings },
    { path: '/app/discounts', label: 'Discounts', icon: Tag },
    { path: '/app/payments', label: 'Payments', icon: CreditCard },
    { path: '/app/notifications', label: 'Notifications', icon: Bell },
    // Add Users/Contacts link only for admins so they can create internal users
    ...(user?.role === 'admin' ? [{ path: '/app/users', label: 'Users/Contacts', icon: UsersIcon }] : []),
  ];

  // Portal Navigation
  const portalLinks = [
    { path: '/portal', label: 'Home', icon: LayoutDashboard },
    { path: '/portal/shop', label: 'Shop', icon: ShoppingBag },
    { path: '/portal/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/portal/orders', label: 'My Orders', icon: FileText },
    { path: '/portal/subscription', label: 'My Subscription', icon: CreditCard },
  ];

  const links = type === 'portal' ? portalLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin sidebar layout
  if (type === 'admin') {
    return (
      <div className="flex h-screen bg-gray-100">
        <aside className="w-64 bg-primary text-white flex flex-col shrink-0">
          <div className="p-6 text-2xl font-bold tracking-tight">SubFlow</div>
          <nav className="flex-1 px-2 space-y-2 mt-4 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                    isActive ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10 mt-auto">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-sm truncate">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-white/60 capitalize">{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-2 py-2 text-sm text-red-200 hover:text-white transition"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    );
  }

  // Portal top-nav layout
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/portal" className="text-xl font-bold text-primary">SubFlow</Link>
              <nav className="hidden md:flex items-center gap-2">
                {links.map((link) => (
                  <Link key={link.path} to={link.path} className={`px-3 py-2 rounded text-sm ${location.pathname === link.path ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:text-primary'}`}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/portal/cart" className="text-gray-600 hover:text-primary flex items-center gap-2">
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Cart</span>
              </Link>
              {user?.role === 'admin' || user?.role === 'internal' ? (
                <Link to="/app" className="px-3 py-2 rounded text-sm font-semibold text-primary hover:bg-primary/10">
                  Admin
                </Link>
              ) : null}
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-sm text-gray-700">{user?.name}</div>
                <button onClick={handleLogout} className="text-sm text-red-600 hover:text-red-800">Sign Out</button>
              </div>
              <button className="md:hidden p-2 rounded bg-gray-100"><Menu size={18} /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}