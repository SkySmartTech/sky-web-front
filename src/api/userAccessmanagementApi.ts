import axios from "axios";

export type PermissionKey = 
  | "homeDashboard"
  | "p2pSection"
  | "productionDashboard"
  | "productionUpdate"
  | "dayPlanUpload"
  | "dayPlanReports"
  | "dayPlanSummary"
  | "userManagement"
  | "userAccount"
  | "userManagementSub"
  | "userAccessManagement"
  | "systemManagement"
  | "userProfile"
  | "autoRefresh";

export interface UserRole {
  userType: string | number | readonly string[] | undefined;
  id: string;
  name: string;
  description: string;
  permissionObject: PermissionKey[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAuthHeader = () => {
  const token = localStorage.getItem('authToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const fetchUserRoles = async (): Promise<UserRole[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user-accesses`, getAuthHeader());
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch user roles');
  }
};

export const createUserRole = async (roleData: {
  userType: string;
  description: string;
  permissionObject: PermissionKey[];
}): Promise<UserRole> => {
  try {
    const payload = {
      ...roleData,
      userType: roleData.userType
    };
    const response = await axios.post(
      `${API_BASE_URL}/api/add-user`,
      payload,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to create user role');
  }
};

export const updateUserRole = async (id: string, roleData: Partial<Omit<UserRole, 'id'>>): Promise<UserRole> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/user-access/${id}/update`,
      roleData,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to update user role');
  }
};

export const deleteUserRole = async (id: string): Promise<void> => {
  try {
    await axios.delete(
      `${API_BASE_URL}/api/user-access/${id}/delete`,
      getAuthHeader()
    );
  } catch (error) {
    throw new Error('Failed to delete user role');
  }
};

export const checkUserPermission = async (permission: PermissionKey): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/user-permissions`, getAuthHeader());
    return response.data.permissions.includes(permission);
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
};