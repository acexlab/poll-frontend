export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Admin' | 'User';
  isActive?: boolean;
  createdAt?: string;
}

export interface LoginResponse {
  token: string;
  role: string;
  user: User;
}
