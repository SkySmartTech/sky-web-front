export interface User {
  id?: number;
  epf: string;
  employeeName: string;
  username: string;
  department: string;
  contact: string;
  email: string;
  userType: string;
  availability: boolean;
  password: string;
}

export const departments = ["IT", "HR", "Finance", "Marketing", "Operations"] as const;
export const userTypes = ["Admin", "User", "Manager"] as const;

export const availabilityOptions = [
  { value: true, label: "Available" },
  { value: false, label: "Not Available" }
] as const;

export const statusOptions = [
  { value: true, label: "Active" },
  { value: false, label: "Inactive" }
] as const;