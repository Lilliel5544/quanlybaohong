import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { User, Mail, Shield, Calendar, LogOut, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchCurrentUser, getCurrentUser, logout } from '../data/authData';
import { mockIssues } from '../data/mockData';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [issues, setIssues] = useState(mockIssues);

  useEffect(() => {
    const loadUser = async () => {
      const resolvedUser = user || await fetchCurrentUser();
      if (!resolvedUser) {
        toast.error('Vui lòng đăng nhập để truy cập trang này');
        navigate('/login');
        return;
      }
      setUser(resolvedUser);
      setIssues([...mockIssues]);
    };

    loadUser();
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất thành công');
    navigate('/');
  };

  const getRoleBadge = (role: string) => {
    const configs: Record<string, { variant: any; text: string }> = {
      admin: { variant: 'destructive', text: 'Quản trị viên' },
      technician: { variant: 'default', text: 'Kỹ thuật viên' },
      user: { variant: 'secondary', text: 'Người dùng' },
    };
    return configs[role] || { variant: 'outline', text: role };
  };

  const roleConfig = getRoleBadge(user.role);

  // Get user's reported issues
  const userIssues = issues.filter(issue => issue.reporterCode === user.username);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: 'Chờ xử lý',
      'in-progress': 'Đang xử lý',
      resolved: 'Đã xử lý',
      rejected: 'Từ chối',
    };
    return texts[status] || status;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h2>
        <p className="text-gray-600 mt-2">
          Thông tin tài khoản và trạng thái hoạt động
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.fullName.charAt(0)}
                </span>
              </div>
              <div>
                <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                <p className="text-gray-600 mt-1">@{user.username}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Account Status */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Trạng thái tài khoản</h3>
            <div className="flex items-center gap-3">
              {user.isActive ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <Badge className="bg-green-100 text-green-800 text-sm px-4 py-2">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Đang hoạt động
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-600" />
                  <Badge className="bg-red-100 text-red-800 text-sm px-4 py-2">
                    <XCircle className="w-4 h-4 mr-2" />
                    Bị khóa
                  </Badge>
                </>
              )}
            </div>
            {!user.isActive && (
              <p className="text-sm text-red-600 mt-2">
                Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
              </p>
            )}
          </div>

          <Separator />

          {/* User Information */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Họ và tên</p>
                  <p className="font-semibold text-gray-900">{user.fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Tên đăng nhập</p>
                  <p className="font-semibold text-gray-900">{user.username}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Vai trò</p>
                  <Badge variant={roleConfig.variant} className="mt-1">
                    {roleConfig.text}
                  </Badge>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo tài khoản</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {user.lastLogin && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Đăng nhập lần cuối</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(user.lastLogin).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quyền truy cập</h3>
            <div className="space-y-2">
              {user.role === 'admin' && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-gray-700">Quản lý toàn bộ hệ thống</p>
                </div>
              )}
              {(user.role === 'admin' || user.role === 'technician') && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-gray-700">Xử lý và cập nhật trạng thái sự cố</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-gray-700">Xem chi tiết tất cả sự cố</p>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-gray-700">Báo cáo sự cố mới</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-gray-700">Xem lịch sử sự cố</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report History - Only for users and technicians */}
      {(user.role === 'user' || user.role === 'technician') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Lịch sử báo cáo ({userIssues.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {userIssues.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Bạn chưa có báo cáo nào</p>
                <Link to="/report">
                  <Button className="mt-4" size="sm">
                    Tạo báo cáo mới
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {userIssues
                  .sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())
                  .map((issue) => (
                    <Link key={issue.id} to={`/issues/${issue.id}`}>
                      <div className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900 line-clamp-1">
                                {issue.title}
                              </h4>
                              <Badge className={`${getStatusBadge(issue.status)} text-xs whitespace-nowrap`}>
                                {getStatusText(issue.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                              {issue.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {issue.facility}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {issue.building} - Phòng {issue.room}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(issue.reportedAt).toLocaleDateString('vi-VN')}
                              </span>
                              {issue.isDuplicate && (
                                <Badge variant="destructive" className="text-xs">
                                  Trùng lặp
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card>
        <CardHeader>
          <CardTitle>Lưu ý bảo mật</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-700">
            • Không chia sẻ thông tin đăng nhập với người khác
          </p>
          <p className="text-sm text-gray-700">
            • Đăng xuất sau khi sử dụng xong trên thiết bị chung
          </p>
          <p className="text-sm text-gray-700">
            • Liên hệ quản trị viên nếu phát hiện hoạt động bất thường
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
