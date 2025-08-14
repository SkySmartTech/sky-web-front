// userProfileApi.ts
import axios from "axios";

interface User {
  id: number;
  employeeName: string;
  username: string;
  password: string;
  email: string;
  epf: string;
  department: string;
  contact: string;
  photo: string;
}

export const fetchUserProfile = async (): Promise<User> => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  return {
    id: response.data.id,
    employeeName: response.data.employeeName || "",
    username: response.data.username || "",
    password: "********",
    email: response.data.email || "",
    epf: response.data.epf || "",
    department: response.data.department || "",
    contact: response.data.contact || "",
    photo: response.data.photo || ""
  };
};

export const updateUserProfile = async (id: number, user: Partial<User>): Promise<void> => {
  await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/user/${id}/profile-update`, user, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
};

export const uploadUserPhoto = async (formData: FormData): Promise<void> => {
  await axios.post(`${import.meta.env.VITE_API_BASE_URL}/user/photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
};