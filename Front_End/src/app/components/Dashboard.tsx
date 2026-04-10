import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { AlertCircle, CheckCircle, Clock, TrendingUp, FileText, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { getIssues, Issue } from '../data/api';
import { toast } from 'sonner';

export default function Dashboard() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadIssues = async () => {
      try {
        const data = await getIssues();
        setIssues(data);
      } catch (error: any) {
        toast.error(error.message || 'Không thể tải dữ liệu tổng quan');
      } finally {
        setIsLoading(false);
      }
    };

    loadIssues();
  }, []);

  const stats = useMemo(() => {
    const total = issues.length;
    const pending = issues.filter((i) => i.status === 'pending').length;
    const inProgress = issues.filter((i) => i.status === 'in-progress').length;
    const resolved = issues.filter((i) => i.status === 'resolved').length;
    const urgent = issues.filter((i) => i.priority === 'urgent').length;
    return { total, pending, inProgress, resolved, urgent };
  }, [issues]);

  const recentIssues = issues.slice(0, 5);

  const statCards = [
    {
      title: 'Tổng số sự cố',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Chờ xử lý',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Đang xử lý',
      value: stats.inProgress,
      icon: Wrench,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Đã xử lý',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Khẩn cấp',
      value: stats.urgent,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      urgent: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline',
    };
    return variants[priority] || 'outline';
  };

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

  const getPriorityText = (priority: string) => {
    const texts: Record<string, string> = {
      urgent: 'Khẩn cấp',
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp',
    };
    return texts[priority] || priority;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Tổng quan hệ thống</h2>
        <p className="text-gray-600 mt-2">
          Theo dõi và quản lý các sự cố tại giảng đường PTIT
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/report">
              <Button className="w-full h-20 text-lg" size="lg">
                <FileText className="w-6 h-6 mr-2" />
                Báo cáo sự cố mới
              </Button>
            </Link>
            <Link to="/issues">
              <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                <TrendingUp className="w-6 h-6 mr-2" />
                Xem tất cả sự cố
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Issues */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sự cố gần đây</CardTitle>
            <Link to="/issues">
              <Button variant="link">Xem tất cả →</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : (
            <div className="space-y-4">
              {recentIssues.map((issue) => (
                <Link key={issue.id} to={`/issues/${issue.id}`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{issue.title}</h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {issue.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">
                            {issue.facility}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {issue.room}
                          </Badge>
                          <Badge variant={getPriorityBadge(issue.priority)} className="text-xs">
                            {getPriorityText(issue.priority)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(issue.reportedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {issue.status === 'in-progress' && issue.assignedTo && (
                          <p className="text-sm text-orange-600 mt-2">
                            Người phụ trách: {issue.assignedTo}
                          </p>
                        )}
                      </div>
                      <Badge className={`${getStatusBadge(issue.status)} text-xs whitespace-nowrap`}>
                        {getStatusText(issue.status)}
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}