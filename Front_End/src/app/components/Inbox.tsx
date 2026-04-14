import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Bell, CheckCircle2, MailOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { getNotifications, markAllNotificationsRead, markNotificationRead, Notification } from '../data/api';

export default function Inbox() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải thông báo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleMarkRead = async (notification: Notification) => {
    if (notification.isRead) return;
    try {
      const updated = await markNotificationRead(notification.id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === notification.id ? updated : item))
      );
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật thông báo');
    }
  };

  const handleMarkAll = async () => {
    if (unreadCount === 0) return;
    setIsMarkingAll(true);
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật thông báo');
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Hòm thư</h2>
          <p className="text-gray-600 mt-2">Thông báo cập nhật từ quản trị viên</p>
        </div>
        <Button variant="outline" onClick={handleMarkAll} disabled={isMarkingAll || unreadCount === 0}>
          <MailOpen className="w-4 h-4 mr-2" />
          {isMarkingAll ? 'Đang cập nhật...' : 'Đánh dấu tất cả đã đọc'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Thông báo
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-700">{unreadCount} mới</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Chưa có thông báo nào</div>
          ) : (
            notifications.map((item, index) => (
              <div key={item.id} className={`rounded-lg border p-4 ${item.isRead ? 'bg-white' : 'bg-blue-50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{item.title}</p>
                      {!item.isRead && <Badge className="bg-blue-100 text-blue-700">Mới</Badge>}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{item.message}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span>{new Date(item.createdAt).toLocaleString('vi-VN')}</span>
                      {item.ticketId && (
                        <Link className="text-blue-600 hover:underline" to={`/issues/${item.ticketId}`}>
                          Xem sự cố #{item.ticketId}
                        </Link>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkRead(item)}
                    disabled={item.isRead}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {item.isRead ? 'Đã đọc' : 'Đánh dấu đã đọc'}
                  </Button>
                </div>
                {index < notifications.length - 1 && <Separator className="mt-4" />}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
