import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { UserPlus, Lock, User as UserIcon, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { facilities } from '../data/mockData';
import { register } from '../data/authData';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    facility: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username || !formData.fullName || !formData.email ||
        !formData.password || !formData.confirmPassword || !formData.facility) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Validate username format
    if (!formData.username.match(/^B\d{2}DCCN\d{3}$/)) {
      setError('Mã sinh viên phải có định dạng: B20DCCN001');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        facility: formData.facility,
      });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login', { state: { username: formData.username } });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đăng ký tài khoản.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-2xl">
        <Link to="/login">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại đăng nhập
          </Button>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Đăng ký tài khoản</CardTitle>
            <CardDescription>
              Tạo tài khoản mới để sử dụng hệ thống quản lý sự cố PTIT
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  Mã sinh viên <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="VD: B20DCCN001"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toUpperCase() })}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Định dạng: B[năm]DCCN[số] (VD: B20DCCN001)</p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="fullName"
                    placeholder="Nhập họ và tên đầy đủ"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@ptit.edu.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Facility */}
              <div className="space-y-2">
                <Label htmlFor="facility">
                  Cơ sở <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.facility}
                  onValueChange={(value) => setFormData({ ...formData, facility: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger id="facility">
                    <SelectValue placeholder="Chọn cơ sở" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map((facility) => (
                      <SelectItem key={facility} value={facility}>
                        {facility}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-semibold">
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
