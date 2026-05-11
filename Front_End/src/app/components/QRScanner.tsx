import { useState } from 'react';
import { useNavigate } from 'react-router';
import { QrCode, Scan } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { facilities, buildings } from '../data/mockData';
import { toast } from 'sonner';

export default function QRScanner() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);

  // Demo selection for testing
  const [demoFacility, setDemoFacility] = useState('');
  const [demoBuilding, setDemoBuilding] = useState('');
  const [demoFloor, setDemoFloor] = useState('');
  const [demoRoom, setDemoRoom] = useState('');

  const handleScanQR = () => {
    setIsScanning(true);

    // Simulate QR scan - in real app, this would use device camera
    setTimeout(() => {
      setIsScanning(false);

      // Simulate scanned QR data
      const scannedData = {
        facility: 'Cơ sở Hà Nội',
        building: 'A2',
        floor: '3',
        room: '301',
      };

      toast.success('Đã quét mã QR thành công!');

      // Navigate to report page with pre-filled data
      navigate('/report', {
        state: scannedData
      });
    }, 2000);
  };

  const handleDemoNavigate = () => {
    if (!demoFacility || !demoBuilding || !demoFloor || !demoRoom) {
      toast.error('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    navigate('/report', {
      state: {
        facility: demoFacility,
        building: demoBuilding,
        floor: demoFloor,
        room: demoRoom,
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Quét mã QR phòng học</h2>
        <p className="text-gray-600 mt-2">
          Quét mã QR tại phòng học để báo cáo sự cố nhanh chóng
        </p>
      </div>

      {/* QR Scanner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Quét mã QR
          </CardTitle>
          <CardDescription>
            Sử dụng camera để quét mã QR được dán tại mỗi phòng học
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera placeholder */}
          <div className="relative bg-gray-900 rounded-lg aspect-square max-w-sm mx-auto overflow-hidden">
            {isScanning ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="w-64 h-64 border-4 border-white rounded-lg"></div>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse"></div>
                  <p className="text-white text-center mt-4">Đang quét...</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Scan className="w-24 h-24 mb-4 opacity-50" />
                <p className="text-lg">Nhấn nút bên dưới để bắt đầu quét</p>
              </div>
            )}
          </div>

          <Button
            onClick={handleScanQR}
            className="w-full"
            disabled={isScanning}
          >
            {isScanning ? 'Đang quét...' : 'Bắt đầu quét mã QR'}
          </Button>
        </CardContent>
      </Card>

      {/* Demo Mode - For testing without QR code */}
      <Card>
        <CardHeader>
          <CardTitle>Chế độ thử nghiệm</CardTitle>
          <CardDescription>
            Chọn thông tin phòng học để thử nghiệm (không cần quét QR)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={demoFacility} onValueChange={setDemoFacility}>
              <SelectTrigger>
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

            <Select value={demoBuilding} onValueChange={(value) => {
              setDemoBuilding(value);
              setDemoFloor('');
              setDemoRoom('');
            }}>
              <SelectTrigger>
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

            <Select value={demoFloor} onValueChange={(value) => {
              setDemoFloor(value);
              setDemoRoom('');
            }} disabled={!demoBuilding}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tầng" />
              </SelectTrigger>
              <SelectContent>
                {demoBuilding && buildings.find(b => b.id === demoBuilding)?.floors &&
                  Array.from({ length: buildings.find(b => b.id === demoBuilding)!.floors }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Tầng {i + 1}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            <Select value={demoRoom} onValueChange={setDemoRoom} disabled={!demoFloor}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phòng" />
              </SelectTrigger>
              <SelectContent>
                {demoFloor && Array.from({ length: 6 }, (_, i) => {
                  const roomNumber = `${demoFloor}${(i + 1).toString().padStart(2, '0')}`;
                  return (
                    <SelectItem key={roomNumber} value={roomNumber}>
                      Phòng {roomNumber}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleDemoNavigate} variant="outline" className="w-full">
            Tiếp tục với thông tin đã chọn
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
