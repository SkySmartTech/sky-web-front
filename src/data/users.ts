// src/data/users.ts
export interface User {
    id: number;
    epf: string;
    employeeName: string;
    username: string;
    password: string;
    department: string;
    contact: string;
    email: string;
    userType: string;
    availability: string;
  }
  
  export const sampleUsers: User[] = [
    {
      id: 1,
      epf: "EPF001",
      employeeName: "John Doe",
      username: "johndoe",
      password: "password123",
      department: "IT",
      contact: "1234567890",
      email: "john.doe@example.com",
      userType: "Admin",
      availability: "Active",
    },
    {
      id: 2,
      epf: "EPF002",
      employeeName: "Jane Smith",
      username: "janesmith",
      password: "password456",
      department: "HR",
      contact: "0987654321",
      email: "jane.smith@example.com",
      userType: "User",
      availability: "Inactive",
    },
    {
      id: 3,
      epf: "EPF003",
      employeeName: "Alice Johnson",
      username: "alicej",
      password: "password789",
      department: "Finance",
      contact: "1122334455",
      email: "alice.johnson@example.com",
      userType: "Manager",
      availability: "Active",
    },
  ];