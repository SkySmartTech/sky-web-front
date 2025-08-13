export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'user';
    permissions: string[];
    avatar?: string;
    lastLogin?: string;
  }