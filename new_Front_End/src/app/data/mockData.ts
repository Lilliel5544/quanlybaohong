export interface Issue {
  id: string;
  title: string;
  description: string;
  facility: string;
  building?: string;
  floor?: string;
  room: string;
  damagedEquipment: string[];
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reportedBy: string;
  reporterCode: string;
  reportedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  imageUrl?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  timeline?: TimelineEvent[];
  isDuplicate?: boolean;
}

export interface TimelineEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  performer: string;
}

export interface Equipment {
  id: string;
  name: string;
  quantity: number;
}

export interface Building {
  id: string;
  name: string;
  floors: number;
}

export const buildings: Building[] = [
  { id: 'A1', name: 'Tòa A1', floors: 6 },
  { id: 'A2', name: 'Tòa A2', floors: 8 },
  { id: 'A3', name: 'Tòa A3', floors: 6 },
];

export const equipmentPerRoom: Equipment[] = [
  { id: 'desk', name: 'Bộ bàn ghế', quantity: 30 },
  { id: 'ac', name: 'Điều hòa', quantity: 4 },
  { id: 'fan', name: 'Quạt trần', quantity: 6 },
  { id: 'light', name: 'Bóng đèn', quantity: 8 },
  { id: 'projector', name: 'Máy chiếu', quantity: 1 },
  { id: 'board', name: 'Bảng', quantity: 1 },
  { id: 'microphone', name: 'Micro', quantity: 1 },
  { id: 'outlet', name: 'Ổ điện', quantity: 12 },
  { id: 'door', name: 'Cửa ra vào', quantity: 3 },
  { id: 'window', name: 'Cửa sổ', quantity: 4 },
];

export const equipmentPerLargeRoom: Equipment[] = [
  { id: 'desk', name: 'Bộ bàn ghế', quantity: 50 },
  { id: 'ac', name: 'Điều hòa', quantity: 6 },
  { id: 'fan', name: 'Quạt trần', quantity: 6 },
  { id: 'light', name: 'Bóng đèn', quantity: 12 },
  { id: 'tv', name: 'Ti vi', quantity: 2 },
  { id: 'projector', name: 'Máy chiếu', quantity: 1 },
  { id: 'board', name: 'Bảng', quantity: 1 },
  { id: 'microphone', name: 'Micro', quantity: 1 },
  { id: 'door', name: 'Cửa ra vào', quantity: 2 },
  { id: 'window', name: 'Cửa sổ', quantity: 4 },
];

export const isLargeRoom = (building: string, room: string): boolean => {
  if (building !== 'A2') return false;
  const largeRooms = ['101', '102', '201', '202'];
  return largeRooms.includes(room);
};

export const getEquipmentForRoom = (building: string, room: string): Equipment[] => {
  return isLargeRoom(building, room) ? equipmentPerLargeRoom : equipmentPerRoom;
};

export const generateRoomName = (floor: number, roomNumber: number): string => {
  return `${floor}${roomNumber.toString().padStart(2, '0')}`;
};

export const getRoomsForFloor = (floor: number): string[] => {
  return Array.from({ length: 6 }, (_, i) => generateRoomName(floor, i + 1));
};

export const getAllRoomsForBuilding = (buildingId: string): string[] => {
  const building = buildings.find(b => b.id === buildingId);
  if (!building) return [];

  const rooms: string[] = [];
  for (let floor = 1; floor <= building.floors; floor++) {
    rooms.push(...getRoomsForFloor(floor));
  }
  return rooms;
};

export const facilities = [
  'Cơ sở Hà Nội',
  'Cơ sở Hồ Chí Minh',
];

