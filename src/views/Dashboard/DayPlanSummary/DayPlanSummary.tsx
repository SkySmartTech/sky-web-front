import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Stack,
  Grid,
  Card,
  CardContent,
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useCustomTheme } from "../../../context/ThemeContext";
import Navbar from "../../../components/Navbar";

interface ReportData {
  id: number;
  serverDate: string;
  serverTime: string;
  lineNo: string;
  buyer: string;
  todayTarget: number;
  uptoNow: number;
  uptoTarget: number;
  hourlyBalance: number;
  todayBalance: number;
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
  { field: "serverDate", headerName: "Server Date", width: 120 },
  { field: "serverTime", headerName: "Server Time", width: 120 },
  { field: "lineNo", headerName: "Line No", width: 100 },
  { field: "buyer", headerName: "Buyer", width: 120 },
  { field: "todayTarget", headerName: "Today Target", width: 120, type: 'number' },
  { field: "uptoNow", headerName: "Upto Now", width: 120, type: 'number' },
  { field: "uptoTarget", headerName: "Upto Target", width: 120, type: 'number' },
  { field: "hourlyBalance", headerName: "Hourly Balance", width: 140, type: 'number' },
  { field: "todayBalance", headerName: "Today Balance", width: 140, type: 'number' },
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
    data: metricsData, 
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
      
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen || hovered}
        setOpen={setSidebarOpen}
        
      />
      
      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* AppBar */}
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
            title="Summary" 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
        </AppBar>

        <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Details
          </Typography>

          {/* Performance Metrics Boxes */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Performance EFI
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {metricsData?.performanceEfi?.toFixed(2) ?? 0}%
                    </Typography>
                    <TrendingUpIcon color={(metricsData?.performanceEfi ?? 0) > 0 ? "success" : "error"} sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {(metricsData?.performanceEfi ?? 0) > 0 ? "More than yesterday" : "Less than yesterday"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    LINE EFI
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {metricsData?.lineEfi?.toFixed(2) ?? 0}%
                    </Typography>
                    <TrendingUpIcon color={(metricsData?.lineEfi ?? 0) > 0 ? "success" : "error"} sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {(metricsData?.lineEfi ?? 0) > 0 ? "More than yesterday" : "Less than yesterday"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Success
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {metricsData?.totalSuccess ?? 0}
                    </Typography>
                    <TrendingUpIcon color="success" sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    More than yesterday
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Rework
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {metricsData?.totalRework ?? 0}
                    </Typography>
                    <TrendingUpIcon color="error" sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    More than yesterday
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    Total Defect
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" component="div">
                      {metricsData?.totalDefect ?? 0}
                    </Typography>
                    <TrendingUpIcon color="error" sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    More than yesterday
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4} lg={2}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    TOP 3 DEFECTS
                  </Typography>
                  <Typography variant="h5" component="div">
                    {metricsData?.topDefects?.length ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metricsData?.topDefects?.map((defect, index) => (
                      <div key={index}>{index + 1}. {defect}</div>
                    )) ?? "No data available"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

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
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4}>
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
              <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFetchReports}
                  sx={{ height: '40px' }}
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