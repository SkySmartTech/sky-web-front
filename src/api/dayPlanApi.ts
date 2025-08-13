import axios from "axios";
import * as XLSX from "xlsx";

export interface DayPlan {
  id: number;
  lineNo: string;
  respEmployee: string;
  buyer: string;
  style: string;
  gg: string;
  smv: string;
  displayWH: string;
  actualWH: string;
  planTgtPcs: string;
  perHourPcs: string;
  availableCader: string;
  presentLinkers: string;
  checkPoint: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const fetchDayPlans = async (): Promise<DayPlan[]> => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/all-day-plans`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          Accept: 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data.map((plan: any) => ({
      id: plan.id || 0,
      lineNo: plan.lineNo?.toString() || "",
      respEmployee: plan.respEmployee?.toString() || "",
      buyer: plan.buyer?.toString() || "",
      style: plan.style?.toString() || "",
      gg: plan.gg?.toString() || "",
      smv: plan.smv?.toString() || "",
      displayWH: plan.displayWH?.toString() || "",
      actualWH: plan.actualWH?.toString() || "",
      planTgtPcs: plan.planTgtPcs?.toString() || "",
      perHourPcs: plan.perHourPcs?.toString() || "",
      availableCader: plan.availableCader?.toString() || "",
      presentLinkers: plan.presentLinkers?.toString() || "",
      checkPoint: plan.checkPoint?.toString() || "",
      status: plan.status?.toString() || "",
      created_at: plan.created_at || "",
      updated_at: plan.updated_at || ""
    }));
  } catch (error) {
    console.error('Error fetching day plans:', error);
    throw error;
  }
};

export const uploadDayPlanFile = async (file: File): Promise<{ success: boolean; message: string }> => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonArray = XLSX.utils.sheet_to_json(sheet);

    // Fix types for backend validation
    const fixedArray = jsonArray.map((row: any) => ({
      ...row,
      lineNo: row.lineNo?.toString() ?? "",
      actualWH: row.actualWH?.toString() ?? "",
      status: row.status !== undefined && row.status !== null && row.status !== "" ? parseInt(row.status, 10) : 0
    }));

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/day-plan-create`,
      { day_plans: fixedArray },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data) {
      throw new Error('No response data received');
    }

    return {
      success: response.data.success || false,
      message: response.data.message || 'File uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading day plan file:', error);
    throw error;
  }
};