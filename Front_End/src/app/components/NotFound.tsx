import { Link } from 'react-router';
import { Button } from './ui/button';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-xl text-gray-600 mt-4">Không tìm thấy trang</p>
      <p className="text-gray-500 mt-2">Trang bạn đang tìm kiếm không tồn tại</p>
      <Link to="/">
        <Button className="mt-6">
          <Home className="w-4 h-4 mr-2" />
          Về trang chủ
        </Button>
      </Link>
    </div>
  );
}
