import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Calendar, User, MapPin, Tag, AlertCircle, CheckCircle2, Clock, Play, Pause, Wrench } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { createIssueComment, getIssue, getIssueComments, Issue, IssueComment } from '../data/api';

export default function IssueDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const loadIssue = async () => {
      if (!id) return;
      try {
        const [data, commentData] = await Promise.all([
          getIssue(id),
          getIssueComments(id),
        ]);
        setIssue(data);
        setComments(commentData || []);
      } catch (error: any) {
        setLoadError(error.message || 'Không thể tải chi tiết sự cố');
      } finally {
        setIsLoading(false);
      }
    };

    loadIssue();
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Đang tải dữ liệu...</h2>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy sự cố</h2>
        <p className="text-gray-600 mt-2">{loadError || 'Sự cố bạn đang tìm kiếm không tồn tại'}</p>
        <Link to="/issues">
          <Button className="mt-4">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const handleSubmitComment = async () => {
    if (!issue) {
      toast.error('Không tìm thấy sự cố để bình luận');
      return;
    }
    if (!commentInput.trim()) {
      toast.error('Vui lòng nhập bình luận');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const created = await createIssueComment(issue.id, commentInput.trim());
      setComments((prev) => [...prev, created]);
      setCommentInput('');
      toast.success('Đã gửi bình luận');
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi bình luận');
    } finally {
      setIsSubmittingComment(false);
    }
  };

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

  const getTimelineIcon = (status: string) => {
    const icons: Record<string, any> = {
      reported: Clock,
      assigned: User,
      'in-progress': Play,
      'waiting-parts': Clock,
      paused: Pause,
      inspected: CheckCircle2,
      resolved: CheckCircle2,
    };
    return icons[status] || Wrench;
  };

  const getTimelineColor = (status: string) => {
    const colors: Record<string, string> = {
      reported: 'bg-blue-600',
      assigned: 'bg-purple-600',
      'in-progress': 'bg-orange-600',
      'waiting-parts': 'bg-yellow-600',
      paused: 'bg-gray-600',
      inspected: 'bg-teal-600',
      resolved: 'bg-green-600',
    };
    return colors[status] || 'bg-gray-600';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{issue.title}</h2>
          <p className="text-gray-600 mt-2">Mã sự cố: #{issue.id}</p>
          <p className="text-sm text-gray-500">Số lượt báo cáo: {issue.reportCount ?? 1}</p>
        </div>
        <Badge className={`${getStatusBadge(issue.status)} text-sm`}>
          {getStatusText(issue.status)}
        </Badge>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Chi tiết sự cố</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Mô tả</h3>
            <p className="text-gray-700">{issue.description}</p>
          </div>

          <Separator />

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Vị trí</p>
                  <p className="font-semibold text-gray-900">
                    {issue.facility} - Phòng {issue.room}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Loại sự cố</p>
                  <p className="font-semibold text-gray-900">{issue.category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Mức độ ưu tiên</p>
                  <Badge variant={getPriorityBadge(issue.priority)} className="mt-1">
                    {getPriorityText(issue.priority)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Người báo cáo</p>
                  <p className="font-semibold text-gray-900">{issue.reportedBy}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Thời gian báo cáo</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(issue.reportedAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>

              {issue.assignedTo && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Người phụ trách</p>
                    <p className="font-semibold text-gray-900">{issue.assignedTo}</p>
                  </div>
                </div>
              )}

              {issue.resolvedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian xử lý xong</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(issue.resolvedAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {issue.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ghi chú xử lý</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-gray-700">{issue.notes}</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle>Bình luận</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có bình luận nào</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-900">
                    {comment.userFullName || comment.userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-sm text-gray-700 mt-2">{comment.comment}</p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder="Nhập bình luận của bạn..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmitComment} disabled={isSubmittingComment}>
              {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử xử lý</CardTitle>
        </CardHeader>
        <CardContent>
          {issue.timeline && issue.timeline.length > 0 ? (
            <div className="space-y-4">
              {issue.timeline.map((event, index) => {
                const Icon = getTimelineIcon(event.status);
                const isLast = index === issue.timeline!.length - 1;
                
                return (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`${getTimelineColor(event.status)} p-2 rounded-full`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      {!isLast && <div className="w-0.5 h-full bg-gray-300 mt-2" />}
                    </div>
                    <div className={`flex-1 ${!isLast ? 'pb-6' : ''}`}>
                      <p className="font-semibold text-gray-900">{event.description}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(event.timestamp).toLocaleString('vi-VN')}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Bởi: {event.performer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Fallback timeline if no timeline data */}
              {issue.resolvedAt && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full" />
                    <div className="w-0.5 h-full bg-gray-300" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900">Đã xử lý xong</p>
                    <p className="text-sm text-gray-600">
                      {new Date(issue.resolvedAt).toLocaleString('vi-VN')}
                    </p>
                    {issue.assignedTo && (
                      <p className="text-sm text-gray-500 mt-1">
                        Bởi: {issue.assignedTo}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {issue.status === 'in-progress' && (
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-orange-600 rounded-full" />
                    <div className="w-0.5 h-full bg-gray-300" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900">Đang xử lý</p>
                    {issue.assignedTo && (
                      <p className="text-sm text-gray-600 mt-1">
                        Người phụ trách: {issue.assignedTo}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Đã báo cáo</p>
                  <p className="text-sm text-gray-600">
                    {new Date(issue.reportedAt).toLocaleString('vi-VN')}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Bởi: {issue.reportedBy}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
