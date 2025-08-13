import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Stack,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  CssBaseline,
  useTheme
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import Sidebar from "../../../components/Sidebar";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCustomTheme } from "../../../context/ThemeContext";
import Navbar from "../../../components/Navbar";

interface ReportData {
  id: number;
  serverDateTime: string;
  lineNo: string;
  buyer: string;
  style: string;
  color: string;
  size: string;
  success: number;
  rework: number;
  defect: number;
}

interface PerformanceMetrics {
  performanceEfi: number;
  lineEfi: number;
  totalSuccess: number;
  totalRework: number;
  totalDefect: number;
  topDefects: string[];
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 80 },
  { field: "serverDateTime", headerName: "Server Date Time", width: 180 },
  { field: "lineNo", headerName: "Line No", width: 120 },
  { field: "buyer", headerName: "Buyer", width: 120 },
  { field: "style", headerName: "Style", width: 120 },
  { field: "color", headerName: "Color", width: 120 },
  { field: "size", headerName: "Size", width: 120 },
  { field: "success", headerName: "Success", width: 120, type: 'number' },
  { field: "rework", headerName: "Rework", width: 120, type: 'number' },
  { field: "defect", headerName: "Defect", width: 150, type: 'number' },
];

const fetchReports = async (startDate?: Dayjs | null, endDate?: Dayjs | null): Promise<ReportData[]> => {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate.format('YYYY-MM-DD');
  if (endDate) params.end_date = endDate.format('YYYY-MM-DD');

  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dayplan-reports`, { params });
  return response.data;
};

const fetchMetrics = async (startDate?: Dayjs | null, endDate?: Dayjs | null): Promise<PerformanceMetrics> => {
  const params: Record<string, string> = {};
  if (startDate) params.start_date = startDate.format('YYYY-MM-DD');
  if (endDate) params.end_date = endDate.format('YYYY-MM-DD');

  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/performance-metrics`, { params });
  return response.data;
};

const DayPlanReport = () => {
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 10,
    page: 0,
  });
  const theme = useTheme();
  useCustomTheme();

  // Fetch reports data
  const {
    data: reportsData,
    isLoading: isReportsLoading,
    isError: isReportsError,
    refetch: refetchReports
  } = useQuery({
    queryKey: ["dayplan-reports", startDate, endDate],
    queryFn: () => fetchReports(startDate, endDate),
    enabled: false
  });

  // Fetch performance metrics
  const {
    isLoading: isMetricsLoading,
    isError: isMetricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ["performance-metrics", startDate, endDate],
    queryFn: () => fetchMetrics(startDate, endDate),
    enabled: false
  });

  const handleFetchReports = async () => {
    if (!startDate || !endDate) {
      showSnackbar("Please select both start and end dates.", "error");
      return;
    }

    try {
      await Promise.all([refetchReports(), refetchMetrics()]);
      showSnackbar("Reports fetched successfully", "success");
    } catch (error) {
      console.error("Error fetching reports:", error);
      showSnackbar("Failed to fetch reports", "error");
    }
  };


  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const isLoading = isReportsLoading || isMetricsLoading;
  const isError = isReportsError || isMetricsError;

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar
        open={sidebarOpen || hovered}
        setOpen={setSidebarOpen}

      />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar
          position="static"
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.drawer + 1,
            color: theme.palette.text.primary
          }}
        >
          <Navbar
            title="Day Plan Reports"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>

          {/* Date Pickers & View Reports */}
          <Box
            sx={{

              padding: 2,
              borderRadius: 1,
              mb: 3,
              boxShadow: 1
            }}
          >
            <Grid container spacing={2} alignItems="center">
              {/* Date pickers on the left */}
              <Grid item xs={6} sm={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true,
                        size: 'small'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6} sm={2}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true,
                        size: 'small'
                      }
                    }}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Spacer to push button to the right */}
              <Grid item xs={12} sm={8} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFetchReports}
                  sx={{
                    height: '40px',
                    minWidth: '150px'
                  }}
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isLoading ? "Loading..." : "View Reports"}
                </Button>
              </Grid>
            </Grid>
          </Box>
          {/* Export Buttons */}
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mb: 1 }}>
            <Button startIcon={<FileCopyIcon />} size="small">
              Copy
            </Button>
            <Button startIcon={<PrintIcon />} size="small">
              Print
            </Button>
            <Button startIcon={<FileDownloadIcon />} size="small">
              Excel
            </Button>
            <Button startIcon={<FileDownloadIcon />} size="small">
              CSV
            </Button>
            <Button startIcon={<FileDownloadIcon />} size="small">
              PDF
            </Button>
          </Stack>

          {/* DataGrid Table */}
          <Box sx={{ height: 500, p: 2, borderRadius: 1, boxShadow: 1 }}>
            {isError ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography color="error">Error loading data</Typography>
              </Box>
            ) : (
              <DataGrid
                rows={reportsData || []}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[5, 10, 25]}
                checkboxSelection
                loading={isLoading}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DayPlanReport;