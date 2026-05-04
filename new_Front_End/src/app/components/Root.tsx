import { Outlet, Link, useLocation } from 'react-router';
import { Home, QrCode, FileText, List, Menu, User, LogIn, Bell } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { getCurrentUser } from '../data/authData';
import { mockIssues } from '../data/mockData';
import ptitLogo from '../../imports/image.png';

export default function Root() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const currentUser = getCurrentUser();

  const navigation = [
    { name: 'Trang chủ', path: '/', icon: Home },
    { name: 'Quét QR', path: '/scan', icon: QrCode },
    { name: 'Báo cáo sự cố', path: '/report', icon: FileText },
    { name: 'Danh sách sự cố', path: '/issues', icon: List },
  ];

  // Count notifications (duplicates + urgent issues)
  const duplicateCount = mockIssues.filter(issue => issue.isDuplicate).length;
  const urgentCount = mockIssues.filter(issue => issue.priority === 'urgent').length;
  const notificationCount = duplicateCount + urgentCount;

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
              <img
                src={ptitLogo}
                alt="PTIT Logo"
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="font-bold text-lg">PTIT Facility Manager</h1>
                <p className="text-xs text-gray-500">Quản lý sự cố giảng đường</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-2 items-center">
              <NavLinks />

              {/* Notification Bell */}
              {currentUser && (
                <Link
                  to="/notifications"
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/notifications'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && currentUser.role === 'admin' && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0 h-5 min-w-5 text-xs">
                      {notificationCount}
                    </Badge>
                  )}
                  {currentUser.role === 'user' && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 px-1.5 py-0 h-5 min-w-5 text-xs">
                      {mockIssues.filter(i => i.reporterCode === currentUser.username && i.timeline && i.timeline.length > 1).length}
                    </Badge>
                  )}
                </Link>
              )}

              {currentUser ? (
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
              ) : (
                <Link
                  to="/login"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    location.pathname === '/login'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Đăng nhập</span>
                </Link>
              )}
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

                  {/* Mobile Notification */}
                  {currentUser && (
                    <Link
                      to="/notifications"
                      onClick={() => setOpen(false)}
                      className={`relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === '/notifications'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Bell className="w-5 h-5" />
                      <span>Thông báo</span>
                      {currentUser.role === 'admin' && notificationCount > 0 && (
                        <Badge variant="destructive" className="ml-auto">
                          {notificationCount}
                        </Badge>
                      )}
                      {currentUser.role === 'user' && (
                        <Badge variant="destructive" className="ml-auto">
                          {mockIssues.filter(i => i.reporterCode === currentUser.username && i.timeline && i.timeline.length > 1).length}
                        </Badge>
                      )}
                    </Link>
                  )}

                  {currentUser ? (
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
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        location.pathname === '/login'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <LogIn className="w-5 h-5" />
                      <span>Đăng nhập</span>
                    </Link>
                  )}
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