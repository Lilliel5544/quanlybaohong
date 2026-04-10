import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { getIssues, getMe, getStoredUser, Issue, updateIssueStatus } from '../data/api';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ tiếp nhận' },
  { value: 'in-progress', label: 'Đang xử lý' },
  { value: 'resolved', label: 'Đã sửa xong' },
  { value: 'rejected', label: 'Từ chối' },
];

const STATUS_BADGES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminIssues() {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState('all');

  const loadIssues = async (filter: string) => {
    const data = await getIssues(filter);
    setIssues(data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const user = getStoredUser() || (await getMe());
        if (user.role !== 'admin') {
          toast.error('Bạn không có quyền truy cập trang này');
          navigate('/home');
          return;
        }

        await loadIssues(statusFilter);
      } catch (error: any) {
        toast.error(error.message || 'Không thể tải dữ liệu quản lý');
      }
    };

    init();
  }, [navigate]);

  const handleFilterChange = async (value: string) => {
    setStatusFilter(value);
    try {
      await loadIssues(value);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải dữ liệu theo trạng thái');
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    setIssues((prev) => prev.map((issue) => (issue.id === id ? { ...issue, status } : issue)));
  };

  const handleSave = async (issue: Issue) => {
    setSaving((prev) => ({ ...prev, [issue.id]: true }));
    try {
      const updated = await updateIssueStatus(issue.id, issue.status, notes[issue.id]);
      setIssues((prev) => prev.map((item) => (item.id === issue.id ? updated : item)));
      toast.success('Đã cập nhật trạng thái');
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    } finally {
      setSaving((prev) => ({ ...prev, [issue.id]: false }));
    }
  };

  const sortedIssues = useMemo(() => issues.slice().sort((a, b) => Number(b.id) - Number(a.id)), [issues]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Quản lý sự cố</h2>
        <p className="text-gray-600 mt-2">Cập nhật trạng thái và ghi chú xử lý</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-600">Lọc theo trạng thái</span>
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedIssues.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">Chưa có sự cố nào</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedIssues.map((issue) => (
            <Card key={issue.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{issue.title}</CardTitle>
                    <p className="text-sm text-gray-600">{issue.description}</p>
                  </div>
                  <Badge className={`${STATUS_BADGES[issue.status] || 'bg-gray-100 text-gray-800'} text-xs`}>
                    {STATUS_OPTIONS.find((item) => item.value === issue.status)?.label || issue.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Cơ sở</p>
                    <p className="font-semibold text-gray-900">{issue.facility}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phòng</p>
                    <p className="font-semibold text-gray-900">{issue.room}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Người báo cáo</p>
                    <p className="font-semibold text-gray-900">{issue.reportedBy}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Trạng thái</p>
                    <Select value={issue.status} onValueChange={(value) => handleStatusChange(issue.id, value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Ghi chú</p>
                    <Textarea
                      value={notes[issue.id] || ''}
                      onChange={(event) =>
                        setNotes((prev) => ({ ...prev, [issue.id]: event.target.value }))
                      }
                      rows={3}
                      placeholder="Ghi chú xử lý (tùy chọn)"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave(issue)} disabled={saving[issue.id]}>
                    {saving[issue.id] ? 'Đang lưu...' : 'Lưu trạng thái'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
