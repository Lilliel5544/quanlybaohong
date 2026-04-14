export interface TimelineEvent {
  id: string;
  status: string;
  description: string;
  timestamp: string;
  performer: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  facility: string;
  room: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'rejected' | string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | string;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  imageUrl?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  timeline?: TimelineEvent[];
  reportCount?: number;
}

export interface IssueComment {
  id: string;
  comment: string;
  userName: string;
  userFullName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  ticketId?: number | null;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'technician' | 'user' | string;
  email?: string;
  isActive: boolean;
  createdAt?: string;
  lastLogin?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

let csrfToken: string | null = null;

const authEvent = () => {
  window.dispatchEvent(new Event('auth-change'));
};

const notificationsEvent = () => {
  window.dispatchEvent(new Event('notifications-change'));
};

const mapRole = (role: string) => {
  if (role === 'Admin') return 'admin';
  if (role === 'Kỹ thuật viên') return 'technician';
  return 'user';
};

const mapUser = (data: any): User => {
  return {
    id: String(data.id),
    username: data.username,
    fullName: data.full_name || data.fullName || data.username,
    role: mapRole(data.role || 'user'),
    email: data.email || '',
    isActive: data.is_active ?? data.isActive ?? true,
    createdAt: data.created_at || data.createdAt || new Date().toISOString(),
    lastLogin: data.last_login || data.lastLogin,
  };
};

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem('currentUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User | null) => {
  if (!user) {
    localStorage.removeItem('currentUser');
  } else {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
  authEvent();
};

const ensureCsrf = async (): Promise<string> => {
  if (csrfToken) return csrfToken;
  const res = await fetch(`${API_BASE}/csrf/`, { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken || null;
  if (!csrfToken) {
    throw new Error('Không thể lấy CSRF token.');
  }
  return csrfToken;
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const method = (options.method || 'GET').toString().toUpperCase();
  const headers = new Headers(options.headers || {});

  if (method !== 'GET' && method !== 'HEAD') {
    const token = await ensureCsrf();
    headers.set('X-CSRFToken', token);
  }

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail = typeof payload === 'string' ? payload : payload.detail || 'Đã xảy ra lỗi.';
    throw new Error(detail);
  }

  return payload;
};

export const login = async (username: string, password: string): Promise<User> => {
  const data = await apiFetch('/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const user = mapUser(data);
  setStoredUser(user);
  return user;
};

export const register = async (payload: {
  username: string;
  password: string;
  full_name: string;
  phone_no?: string;
}): Promise<User> => {
  const data = await apiFetch('/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapUser(data);
};

export const logout = async () => {
  await apiFetch('/logout/', { method: 'POST' });
  setStoredUser(null);
};

export const getMe = async (): Promise<User> => {
  const data = await apiFetch('/me/');
  const user = mapUser(data);
  setStoredUser(user);
  return user;
};

export const getIssues = async (status?: string): Promise<Issue[]> => {
  const params = new URLSearchParams();
  if (status && status !== 'all') {
    params.set('status', status);
  }
  const query = params.toString();
  return apiFetch(query ? `/issues/?${query}` : '/issues/');
};

export const getIssue = async (id: string): Promise<Issue> => {
  return apiFetch(`/issues/${id}/`);
};

export const createIssue = async (payload: {
  title: string;
  description: string;
  category: string;
  facility: string;
  room: string;
  priority: string;
}): Promise<{ duplicate: boolean; issue: Issue }> => {
  return apiFetch('/issues/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateIssueStatus = async (id: string, status: string, note?: string) => {
  return apiFetch(`/issues/${id}/status/`, {
    method: 'POST',
    body: JSON.stringify({ status, note }),
  });
};

export const deleteIssue = async (id: string) => {
  return apiFetch(`/issues/${id}/`, {
    method: 'DELETE',
  });
};

export const getIssueComments = async (id: string): Promise<IssueComment[]> => {
  return apiFetch(`/issues/${id}/comments/`);
};

export const createIssueComment = async (id: string, comment: string): Promise<IssueComment> => {
  return apiFetch(`/issues/${id}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  });
};

export const getNotifications = async (): Promise<Notification[]> => {
  return apiFetch('/notifications/');
};

export const markNotificationRead = async (id: string): Promise<Notification> => {
  const data = await apiFetch(`/notifications/${id}/read/`, { method: 'POST' });
  notificationsEvent();
  return data;
};

export const markAllNotificationsRead = async (): Promise<{ detail: string }> => {
  const data = await apiFetch('/notifications/read-all/', { method: 'POST' });
  notificationsEvent();
  return data;
};

export const getMeta = async (): Promise<{ facilities: string[]; categories: string[] }> => {
  return apiFetch('/meta/');
};
