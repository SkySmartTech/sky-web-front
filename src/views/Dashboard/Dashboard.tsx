import { useState, useEffect } from "react";
import {
  AppBar,
  Typography,
  Box,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  CssBaseline,
  useTheme,
  FormControl,
  Select,
  MenuItem
} from "@mui/material";
import Sidebar from "../../components/Sidebar";
import { useCustomTheme } from "../../context/ThemeContext";
import {
  DashboardData,
  fetchAllLines,
  fetchLineData,
  fetchHourlyData,
  mapDashboardData,
  fallbackDashboardData,
  DashboardDataResponse
} from "../../api/dashboardApi";
import Navbar from "../../components/Navbar";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData[]>(fallbackDashboardData);
  const [hourlyData, setHourlyData] = useState<Record<string, number>>({
    '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [lines, setLines] = useState<DashboardDataResponse[]>([]);
  const [selectedLine, setSelectedLine] = useState<string>("");
  const theme = useTheme();
  useCustomTheme();

  // Fetch all lines on component mount
  useEffect(() => {
    const fetchLines = async () => {
      try {
        const linesData = await fetchAllLines();
        setLines(linesData);
        if (linesData.length > 0) {
          setSelectedLine(linesData[0].lineNo);
        }
      } catch (error) {
        console.error("Error fetching lines:", error);
        setLines([]);
      }
    };
    fetchLines();
  }, []);

  // Fetch data when selected line changes
  useEffect(() => {
    if (!selectedLine) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [lineData, hourlySuccess] = await Promise.all([
          fetchLineData(selectedLine),
          fetchHourlyData(selectedLine)
        ]);
        
        const mappedData = mapDashboardData(lineData);
        setDashboardData(mappedData);
        setHourlyData(hourlySuccess);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData(fallbackDashboardData);
        setHourlyData({
          '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 30000);
    return () => clearInterval(intervalId);
  }, [selectedLine]);

  const generateDashboardInfo = (): string[] => {
    if (!selectedLine || lines.length === 0) return [];
    const line = lines.find(l => l.lineNo === selectedLine);
    if (!line) return [];

    return [
      `Team: ${line.lineNo}`,
      `Buyer: ${line.buyer}`,
      `Style: ${line.style}`,
      `Gauge: ${line.gg}`,
      `SMV: ${line.smv}`,
      `Carder: ${line.availableCarder}`,
      `WH/RH: ${line.actualWH}`
    ];
  };

  return (
    <Box sx={{ display: "flex", width: "100%", height: "100vh", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen || hovered} setOpen={setSidebarOpen} />

      <Box component="main" sx={{ flexGrow: 1 }}>
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
            title="Dashboard"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "block", flexDirection: "inherit", alignItems: "flex-end", mr: 0.2 }}>
            <Typography variant="body2" sx={{ height: 10 }}>
              Select Line
            </Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                displayEmpty
                disabled={loading}
              >
                {lines.map((line) => (
                  <MenuItem key={`line-${line.lineNo}`} value={line.lineNo}>
                    {line.lineNo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Stack justifyContent="center" alignItems="center" sx={{ mt: 5 }}>
              <CircularProgress color="primary" />
            </Stack>
          ) : (
            <>
              <Stack spacing={2} sx={{ my: 1 }}>
                <Card sx={{ p: 0, textAlign: "center", borderRadius: "8px", boxShadow: 1 }}>
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={10}
                      justifyContent="center"
                      sx={{
                        flexWrap: "nowrap",
                        overflowX: "auto",
                        py: 1
                      }}
                    >
                      {generateDashboardInfo().map((info, index) => (
                        <Typography key={`info-${index}`} variant="body1" fontWeight="bold">
                          {info}
                        </Typography>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(4, 1fr)',
                gap: 2,
                p: 3,
                height: '600px'
              }}>
                {dashboardData.map((item, index) => {
                  const gridStyles: Record<number, { gridColumn: string; gridRow: string }> = {
                    0: { gridColumn: '1', gridRow: '1 / span 2' },
                    1: { gridColumn: '2', gridRow: '1 / span 2' },
                    2: { gridColumn: '3', gridRow: '1' },
                    3: { gridColumn: '4', gridRow: '1' },
                    4: { gridColumn: '3', gridRow: '2' },
                    5: { gridColumn: '4', gridRow: '2' },
                    6: { gridColumn: '1', gridRow: '3' },
                    7: { gridColumn: '2', gridRow: '3' },
                    8: { gridColumn: '1', gridRow: '4' },
                    9: { gridColumn: '2', gridRow: '4' },
                    10: { gridColumn: '3', gridRow: '3 / span 2' },
                    11: { gridColumn: '4', gridRow: '3 / span 2' }
                  };

                  const currentStyles = gridStyles[index];
                  const isLargeBox = [0, 1, 10, 11].includes(index);

                  return (
                    <Box
                      key={`card-${item.id}`}
                      sx={{
                        ...currentStyles,
                        minHeight: 0
                      }}
                    >
                      <Card
                        sx={{
                          borderRadius: "16px",
                          boxShadow: "0px 4px 24px rgba(0, 0, 0, 0.08)",
                          overflow: "hidden",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "#0780FF",
                            color: "white",
                            p: isLargeBox ? 3 : 2,
                            textAlign: "center",
                            flex: isLargeBox ? 3 : 1,
                            display: "flex",
                            borderBottomLeftRadius: "12px",
                            borderBottomRightRadius: "12px",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant={isLargeBox ? "h3" : "h4"}
                            fontWeight={800}
                            sx={{ fontSize: isLargeBox ? '2.5rem' : '1.5rem' }}
                          >
                            {item.value}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            bgcolor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            p: 1,
                            textAlign: "center",
                            flex: isLargeBox ? 0.8 : 0.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            sx={{ fontSize: isLargeBox ? '1rem' : '0.875rem' }}
                          >
                            {item.title}
                          </Typography>
                        </Box>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            </>
          )}

          <Stack
            direction="row"
            flexWrap="initial"
            spacing={2}
            useFlexGap
            sx={{ width: '100%', mt: 3 }}
          >
            {Object.entries(hourlyData).map(([hour, value]) => (
              <Box
                key={`hour-${hour}`}
                sx={{
                  width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(16.66% - 16px)' },
                }}
              >
                <Card
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: '8px',
                    boxShadow: 3,
                    bgcolor: parseInt(hour) < 5 ? '#00BA57' : '#78B3CE',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-5px)' }
                  }}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    HOUR: {hour}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h5">{value}</Typography>
                </Card>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;