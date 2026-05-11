import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Bell, AlertTriangle, CheckCircle2, Clock, Wrench, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { mockIssues } from '../data/mockData';
import { getCurrentUser } from '../data/authData';

export default function Notifications() {
  const currentUser = getCurrentUser();
  const [issues, setIssues] = useState(mockIssues);

  // Refresh issues when component mounts
  useEffect(() => {
    setIssues([...mockIssues]);
  }, []);

  // Admin notifications
  const duplicateIssues = issues.filter(issue => issue.isDuplicate);
  const pendingIssues = issues.filter(issue => issue.status === 'pending' && !issue.isDuplicate);
  const urgentIssues = issues.filter(issue => issue.priority === 'urgent');

  const adminNotifications = [
    ...duplicateIssues.map(issue => ({
      id: issue.id,
      type: 'duplicate' as const,
      title: `Báo cáo trùng lặp: ${issue.title}`,
      description: `Phòng ${issue.room} - ${issue.building} đã có báo cáo tương tự`,
      timestamp: issue.reportedAt,
      issueId: issue.id,
      priority: 'high' as const,
    })),
    ...urgentIssues.map(issue => ({
      id: `urgent-${issue.id}`,
      type: 'urgent' as const,
      title: `Sự cố khẩn cấp: ${issue.title}`,
      description: `${issue.facility} - Phòng ${issue.room}`,
      timestamp: issue.reportedAt,
      issueId: issue.id,
      priority: 'urgent' as const,
    })),
    ...pendingIssues.slice(0, 3).map(issue => ({
      id: `pending-${issue.id}`,
      type: 'pending' as const,
      title: `Sự cố chờ xử lý: ${issue.title}`,
      description: `Báo cáo bởi ${issue.reportedBy}`,
      timestamp: issue.reportedAt,
      issueId: issue.id,
      priority: 'normal' as const,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // User notifications - updates on their reported issues
  const userIssues = issues.filter(issue => issue.reporterCode === currentUser?.username);
  const userNotifications = userIssues
    .filter(issue => issue.timeline && issue.timeline.length > 1) // Has updates
    .map(issue => {
      const latestUpdate = issue.timeline![issue.timeline!.length - 1];
      return {
        id: `update-${issue.id}`,
        type: latestUpdate.status as const,
        title: issue.status === 'resolved'
          ? `Sự cố đã xử lý xong: ${issue.title}`
          : issue.status === 'in-progress'
          ? `Sự cố đang được xử lý: ${issue.title}`
          : `Cập nhật sự cố: ${issue.title}`,
        description: latestUpdate.description,
        timestamp: latestUpdate.timestamp,
        issueId: issue.id,
        priority: issue.priority as any,
      };
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const allNotifications = currentUser?.role === 'admin' ? adminNotifications : userNotifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'duplicate':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'urgent':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'resolved':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in-progress':
        return <Wrench className="w-5 h-5 text-orange-600" />;
      case 'assigned':
        return <Info className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Thông báo</h2>
          <p className="text-gray-600 mt-2">
            {currentUser?.role === 'admin'
              ? 'Tất cả thông báo và cảnh báo của hệ thống'
              : 'Cập nhật về các sự cố bạn đã báo cáo'
            }
          </p>
        </div>
        {allNotifications.length > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {allNotifications.length}
          </Badge>
        )}
      </div>

      {/* Duplicate Warnings Section - Only for Admin */}
      {currentUser?.role === 'admin' && duplicateIssues.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertTriangle className="w-5 h-5" />
              Cảnh báo báo cáo trùng lặp ({duplicateIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {duplicateIssues.map((issue) => (
              <Link key={issue.id} to={`/issues/${issue.id}`}>
                <div className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{issue.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {issue.facility} - Tòa {issue.building} - Phòng {issue.room}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Báo cáo bởi: {issue.reportedBy} ({issue.reporterCode})
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs whitespace-nowrap">
                      Trùng lặp
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* All Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Tất cả thông báo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allNotifications.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600">Không có thông báo mới</p>
            </div>
          ) : (
            <div className="space-y-1">
              {allNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <Link to={`/issues/${notification.issueId}`}>
                    <div className="p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h3>
                            <Badge variant={getNotificationBadge(notification.priority) as any} className="text-xs whitespace-nowrap">
                              {notification.type === 'duplicate' ? 'Trùng lặp' :
                               notification.type === 'urgent' ? 'Khẩn cấp' : 'Chờ xử lý'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  {index < allNotifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
