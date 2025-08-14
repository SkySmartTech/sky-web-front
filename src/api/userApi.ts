import axios from "axios";
import { z } from "zod";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// User Schema
export const userSchema = z.object({
  id: z.number().optional(),
  epf: z.string().min(1, "EPF is required"),
  employeeName: z.string().min(1, "Name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  department: z.string().min(1, "Department is required"),
  contact: z.string().optional(),
  email: z.string().email("Invalid email address")
});

export type User = z.infer<typeof userSchema>;

// Register User
export async function registerUser(userData: User) {
  const response = await API.post("/api/user-register", userData);
  return response.data;
}

// Validate User
export async function validateUser() {
  const response = await API.get("/user");
  return response.data;
}

export const authService = {
  register: registerUser,
  validate: validateUser,
};