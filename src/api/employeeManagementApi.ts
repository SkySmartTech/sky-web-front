import axios from "axios";
import { Employee } from "../types/employeeManagementTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchEmployees = async (): Promise<Employee[]> => {
  const response = await axios.get(`${API_BASE_URL}/users`); // Changed to /users
  return response.data || [];
};

export const createEmployee = async (employeeData: Employee): Promise<Employee> => {
  const response = await axios.post(`${API_BASE_URL}/users`, employeeData);
  return response.data;
};

export const updateEmployee = async (id: string, employeeData: Employee): Promise<Employee> => {
  const response = await axios.put(`${API_BASE_URL}/users/${id}`, employeeData); // Use PUT for json-server
  return response.data;
};

export const deactivateEmployee = async (id: string): Promise<void> => {
  const response = await axios.delete(`${API_BASE_URL}/users/${id}`); // Use PATCH for partial update
  return response.data;
};

export const searchEmployees = async (searchTerm: string): Promise<Employee[]> => {
  const response = await axios.get(`${API_BASE_URL}/users?q=${searchTerm}`); // json-server search syntax
  return response.data || [];
};

