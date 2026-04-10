import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { createIssue, getMeta } from '../data/api';

export default function ReportIssue() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    facility: '',
    room: '',
    priority: 'medium',
  });

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const meta = await getMeta();
        setFacilities(meta.facilities || []);
        setCategories(meta.categories || []);
      } catch (error: any) {
        toast.error(error.message || 'Không thể tải dữ liệu danh mục');
      }
    };

    loadMeta();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.category || 
        !formData.facility || !formData.room) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      await createIssue(formData);
      toast.success('Đã gửi báo cáo sự cố thành công!');
    } catch (error: any) {
      toast.error(error.message || 'Không thể gửi báo cáo sự cố');
      setIsSubmitting(false);
      return;
    }
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      facility: '',
      room: '',
      priority: 'medium',
    });

    // Navigate to issues list after 1 second
    setTimeout(() => {
      navigate('/issues');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Báo cáo sự cố</h2>
        <p className="text-gray-600 mt-2">
          Điền thông tin chi tiết về sự cố cần khắc phục
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin sự cố</CardTitle>
          <CardDescription>
            Vui lòng cung cấp thông tin đầy đủ để chúng tôi có thể xử lý nhanh chóng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Tiêu đề sự cố <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ví dụ: Máy chiếu không hoạt động"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về sự cố, bao gồm các triệu chứng, thời gian phát hiện..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
                  Loại sự cố <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Chọn loại sự cố" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">
                  Mức độ ưu tiên <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  required
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="medium">Trung bình</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                    <SelectItem value="urgent">Khẩn cấp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Facility and Room */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facility">
                  Cơ sở <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.facility}
                  onValueChange={(value) => setFormData({ ...formData, facility: value })}
                  required
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

              <div className="space-y-2">
                <Label htmlFor="room">
                  Phòng học <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="room"
                  placeholder="Ví dụ: A301, B205"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi báo cáo'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/home')}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
