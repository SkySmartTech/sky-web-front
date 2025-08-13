import axios from "axios";

// Define interfaces for each table type
interface Color {
  id: number;
  color: string;
  color_code: string;
  updated_at: string;
  created_at: string;
}

interface Size {
  id: number;
  size_name: string;
  description: string;
  updated_at: string;
  created_at: string;
}

interface Style {
  id: number;
  styleNo: string;
  style_description: string;
  state: string;
  status: string;
  created_at: string;
}

interface Operation {
  id: number;
  styleNo: string;
  operation: string;
  sequence_no: number;
  smv: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Defect {
  id: number;
  style_no: string;
  operation: string;
  code_no: string;
  defect_code: string;
  status: string;
  created_at: string;
}

interface CheckPoint {
  id: number;
  actual_column_name: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface PartLocation {
  id: number;
  part: string;
  location: string;
  created_at: string;
  updated_at: string;
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

// Fetch all data for each table
export const fetchColors = async (): Promise<Color[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all-colors`, getAuthHeader());
    return response.data || [];
  } catch (error) {
    console.error('Error fetching colors:', error);
    throw error;
  }
};

export const fetchSizes = async (): Promise<Size[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all-sizes`, getAuthHeader());
    return response.data || [];
  } catch (error) {
    console.error('Error fetching sizes:', error);
    throw error;
  }
};

export const fetchStyles = async (): Promise<Style[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all-styles`, getAuthHeader());
    return response.data || [];
  } catch (error) {
    console.error('Error fetching styles:', error);
    throw error;
  }
};

export const fetchOperations = async (): Promise<Operation[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all-operations`, getAuthHeader());
    return response.data || [];
  } catch (error) {
    console.error('Error fetching operations:', error);
    throw error;
  }
};

export const fetchDefects = async (): Promise<Defect[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all-defects`, getAuthHeader());
    return response.data || [];
  } catch (error) {
    console.error('Error fetching defects:', error);
    throw error;
  }
};

export const fetchCheckPoints = async (): Promise<CheckPoint[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all-check-points`, getAuthHeader());
    return response.data || [];
  } catch (error) {
    console.error('Error fetching check points:', error);
    throw error;
  }
};

// Fetch all part locations
export const fetchPartLocations = async (): Promise<PartLocation[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all-part-locations`, getAuthHeader());
    return response.data || [];
  } catch (error) {
    console.error('Error fetching part locations:', error);
    throw error;
  }
};

// Create new items
export const createColor = async (data: Omit<Color, 'id' | 'created_at' | 'updated_at'>): Promise<Color> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/color-create`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating color:', error);
    throw error;
  }
};

export const createSize = async (data: Omit<Size, 'id' | 'created_at' | 'updated_at'>): Promise<Size> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/size-create`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating size:', error);
    throw error;
  }
};

export const createStyle = async (data: Omit<Style, 'id' | 'created_at'>): Promise<Style> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/style-create`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating style:', error);
    throw error;
  }
};

export const createOperation = async (data: Omit<Operation, 'id' | 'created_at' | 'updated_at'>): Promise<Operation> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/operation-create`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating operation:', error);
    throw error;
  }
};

export const createDefect = async (data: Omit<Defect, 'id' | 'created_at'>): Promise<Defect> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/defect-create`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating defect:', error);
    throw error;
  }
};

export const createCheckPoint = async (data: Omit<CheckPoint, 'id' | 'created_at' | 'updated_at'>): Promise<CheckPoint> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/check-point-create`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating check point:', error);
    throw error;
  }
};

// Create new part location
export const createPartLocation = async (
  data: Omit<PartLocation, 'id' | 'created_at' | 'updated_at'>
): Promise<PartLocation> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/part-location-create`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error creating part location:', error);
    throw error;
  }
};

// Update items
export const updateColor = async (id: number, data: Partial<Color>): Promise<Color> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/color/${id}/update`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating color:', error);
    throw error;
  }
};

export const updateSize = async (id: number, data: Partial<Size>): Promise<Size> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/size/${id}/update`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating size:', error);
    throw error;
  }
};

export const updateStyle = async (id: number, data: Partial<Style>): Promise<Style> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/style/${id}/update`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating style:', error);
    throw error;
  }
};

export const updateOperation = async (id: number, data: Partial<Operation>): Promise<Operation> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/operation/${id}/update`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating operation:', error);
    throw error;
  }
};

export const updateDefect = async (id: number, data: Partial<Defect>): Promise<Defect> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/defect/${id}/update`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating defect:', error);
    throw error;
  }
};

export const updateCheckPoint = async (id: number, data: Partial<CheckPoint>): Promise<CheckPoint> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/check-point/${id}/update`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating check point:', error);
    throw error;
  }
};

// Update part location
export const updatePartLocation = async (
  id: number,
  data: Partial<PartLocation>
): Promise<PartLocation> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/part-location/${id}/update`, data, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error updating part location:', error);
    throw error;
  }
};

// Delete items
export const deleteColor = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/color/${id}/delete`, getAuthHeader());
  } catch (error) {
    console.error('Error deleting color:', error);
    throw error;
  }
};

export const deleteSize = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/size/${id}/delete`, getAuthHeader());
  } catch (error) {
    console.error('Error deleting size:', error);
    throw error;
  }
};

export const deleteStyle = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/style/${id}/delete`, getAuthHeader());
  } catch (error) {
    console.error('Error deleting style:', error);
    throw error;
  }
};

export const deleteOperation = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/operation/${id}/delete`, getAuthHeader());
  } catch (error) {
    console.error('Error deleting operation:', error);
    throw error;
  }
};

export const deleteDefect = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/defect/${id}/delete`, getAuthHeader());
  } catch (error) {
    console.error('Error deleting defect:', error);
    throw error;
  }
};

export const deleteCheckPoint = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/check-point/${id}/delete`, getAuthHeader());
  } catch (error) {
    console.error('Error deleting check point:', error);
    throw error;
  }
};

// Delete part location
export const deletePartLocation = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/api/part-location/${id}/delete`, getAuthHeader());
  } catch (error) {
    console.error('Error deleting part location:', error);
    throw error;
  }
};

// Fetch dropdown options
export const fetchStyleOptions = async (): Promise<{ styleNo: string }[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all-styles`, getAuthHeader());
    return response.data.map((style: Style) => ({ styleNo: style.styleNo })) || [];
  } catch (error) {
    console.error('Error fetching style options:', error);
    throw error;
  }
};

export const fetchOperationOptions = async (): Promise<{ operation: string }[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/all-operations`, getAuthHeader());
    return response.data.map((op: Operation) => ({ operation: op.operation })) || [];
  } catch (error) {
    console.error('Error fetching operation options:', error);
    throw error;
  }
};