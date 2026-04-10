export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'technician' | 'user';
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    fullName: 'Quản trị viên',
    role: 'admin',
    email: 'admin@ptit.edu.vn',
    isActive: true,
    createdAt: '2026-01-01T00:00:00',
    lastLogin: '2026-04-08T08:00:00',
  },
  {
    id: '2',
    username: 'ktv001',
    fullName: 'Trần Văn B',
    role: 'technician',
    email: 'tranvanb@ptit.edu.vn',
    isActive: true,
    createdAt: '2026-01-15T00:00:00',
    lastLogin: '2026-04-08T07:30:00',
  },
  {
    id: '3',
    username: 'user001',
    fullName: 'Nguyễn Văn A',
    role: 'user',
    email: 'nguyenvana@ptit.edu.vn',
    isActive: true,
    createdAt: '2026-02-01T00:00:00',
    lastLogin: '2026-04-07T15:20:00',
  },
  {
    id: '4',
    username: 'ktv002',
    fullName: 'Lê Văn G',
    role: 'technician',
    email: 'levang@ptit.edu.vn',
    isActive: false,
    createdAt: '2026-01-20T00:00:00',
    lastLogin: '2026-03-15T10:00:00',
  },
];

// Mock current user
export let currentUser: User | null = null;

export const login = (username: string, password: string): User | null => {
  // In a real app, this would authenticate with backend
  // For demo purposes, accept any user with password 'password123'
  if (password === 'password123') {
    const user = mockUsers.find(u => u.username === username);
    if (user && user.isActive) {
      currentUser = user;
      return user;
    }
  }
  return null;
};

export const logout = () => {
  currentUser = null;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const updateUserProfile = (userId: string, updates: Partial<User>): User | null => {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    if (currentUser && currentUser.id === userId) {
      currentUser = mockUsers[userIndex];
    }
    return mockUsers[userIndex];
  }
  return null;
};
