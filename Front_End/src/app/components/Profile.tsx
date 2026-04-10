import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { User, Mail, Shield, Calendar, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getMe, getStoredUser, logout } from '../data/api';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getMe();
        setUser(data);
      } catch {
        toast.error('Vui lòng đăng nhập để truy cập trang này');
        navigate('/login');
      }
    };

    loadUser();
  }, [navigate]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đã đăng xuất thành công');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Không thể đăng xuất');
    }
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
                  <p className="font-semibold text-gray-900">{user.email || '-'}</p>
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
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
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