export const categories = [
  'Thiết bị điện tử',
  'Bàn ghế',
  'Điện - Đèn',
  'Máy chiếu',
  'Máy lạnh',
  'Bảng đen/bảng trắng',
  'Cửa sổ/Cửa ra vào',
  'Vệ sinh',
  'Khác',
];

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Máy chiếu không hoạt động',
    description: 'Máy chiếu trong phòng 301 không bật được, có thể do lỗi nguồn điện hoặc bóng đèn hỏng',
    facility: 'Cơ sở Hà Nội',
    building: 'A2',
    floor: '3',
    room: '301',
    damagedEquipment: ['projector'],
    status: 'in-progress',
    priority: 'high',
    reportedBy: 'Nguyễn Văn A',
    reporterCode: 'B20DCCN001',
    reportedAt: '2026-04-05T08:30:00',
    assignedTo: 'Trần Văn B',
    timeline: [
      {
        id: 't1-1',
        status: 'reported',
        description: 'Đã báo cáo',
        timestamp: '2026-04-05T08:30:00',
        performer: 'Nguyễn Văn A'
      },
      {
        id: 't1-2',
        status: 'assigned',
        description: 'Đã phân công',
        timestamp: '2026-04-05T09:00:00',
        performer: 'Quản trị viên'
      },
      {
        id: 't1-3',
        status: 'in-progress',
        description: 'Đang kiểm tra thiết bị',
        timestamp: '2026-04-05T10:15:00',
        performer: 'Trần Văn B'
      },
      {
        id: 't1-4',
        status: 'waiting-parts',
        description: 'Chờ linh kiện thay thế',
        timestamp: '2026-04-05T14:30:00',
        performer: 'Trần Văn B'
      }
    ]
  },
  {
    id: '2',
    title: 'Bàn sinh viên bị gãy chân',
    description: 'Bàn số 15 tại phòng 205 bị gãy chân bên phải, cần sửa chữa hoặc thay thế',
    facility: 'Cơ sở Hà Nội',
    building: 'A3',
    floor: '2',
    room: '205',
    damagedEquipment: ['desk'],
    status: 'pending',
    priority: 'medium',
    reportedBy: 'Lê Thị C',
    reporterCode: 'B21DCCN045',
    reportedAt: '2026-04-05T09:15:00',
  },
  {
    id: '3',
    title: 'Đèn huỳnh quang chập chờn',
    description: 'Một số bóng đèn trong phòng 102 bị chập chờn, ảnh hưởng đến học tập',
    facility: 'Cơ sở Hà Nội',
    building: 'A2',
    floor: '1',
    room: '102',
    damagedEquipment: ['light'],
    status: 'resolved',
    priority: 'low',
    reportedBy: 'Phạm Văn D',
    reporterCode: 'GV001',
    reportedAt: '2026-04-03T10:00:00',
    assignedTo: 'Nguyễn Văn E',
    resolvedAt: '2026-04-04T14:30:00',
    notes: 'Đã thay thế 3 bóng đèn mới',
    rating: 5,
    feedback: 'Kỹ thuật viên làm việc rất nhanh và chuyên nghiệp. Đèn đã sáng trở lại bình thường.',
    timeline: [
      {
        id: 't3-1',
        status: 'reported',
        description: 'Đã báo cáo',
        timestamp: '2026-04-03T10:00:00',
        performer: 'Phạm Văn D'
      },
      {
        id: 't3-2',
        status: 'assigned',
        description: 'Đã phân công',
        timestamp: '2026-04-03T11:30:00',
        performer: 'Quản trị viên'
      },
      {
        id: 't3-3',
        status: 'in-progress',
        description: 'Đang xử lý',
        timestamp: '2026-04-04T08:00:00',
        performer: 'Nguyễn Văn E'
      },
      {
        id: 't3-4',
        status: 'inspected',
        description: 'Đã kiểm tra lại',
        timestamp: '2026-04-04T13:45:00',
        performer: 'Nguyễn Văn E'
      },
      {
        id: 't3-5',
        status: 'resolved',
        description: 'Đã xử lý xong',
        timestamp: '2026-04-04T14:30:00',
        performer: 'Nguyễn Văn E'
      }
    ]
  },
  {
    id: '4',
    title: 'Máy lạnh không làm lạnh',
    description: 'Máy lạnh tại phòng 401 chạy nhưng không làm lạnh, phòng học rất nóng',
    facility: 'Cơ sở Hà Nội',
    building: 'A3',
    floor: '4',
    room: '401',
    damagedEquipment: ['ac'],
    status: 'in-progress',
    priority: 'urgent',
    reportedBy: 'Hoàng Thị F',
    reporterCode: 'B20DCCN123',
    reportedAt: '2026-04-05T13:45:00',
    assignedTo: 'Lê Văn G',
    timeline: [
      {
        id: 't4-1',
        status: 'reported',
        description: 'Đã báo cáo',
        timestamp: '2026-04-05T13:45:00',
        performer: 'Hoàng Thị F'
      },
      {
        id: 't4-2',
        status: 'assigned',
        description: 'Đã phân công khẩn cấp',
        timestamp: '2026-04-05T14:00:00',
        performer: 'Quản trị viên'
      },
      {
        id: 't4-3',
        status: 'in-progress',
        description: 'Đang kiểm tra hệ thống làm lạnh',
        timestamp: '2026-04-05T15:30:00',
        performer: 'Lê Văn G'
      },
      {
        id: 't4-4',
        status: 'paused',
        description: 'Tạm dừng xử lý - Chờ chuyên gia',
        timestamp: '2026-04-06T09:00:00',
        performer: 'Lê Văn G'
      }
    ]
  },
  {
    id: '5',
    title: 'Bảng trắng không xóa được',
    description: 'Bảng trắng trong phòng 201 bị dính mực, không thể xóa sạch',
    facility: 'Cơ sở Hồ Chí Minh',
    building: 'A2',
    floor: '2',
    room: '201',
    damagedEquipment: ['board'],
    status: 'pending',
    priority: 'low',
    reportedBy: 'Đặng Văn H',
    reporterCode: 'B21DCCN089',
    reportedAt: '2026-04-05T14:20:00',
    isDuplicate: true,
  },
  {
    id: '6',
    title: 'Quạt trần không quay',
    description: 'Quạt trần thứ 2 tại phòng 105 bị kẹt, không quay được',
    facility: 'Cơ sở Hồ Chí Minh',
    building: 'A3',
    floor: '1',
    room: '105',
    damagedEquipment: ['fan'],
    status: 'resolved',
    priority: 'medium',
    reportedBy: 'Vũ Thị I',
    reporterCode: 'GV015',
    reportedAt: '2026-04-02T11:00:00',
    assignedTo: 'Trần Văn K',
    resolvedAt: '2026-04-03T16:00:00',
    notes: 'Đã tra dầu và kiểm tra motor quạt',
    rating: 4,
    feedback: 'Quạt đã hoạt động tốt, tuy nhiên thời gian xử lý hơi lâu.',
    timeline: [
      {
        id: 't6-1',
        status: 'reported',
        description: 'Đã báo cáo',
        timestamp: '2026-04-02T11:00:00',
        performer: 'Vũ Thị I'
      },
      {
        id: 't6-2',
        status: 'assigned',
        description: 'Đã phân công',
        timestamp: '2026-04-02T14:00:00',
        performer: 'Quản trị viên'
      },
      {
        id: 't6-3',
        status: 'in-progress',
        description: 'Đang xử lý',
        timestamp: '2026-04-03T08:30:00',
        performer: 'Trần Văn K'
      },
      {
        id: 't6-4',
        status: 'waiting-parts',
        description: 'Chờ linh kiện thay thế',
        timestamp: '2026-04-03T10:00:00',
        performer: 'Trần Văn K'
      },
      {
        id: 't6-5',
        status: 'in-progress',
        description: 'Tiếp tục xử lý',
        timestamp: '2026-04-03T14:00:00',
        performer: 'Trần Văn K'
      },
      {
        id: 't6-6',
        status: 'inspected',
        description: 'Đã kiểm tra lại',
        timestamp: '2026-04-03T15:30:00',
        performer: 'Trần Văn K'
      },
      {
        id: 't6-7',
        status: 'resolved',
        description: 'Đã xử lý xong',
        timestamp: '2026-04-03T16:00:00',
        performer: 'Trần Văn K'
      }
    ]
  },
  {
    id: '7',
    title: 'Nhiều thiết bị hỏng cùng lúc',
    description: 'Phòng 506 có nhiều thiết bị hỏng: đèn chập chờn, máy chiếu không bật, và 1 bàn bị gãy',
    facility: 'Cơ sở Hà Nội',
    building: 'A2',
    floor: '5',
    room: '506',
    damagedEquipment: ['light', 'projector', 'desk'],
    status: 'in-progress',
    priority: 'urgent',
    reportedBy: 'Ngô Văn L',
    reporterCode: 'B22DCCN234',
    reportedAt: '2026-04-06T07:30:00',
    assignedTo: 'Phạm Văn M',
    timeline: [
      {
        id: 't7-1',
        status: 'reported',
        description: 'Đã báo cáo',
        timestamp: '2026-04-06T07:30:00',
        performer: 'Ngô Văn L'
      },
      {
        id: 't7-2',
        status: 'assigned',
        description: 'Đã phân công khẩn cấp',
        timestamp: '2026-04-06T07:45:00',
        performer: 'Quản trị viên'
      },
      {
        id: 't7-3',
        status: 'in-progress',
        description: 'Đang kiểm tra hệ thống âm thanh',
        timestamp: '2026-04-06T08:00:00',
        performer: 'Phạm Văn M'
      }
    ]
  },
  {
    id: '8',
    title: 'Ghế giảng viên bị hỏng tay vịn',
    description: 'Ghế giảng viên tại phòng 303 bị gãy tay vịn bên trái',
    facility: 'Cơ sở Hồ Chí Minh',
    building: 'A3',
    floor: '3',
    room: '303',
    damagedEquipment: ['desk'],
    status: 'pending',
    priority: 'low',
    reportedBy: 'Bùi Thị N',
    reporterCode: 'GV032',
    reportedAt: '2026-04-05T16:00:00',
  },
];

export const getIssueById = (id: string): Issue | undefined => {
  return mockIssues.find(issue => issue.id === id);
};

export const getIssueStats = () => {
  const total = mockIssues.length;
  const pending = mockIssues.filter(i => i.status === 'pending').length;
  const inProgress = mockIssues.filter(i => i.status === 'in-progress').length;
  const resolved = mockIssues.filter(i => i.status === 'resolved').length;
  const urgent = mockIssues.filter(i => i.priority === 'urgent').length;
  
  return { total, pending, inProgress, resolved, urgent };
};