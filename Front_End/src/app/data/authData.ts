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

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
const STORAGE_KEY = 'qlbh.currentUser';

let csrfToken: string | null = null;
export let currentUser: User | null = null;

const loadStoredUser = () => {
  if (currentUser) return currentUser;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    currentUser = parsed;
    return parsed;
  } catch {
    return null;
  }
};

const setCurrentUser = (user: User | null) => {
  currentUser = user;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

const ensureCsrfToken = async (): Promise<string> => {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${API_BASE}/csrf/`, {
    credentials: 'include',
  });
  if (!response.ok) {
    throw new Error('Không lấy được CSRF token');
  }
  const payload = await response.json();
  csrfToken = payload.csrfToken;
  return csrfToken;
};

const apiPost = async <T>(path: string, body: Record<string, unknown>): Promise<T> => {
  const token = await ensureCsrfToken();
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': token,
    },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message = errorPayload.detail || 'Có lỗi xảy ra';
    throw new Error(message);
  }

  return response.json();
};

export const login = async (username: string, password: string): Promise<User> => {
  const user = await apiPost<User>('/login/', { username, password });
  setCurrentUser(user);
  return user;
};

export const register = async (payload: {
  username: string;
  fullName: string;
  email: string;
  password: string;
  facility: string;
}): Promise<User> => {
  const user = await apiPost<User>('/register/', {
    username: payload.username,
    full_name: payload.fullName,
    email: payload.email,
    password: payload.password,
    userType: 'student',
    facility: payload.facility,
  });
  return user;
};

export const logout = async () => {
  try {
    await apiPost('/logout/', {});
  } finally {
    setCurrentUser(null);
  }
};

export const getCurrentUser = (): User | null => {
  return loadStoredUser();
};

export const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await fetch(`${API_BASE}/me/`, { credentials: 'include' });
    if (!response.ok) {
      setCurrentUser(null);
      return null;
    }
    const user = (await response.json()) as User;
    setCurrentUser(user);
    return user;
  } catch {
    return loadStoredUser();
  }
};
