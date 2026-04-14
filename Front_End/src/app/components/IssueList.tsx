import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getIssues, getMeta, Issue } from '../data/api';
import { toast } from 'sonner';

export default function IssueList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [issueData, meta] = await Promise.all([getIssues(), getMeta()]);
        setIssues(issueData);
        setFacilities(meta.facilities || []);
        setCategories(meta.categories || []);
      } catch (error: any) {
        toast.error(error.message || 'Không thể tải danh sách sự cố');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredIssues = useMemo(() => {
    const filtered = issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.room.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      const matchesFacility = facilityFilter === 'all' || issue.facility === facilityFilter;
      const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesFacility && matchesCategory;
    });

    const seen = new Set<string>();
    return filtered.filter((issue) => {
      const reportedDate = new Date(issue.reportedAt).toISOString().slice(0, 10);
      const key = `${issue.facility}|${issue.room}|${issue.title}|${reportedDate}`.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [issues, searchTerm, statusFilter, facilityFilter, categoryFilter]);

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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Danh sách sự cố</h2>
        <p className="text-gray-600 mt-2">
          Tìm kiếm và lọc các sự cố đã báo cáo
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề, mô tả, phòng học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Selects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="in-progress">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã xử lý</SelectItem>
                  <SelectItem value="rejected">Từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả cơ sở</SelectItem>
                  {facilities.map((facility) => (
                    <SelectItem key={facility} value={facility}>
                      {facility}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại sự cố</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="font-semibold">{filteredIssues.length}</span> sự cố
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <p className="text-lg font-semibold">Đang tải dữ liệu...</p>
              </div>
            </CardContent>
          </Card>
        ) : filteredIssues.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <p className="text-lg font-semibold">Không tìm thấy sự cố nào</p>
                <p className="text-sm mt-2">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Link key={issue.id} to={`/issues/${issue.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {issue.title}
                          </h3>
                          <Badge className={`${getStatusBadge(issue.status)} text-xs whitespace-nowrap`}>
                            {getStatusText(issue.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {issue.description}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {issue.facility}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Phòng {issue.room}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {issue.category}
                          </Badge>
                          <Badge variant={getPriorityBadge(issue.priority)} className="text-xs">
                            {getPriorityText(issue.priority)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Báo cáo: {new Date(issue.reportedAt).toLocaleString('vi-VN')}
                          </span>
                          <span className="text-xs text-gray-500">
                            Lượt báo cáo: {issue.reportCount ?? 1}
                          </span>
                          {issue.assignedTo && (
                            <span className="text-xs text-gray-500">
                              Phụ trách: {issue.assignedTo}
                            </span>
                          )}
                        </div>
                        {issue.status === 'in-progress' && issue.assignedTo && (
                          <p className="text-sm text-orange-600 mt-2">
                            Người phụ trách: {issue.assignedTo}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}