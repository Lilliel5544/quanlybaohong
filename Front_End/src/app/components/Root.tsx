import { Outlet, Link, Navigate, useLocation } from 'react-router';
import { Home, FileText, List, Mail, Menu, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { getNotifications, getStoredUser } from '../data/api';

export default function Root() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!currentUser) return;
      try {
        const items = await getNotifications();
        const count = items.filter((item) => !item.isRead).length;
        setUnreadCount(count);
      } catch {
        setUnreadCount(0);
      }
    };

    const handleNotificationsChange = () => {
      loadNotifications();
    };

    loadNotifications();
    window.addEventListener('notifications-change', handleNotificationsChange);
    return () => window.removeEventListener('notifications-change', handleNotificationsChange);
  }, [currentUser]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Trang chủ', path: '/home', icon: Home },
    { name: 'Báo cáo sự cố', path: '/report', icon: FileText },
    { name: 'Danh sách sự cố', path: '/issues', icon: List },
    { name: 'Hòm thư', path: '/inbox', icon: Mail },
  ];

  const adminNavigation = [
    { name: 'Quản lý sự cố', path: '/admin/issues', icon: List },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setOpen(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
            {item.path === '/inbox' && unreadCount > 0 && (
              <span className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        );
      })}
      {currentUser?.role === 'admin' && adminNavigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => mobile && setOpen(false)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="font-bold text-lg">PTIT Facility Manager</h1>
                <p className="text-xs text-gray-500">Quản lý sự cố giảng đường</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-2 items-center">
              <NavLinks />
              <Link
                to="/profile"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === '/profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Hồ sơ</span>
              </Link>
            </nav>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-2 mt-8">
                  <NavLinks mobile />
                  <Link
                    to="/profile"
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      location.pathname === '/profile'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Hồ sơ</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2026 Học viện Công nghệ Bưu chính Viễn thông (PTIT). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}