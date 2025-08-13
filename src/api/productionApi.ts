import axios from "axios";
import { z } from "zod";
import dayjs from "dayjs";

export const productionSchema = z.object({
  id: z.string(),
  teamNo: z.string(),
  style: z.string(),
  color: z.string(),
  size: z.string(),
  checkPoint: z.string(),
});

export type Production = z.infer<typeof productionSchema>;

export async function fetchTeamData() {
  const res = await axios.get("/api/all-day-plans");
  return res.data;
}

export async function fetchColorData(lineNo: string) {
  const res = await axios.get(`/api/all-colors?lineNo=${lineNo}`);
  return res.data;
}

export async function fetchStyleData(lineNo: string) {
  const res = await axios.get(`/api/all-styles?lineNo=${lineNo}`);
  return res.data;
}

export async function fetchSizeData(lineNo: string) {
  const res = await axios.get(`/api/all-sizes?lineNo=${lineNo}`);
  return res.data;
}

export async function fetchCheckPointData(lineNo: string) {
  const res = await axios.get(`/api/all-check-points?lineNo=${lineNo}`);
  return res.data;
}

export async function fetchBuyerDetails(lineNo: string) {
  const res = await axios.post(`/api/get-production-data?lineNo=${lineNo}`);
  return res.data;
}

export async function fetchDefectReworkOptions(lineNo: string) {
  const res = await axios.get(`/api/all-defects?lineNo=${lineNo}`);
  return {
    defectCodes: res.data.map((item: any) => item.defectCode),
  };
}

export async function fetchPartLocationOptions(lineNo: string) {
  const res = await axios.get(`/api/all-part-locations?lineNo=${lineNo}`);
  return {
    partLocations: res.data.map((item: any) => ({
      part: item.part,
      location: item.location,
    })),
  };
}

export async function saveProductionUpdate({
  filters,
  data,
  qualityState,
  part = "",
  location = "",
  defectCode = ""
}: {
  filters: {
    teamNo: string;
    style: string;
    color: string;
    size: string;
    checkPoint: string;
  };
  data: {
    buyer: string;
    gg: string;
    smv: string;
    availableCader: string;
  };
  qualityState: "Success" | "Rework" | "Defect";
  part?: string;
  location?: string;
  defectCode?: string;
}) {
  const body = {
    serverDateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    lineNo: filters.teamNo,
    buyer: data.buyer,
    gg: data.gg,
    smv: Number(data.smv),
    availableCader: Number(data.availableCader),
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
    qualityState,
    part,
    location,
    defectCode,
    state: 1
  };
  
  const res = await axios.post("/api/production-update", body);
  return res.data;
}

export async function saveHourlyCount({
  filters,
  qualityState
}: {
  filters: {
    teamNo: string;
    style: string;
    color: string;
    size: string;
    checkPoint: string;
  };
  qualityState: "Success" | "Rework" | "Defect";
}) {
  const body = {
    serverDateTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
    qualityState
  };
  const res = await axios.post("/api/get-production-data", body);
  return res.data;
}

export async function fetchSuccessCount(filters: {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}) {
  const params = {
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
  };
  const res = await axios.post("/api/get-success-count", params);
  return res.data.successCount ?? 0;
}

export async function fetchReworkCount(filters: {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}) {
  const params = {
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
  };
  const res = await axios.post("/api/get-rework-count", params);
  return res.data.reworkCount ?? 0;
}

export async function fetchDefectCount(filters: {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}) {
  const params = {
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
  };
  const res = await axios.post("/api/get-defect-count", params);
  return res.data.defectCount ?? 0;
}

export async function fetchHourlySuccess(filters: {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}) {
  const params = {
    lineNo: filters.teamNo,
    style: filters.style,
    color: filters.color,
    sizeName: filters.size,
    checkPoint: filters.checkPoint,
  };
  const res = await axios.post("/api/get-hourly-success", params);
  
  const hourlyData = res.data.hourlySuccess || res.data.hourlyData;
  
  if (Array.isArray(hourlyData)) {
    return {
      '1': hourlyData[0] || 0,
      '2': hourlyData[1] || 0,
      '3': hourlyData[2] || 0,
      '4': hourlyData[3] || 0,
      '5': hourlyData[4] || 0,
      '6': hourlyData[5] || 0,
      '7': hourlyData[6] || 0,
      '8': hourlyData[7] || 0,
    };
  }
  
  return hourlyData || {
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0
  };
}