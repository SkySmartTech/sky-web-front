import axios from "axios";
import { z } from "zod";
import { Dayjs } from "dayjs";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Day Report Schema
export const dayReportSchema = z.object({
  id: z.number(),
  serverDate: z.string(),
  serverTime: z.string(),
  lineNo: z.string(),
  buyer: z.string(),
  todayTarget: z.number(),
  uptoNow: z.number(),
  uptoTarget: z.number(),
  hourlyBalance: z.number(),
  todayBalance: z.number(),
});

export type DayReport = z.infer<typeof dayReportSchema>;

// Performance Metrics Schema
export const performanceMetricsSchema = z.object({
  performanceEfi: z.number(),
  lineEfi: z.number(),
  totalSuccess: z.number(),
  totalRework: z.number(),
  totalDefect: z.number(),
  topDefects: z.array(z.string()),
});

export type PerformanceMetrics = z.infer<typeof performanceMetricsSchema>;

// Get Day Reports
export async function getDayReports(startDate?: Dayjs | null, endDate?: Dayjs | null) {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate.format('YYYY-MM-DD');
  if (endDate) params.end_date = endDate.format('YYYY-MM-DD');

  const response = await API.get("/dayplan-reports", { params });
  return z.array(dayReportSchema).parse(response.data);
}

// Get Performance Metrics
export async function getPerformanceMetrics(startDate?: Dayjs | null, endDate?: Dayjs | null) {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate.format('YYYY-MM-DD');
  if (endDate) params.end_date = endDate.format('YYYY-MM-DD');

  const response = await API.get("/performance-metrics", { params });
  return performanceMetricsSchema.parse(response.data);
}

export const dayReportService = {
  getReports: getDayReports,
  getMetrics: getPerformanceMetrics,
};