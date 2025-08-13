import axios from "axios";
import { User } from "../types/userManagementTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchUsers = async (): Promise<User[]> => {
  const response = await axios.get(`${API_BASE_URL}/api/all-users`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  return response.data.data || response.data;
};

export const createUser = async (userData: User): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/api/user-create`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  return response.data;
};

export const updateUser = async (id: number, userData: User): Promise<User> => {
  const response = await axios.post(`${API_BASE_URL}/api/user/${id}/update`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  return response.data;
};

export const deactivateUser = async (id: number): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/user/${id}/availability-update`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
};

export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  const response = await axios.post(
    `${API_BASE_URL}/api/user/search`,
    { keyword: searchTerm },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  return response.data.data || response.data;
};