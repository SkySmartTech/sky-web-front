export enum UserRole {
  Admin = "Admin",
  superAdmin = "Super Admin",
  User = "User",
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  user_role: UserRole | null;
  user_name: string;
}

export const userRoles = Object.values(UserRole) as UserRole[];