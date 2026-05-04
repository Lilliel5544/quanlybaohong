import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner';
import { facilities, buildings, getRoomsForFloor, getEquipmentForRoom } from '../data/mockData';

export default function ReportIssue() {
  const navigate = useNavigate();
  const location = useLocation();
  const preFilledData = location.state as any;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    facility: preFilledData?.facility || '',
    building: preFilledData?.building || '',
    floor: preFilledData?.floor || '',
    room: preFilledData?.room || '',
    damagedEquipment: [] as string[],
    priority: 'medium',
    reportedBy: '',
    reporterCode: '',
  });

  const availableRooms = formData.floor
    ? getRoomsForFloor(parseInt(formData.floor))
    : [];

  const availableEquipment = formData.building && formData.room
    ? getEquipmentForRoom(formData.building, formData.room)
    : [];

  useEffect(() => {
    if (preFilledData) {
      toast.success('Đã điền sẵn thông tin từ mã QR');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.title || !formData.description ||
        !formData.facility || !formData.building || !formData.floor ||
        !formData.room || !formData.reportedBy || !formData.reporterCode ||
        formData.damagedEquipment.length === 0) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc và chọn ít nhất một thiết bị bị hỏng');
      return;
    }

    // In a real app, this would send data to backend
    toast.success('Đã gửi báo cáo sự cố thành công!');

    // Reset form
    setFormData({
      title: '',
      description: '',
      facility: '',
      building: '',
      floor: '',
      room: '',
      damagedEquipment: [],
      priority: 'medium',
      reportedBy: '',
      reporterCode: '',
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

            {/* Damaged Equipment - Moved up */}
            <div className="space-y-3">
              <Label>
                Thiết bị bị hỏng <span className="text-red-500">*</span>
              </Label>
              <div className="border rounded-lg p-4 space-y-3 bg-gray-50 max-h-64 overflow-y-auto">
                {availableEquipment.length > 0 ? (
                  availableEquipment.map((equipment) => (
                    <div key={equipment.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={equipment.id}
                        checked={formData.damagedEquipment.includes(equipment.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              damagedEquipment: [...formData.damagedEquipment, equipment.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              damagedEquipment: formData.damagedEquipment.filter(id => id !== equipment.id)
                            });
                          }
                        }}
                      />
                      <Label
                        htmlFor={equipment.id}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {equipment.name} (x{equipment.quantity})
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Vui lòng chọn tòa nhà và phòng học để xem danh sách thiết bị
                  </p>
                )}
              </div>
              {formData.damagedEquipment.length > 0 && (
                <p className="text-sm text-green-600">
                  Đã chọn {formData.damagedEquipment.length} loại thiết bị
                </p>
              )}
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

            {/* Priority */}
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

            {/* Facility */}
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

            {/* Building, Floor, Room */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building">
                  Tòa nhà <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.building}
                  onValueChange={(value) => setFormData({ ...formData, building: value, floor: '', room: '' })}
                  required
                >
                  <SelectTrigger id="building">
                    <SelectValue placeholder="Chọn tòa" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">
                  Tầng <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.floor}
                  onValueChange={(value) => setFormData({ ...formData, floor: value, room: '' })}
                  disabled={!formData.building}
                  required
                >
                  <SelectTrigger id="floor">
                    <SelectValue placeholder="Chọn tầng" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.building && buildings.find(b => b.id === formData.building)?.floors &&
                      Array.from({ length: buildings.find(b => b.id === formData.building)!.floors }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          Tầng {i + 1}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="room">
                  Phòng học <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) => setFormData({ ...formData, room: value })}
                  disabled={!formData.floor}
                  required
                >
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Chọn phòng" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reporter Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportedBy">
                  Người báo cáo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reportedBy"
                  placeholder="Họ và tên"
                  value={formData.reportedBy}
                  onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reporterCode">
                  Mã sinh viên/giảng viên <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="reporterCode"
                  placeholder="VD: B20DCCN001 hoặc GV001"
                  value={formData.reporterCode}
                  onChange={(e) => setFormData({ ...formData, reporterCode: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                Gửi báo cáo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/')}
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
