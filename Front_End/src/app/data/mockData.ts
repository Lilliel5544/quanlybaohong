export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  facility: string;
  room: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  imageUrl?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  timeline?: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  performer: string;
}

export const facilities = [
  'Cơ sở Hà Nội',
  'Cơ sở Hồ Chí Minh',
  'Cơ sở Đà Nẵng',
  'Cơ sở Huế',
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
    description: 'Máy chiếu trong phòng A301 không bật được, có thể do lỗi nguồn điện hoặc bóng đèn hỏng',
    category: 'Máy chiếu',
    facility: 'Cơ sở Hà Nội',
    room: 'A301',
    status: 'in-progress',
    priority: 'high',
    reportedBy: 'Nguyễn Văn A',
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
    description: 'Bàn số 15 tại phòng B205 bị gãy chân bên phải, cần sửa chữa hoặc thay thế',
    category: 'Bàn ghế',
    facility: 'Cơ sở Hà Nội',
    room: 'B205',
    status: 'pending',
    priority: 'medium',
    reportedBy: 'Lê Thị C',
    reportedAt: '2026-04-05T09:15:00',
  },
  {
    id: '3',
    title: 'Đèn huỳnh quang chập chờn',
    description: 'Một số bóng đèn trong phòng C102 bị chập chờn, ảnh hưởng đến học tập',
    category: 'Điện - Đèn',
    facility: 'Cơ sở Hà Nội',
    room: 'C102',
    status: 'resolved',
    priority: 'low',
    reportedBy: 'Phạm Văn D',
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
    description: 'Máy lạnh tại D401 chạy nhưng không làm lạnh, phòng học rất nóng',
    category: 'Máy lạnh',
    facility: 'Cơ sở Hà Nội',
    room: 'D401',
    status: 'in-progress',
    priority: 'urgent',
    reportedBy: 'Hoàng Thị F',
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
    description: 'Bảng trắng trong phòng E201 bị dính mực, không thể xóa sạch',
    category: 'Bảng đen/bảng trắng',
    facility: 'Cơ sở Hồ Chí Minh',
    room: 'E201',
    status: 'pending',
    priority: 'low',
    reportedBy: 'Đặng Văn H',
    reportedAt: '2026-04-05T14:20:00',
  },
  {
    id: '6',
    title: 'Cửa sổ bị kẹt',
    description: 'Cửa sổ thứ 3 tại phòng F105 bị kẹt, không mở được',
    category: 'Cửa sổ/Cửa ra vào',
    facility: 'Cơ sở Đà Nẵng',
    room: 'F105',
    status: 'resolved',
    priority: 'medium',
    reportedBy: 'Vũ Thị I',
    reportedAt: '2026-04-02T11:00:00',
    assignedTo: 'Trần Văn K',
    resolvedAt: '2026-04-03T16:00:00',
    notes: 'Đã tra dầu và sửa chữa khóa cửa sổ',
    rating: 4,
    feedback: 'Cửa sổ đã hoạt động tốt, tuy nhiên thời gian xử lý hơi lâu.',
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
    title: 'Thiết bị âm thanh không có tiếng',
    description: 'Hệ thống loa và micro tại hội trường A không phát được âm thanh',
    category: 'Thiết bị điện tử',
    facility: 'Cơ sở Hà Nội',
    room: 'Hội trường A',
    status: 'in-progress',
    priority: 'urgent',
    reportedBy: 'Ngô Văn L',
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
    description: 'Ghế giảng viên tại phòng G303 bị gãy tay vịn bên trái',
    category: 'Bàn ghế',
    facility: 'Cơ sở Huế',
    room: 'G303',
    status: 'pending',
    priority: 'low',
    reportedBy: 'Bùi Thị N',
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