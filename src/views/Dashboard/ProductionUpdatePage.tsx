import { useState, useEffect } from 'react';
import {
  AppBar,
  Typography,
  Box,
  Card,
  CircularProgress,
  Select,
  InputLabel,
  FormControl,
  Avatar,
  Divider,
  CssBaseline,
  Button,
  SelectChangeEvent,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Autocomplete,
  TextField,
  Stack
} from '@mui/material';
import {
  Person,
  Style as StyleIcon,
  AssignmentTurnedIn
} from '@mui/icons-material';
import { Delete } from '@mui/icons-material';
import { useCustomTheme } from "../../context/ThemeContext";
import Sidebar from "../../components/Sidebar";
import { MenuItem } from "@mui/material";
import {
  Production,
  fetchColorData,
  fetchStyleData,
  fetchSizeData,
  fetchCheckPointData,
  fetchTeamData,
  fetchBuyerDetails,
  fetchPartLocationOptions,
  fetchDefectReworkOptions,
  saveProductionUpdate,
  saveHourlyCount,
} from '../../api/productionApi';
import { Controller, useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import Navbar from '../../components/Navbar';
import axios from 'axios';

interface ProductionData {
  buyer: string;
  gg: string;
  smv: string;
  availableCader: string;
  reworkCount: number;
  successCount: number;
  defectCount: number;
  hourlyData: number[];
}

interface Filters {
  teamNo: string;
  style: string;
  color: string;
  size: string;
  checkPoint: string;
}

interface DefectReworkData {
  parts: string[];
  locations: string[];
  defectCodes: string[];
}

interface StyleOption {
  style: any;
  sizeName: any;
  lineNo: any;
  actual_column_name: any;
  checkPointName: any;
  styleDescription: any;
  description: string;
  style_no: string;
}

const defaultProductionData: ProductionData = {
  buyer: '0',
  gg: '0',
  smv: '0',
  availableCader: '0',
  reworkCount: 0,
  successCount: 0,
  defectCount: 0,
  hourlyData: [0, 0, 0, 0, 0, 0, 0, 0]
};

const ProductionUpdatePage = () => {
  const [data, setData] = useState<ProductionData>(defaultProductionData);
  const [defectReworkOptions, setDefectReworkOptions] = useState<DefectReworkData>({
    parts: [],
    locations: [],
    defectCodes: []
  });
  const [loading, setLoading] = useState({
    data: false,
    options: false,
    submit: false,
    defectReworkOptions: false
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    teamNo: '',
    style: '',
    color: '',
    size: '',
    checkPoint: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    anchorOrigin: { vertical: 'top', horizontal: 'center' }
  });
  const [dialogOpen, setDialogOpen] = useState({
    rework: false,
    defect: false
  });
  const [formData, setFormData] = useState({
    part: '',
    location: '',
    defectCode: ''
  });
  const [dropdownOptions, setDropdownOptions] = useState({
    styleDescription: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    checkPoints: [] as string[]
  });
  const [, setInitialLoadComplete] = useState(false);
  const [currentHour, setCurrentHour] = useState<number>(0);
  const theme = useTheme();
  useCustomTheme();

  useEffect(() => {
    const updateCurrentHour = () => {
      const now = new Date();
      setCurrentHour(now.getHours());
    };

    updateCurrentHour();
    const interval = setInterval(updateCurrentHour, 60000);

    return () => clearInterval(interval);
  }, []);

  const fetchProductionData = async (teamNo: string) => {
    if (!teamNo) {
      return defaultProductionData;
    }

    try {
      const res = await axios.post(`/api/get-production-data?lineNo=${teamNo}`);
      const responseData = res.data;
      const productionData = responseData.dayPlan?.[0] || {};

      return {
        buyer: productionData.buyer || "N/A",
        gg: productionData.gg?.toString() || "0",
        smv: productionData.smv?.toString() || "0",
        availableCader: productionData.availableCader?.toString() || "0",
        successCount: responseData.successCount || 0,
        reworkCount: responseData.reworkCount || 0,
        defectCount: responseData.defectCount || 0,
        hourlyData: responseData.hourlySuccess ? [
          responseData.hourlySuccess['1'] || 0,
          responseData.hourlySuccess['2'] || 0,
          responseData.hourlySuccess['3'] || 0,
          responseData.hourlySuccess['4'] || 0,
          responseData.hourlySuccess['5'] || 0,
          responseData.hourlySuccess['6'] || 0,
          responseData.hourlySuccess['7'] || 0,
          responseData.hourlySuccess['8'] || 0
        ] : [0, 0, 0, 0, 0, 0, 0, 0]
      };
    } catch (error) {
      console.error('Error fetching production data:', error);
      return defaultProductionData;
    }
  };

  const loadDropdownOptions = async (teamNo: string) => {
    try {
      setLoading(prev => ({ ...prev, options: true }));

      const [colors, styles, sizes, checkPoints] = await Promise.all([
        fetchColorData(teamNo),
        fetchStyleData(teamNo),
        fetchSizeData(teamNo),
        fetchCheckPointData(teamNo)
      ]);

      setDropdownOptions({
        styleDescription: styles.map((item: any) => item.styleDescription) || [],
        colors: colors.map((item: any) => item.color) || [],
        sizes: sizes.map((item: any) => item.sizeName) || [],
        checkPoints: checkPoints.map((item: any) => item.actual_column_name) || []
      });

    } catch (error) {
      console.error('Error loading dropdown options:', error);
      showSnackbar('Failed to load dropdown options', 'error');
    } finally {
      setLoading(prev => ({ ...prev, options: false }));
    }
  };

  const handleTeamNoChange = async (newValue: string | null, field: any) => {
    field.onChange(newValue);
    if (newValue) {
      try {
        setLoading(prev => ({ ...prev, data: true }));

        setFilters({
          teamNo: newValue,
          style: '',
          color: '',
          size: '',
          checkPoint: ''
        });
        setValue("style", "");
        setValue("color", "");
        setValue("size", "");
        setValue("checkPoint", "");

        await loadDropdownOptions(newValue);

        const productionStats = await fetchProductionData(newValue);
        setData(productionStats);

        const [defectOptions, partLocationOptions] = await Promise.all([
          fetchDefectReworkOptions(newValue),
          fetchPartLocationOptions(newValue)
        ]);

        setDefectReworkOptions({
          parts: Array.from(new Set(partLocationOptions.partLocations.map((item: any) => item.part))) as string[],
          locations: Array.from(new Set(partLocationOptions.partLocations.map((item: any) => item.location))) as string[],
          defectCodes: defectOptions.defectCodes
        });

        const details = await fetchBuyerDetails(newValue);
        const productionData = details.latestProductionData?.[0] || {};
        const dayPlanData = details.dayPlan?.[0] || {};

        // Create new filters with data from both sources
        const newFilters = {
          teamNo: newValue,
          style: productionData.style || dayPlanData.style || "",
          color: productionData.color || dayPlanData.color || "",
          size: productionData.sizeName || dayPlanData.sizeName || "",
          checkPoint: productionData.checkPoint || dayPlanData.checkPoint || ""
        };

        setFilters(newFilters);

        // Set form values if data exists
        if (newFilters.style) setValue("style", newFilters.style);
        if (newFilters.color) setValue("color", newFilters.color);
        if (newFilters.size) setValue("size", newFilters.size);
        if (newFilters.checkPoint) setValue("checkPoint", newFilters.checkPoint);

      } catch (error) {
        console.error('Error loading team details:', error);
        showSnackbar('Failed to load team details', 'error');
      } finally {
        setLoading(prev => ({ ...prev, data: false }));
      }
    } else {
      setFilters({
        teamNo: '',
        style: '',
        color: '',
        size: '',
        checkPoint: ''
      });
      setData(defaultProductionData);
      setDropdownOptions({
        styleDescription: [],
        colors: [],
        sizes: [],
        checkPoints: []
      });
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(prev => ({ ...prev, options: true }));

      } catch (error) {
        console.error('Error loading initial data:', error);
        showSnackbar('Failed to load initial data', 'error');
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
        setInitialLoadComplete(true);
      }
    };

    loadInitialData();
  }, []);

  const handleFormChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDialogOpen = (type: 'rework' | 'defect') => {
    setDialogOpen(prev => ({ ...prev, [type]: true }));
  };

  const handleDialogClose = (type: 'rework' | 'defect') => {
    setDialogOpen(prev => ({ ...prev, [type]: false }));
    setFormData({ part: '', location: '', defectCode: '' });
  };

  const handleSuccessClick = async () => {
    if (!filters.teamNo) {
      showSnackbar("Please select a team first", "error");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      await saveProductionUpdate({
        filters,
        data,
        qualityState: "Success"
      });
      await saveHourlyCount({ filters, qualityState: "Success" });

      const updatedData = await fetchProductionData(filters.teamNo);
      setData(updatedData);

      showSnackbar("Success submitted", "success");
    } catch (error) {
      showSnackbar("Failed to submit success", "error");
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleSubmit = async (type: 'rework' | 'defect') => {
    if (!filters.teamNo) {
      showSnackbar("Please select a team first", "error");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, submit: true }));
      await saveProductionUpdate({
        filters,
        data,
        qualityState: type === "rework" ? "Rework" : "Defect",
        part: formData.part,
        location: formData.location,
        defectCode: formData.defectCode
      });
      await saveHourlyCount({
        filters,
        qualityState: type === "rework" ? "Rework" : "Defect"
      });

      const updatedData = await fetchProductionData(filters.teamNo);
      setData(updatedData);

      showSnackbar(`${type.charAt(0).toUpperCase() + type.slice(1)} submitted successfully`, 'success');
      handleDialogClose(type);
    } catch (error) {
      showSnackbar(`Failed to submit ${type}`, "error");
    } finally {
      setLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity,
      anchorOrigin: { vertical: 'top', horizontal: 'center' }
    });
  };

  const {
    control,
    formState: { errors },
    setValue
  } = useForm<Production>({
    reValidateMode: "onChange",
    mode: "onChange",
  });

  const { data: teamData } = useQuery<StyleOption[]>({
    queryKey: ["teams"],
    queryFn: fetchTeamData,
  });

  const workingHours = {
    start: 8,
    end: 16
  };

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
            title="Production Update"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ mt: 6 }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
          {loading.options ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
              <CircularProgress size={40} />
              <Typography variant="h6" sx={{ ml: 2 }}>Loading initial data...</Typography>
            </Box>
          ) : (
            <Card sx={{ p: 3, borderRadius: '12px', boxShadow: 3 }}>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: { xs: 2, sm: 0 },
                mb: 8,
                width: '100%'
              }}>
                {/* Buyer - Left aligned */}
                <Box sx={{
                  width: { xs: '100%', sm: 'auto' },
                  display: 'flex',
                  justifyContent: 'flex-start',
                  mr: { sm: 'auto' }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    maxWidth: 300
                  }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}><Person /></Avatar>
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">BUYER</Typography>
                      <Typography variant="h6">{data.buyer}</Typography>
                    </div>
                  </Box>
                </Box>

                {/* GG - Centered */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mx: 'auto'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    maxWidth: 300
                  }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}><StyleIcon /></Avatar>
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">GG</Typography>
                      <Typography variant="h6">{data.gg}</Typography>
                    </div>
                  </Box>
                </Box>

                {/* SMV - Centered */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mx: 'auto'
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    maxWidth: 300
                  }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}><AssignmentTurnedIn /></Avatar>
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">SMV</Typography>
                      <Typography variant="h6">{data.smv}</Typography>
                    </div>
                  </Box>
                </Box>

                {/* Present Carder - Right aligned */}
                <Box sx={{
                  width: { xs: '100%', sm: 'auto' },
                  display: 'flex',
                  justifyContent: 'flex-end',
                  ml: { sm: 'auto' }
                }}>
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    maxWidth: 300
                  }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}><Person /></Avatar>
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">PRESENT CARDER</Typography>
                      <Typography variant="h6">{data.availableCader}</Typography>
                    </div>
                  </Box>
                </Box>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 8, flexWrap: 'wrap' }}>
                <Controller
                  control={control}
                  name="teamNo"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={async (_event, newValue) => {
                        await handleTeamNoChange(newValue, field);
                      }}
                      size="small"
                      options={teamData?.map(team => team.lineNo) || []}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem", minWidth: '200px' }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.teamNo}
                          helperText={errors.teamNo && "Required"}
                          label="Team No"
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="style"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue);
                        setFilters(prev => ({
                          ...prev,
                          style: newValue || "",
                        }));
                      }}
                      size="small"
                      options={dropdownOptions.styleDescription || []}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem", minWidth: '200px' }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.style}
                          helperText={errors.style && "Required"}
                          label="Style"
                          disabled={!filters.teamNo}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue);
                        setFilters(prev => ({
                          ...prev,
                          color: newValue || "",
                        }));
                      }}
                      size="small"
                      options={dropdownOptions.colors}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem", minWidth: '200px' }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.color}
                          helperText={errors.color && "Required"}
                          label="Color"
                          disabled={!filters.teamNo}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="size"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue);
                        setFilters(prev => ({
                          ...prev,
                          size: newValue || "",
                        }));
                      }}
                      size="small"
                      options={dropdownOptions.sizes}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem", minWidth: '200px' }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.size}
                          helperText={errors.size && "Required"}
                          label="Size"
                          disabled={!filters.teamNo}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="checkPoint"
                  render={({ field }) => (
                    <Autocomplete
                      value={field.value || ''}
                      onChange={(_event, newValue) => {
                        field.onChange(newValue);
                        setFilters(prev => ({
                          ...prev,
                          checkPoint: newValue || "",
                        }));
                      }}
                      size="small"
                      options={dropdownOptions.checkPoints}
                      getOptionLabel={(option) => option}
                      sx={{ flex: 1, margin: "0.5rem", minWidth: '200px' }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          required
                          error={!!errors.checkPoint}
                          helperText={errors.checkPoint && "Required"}
                          label="Check Point"
                          disabled={!filters.teamNo}
                        />
                      )}
                    />
                  )}
                />
              </Stack>

              {loading.data ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : (
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  mb: 10,
                  mt: 11,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  {/* Success Box - Left aligned */}
                  <Box sx={{
                    width: { xs: '100%', sm: '32%' },
                    display: 'flex',
                    justifyContent: { xs: 'center', sm: 'flex-start' }
                  }}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        background: 'linear-gradient(to right, #00BA57, #006931)',
                        color: 'white',
                        boxShadow: 3,
                        height: 130,
                        width: '100%',
                        maxWidth: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={handleSuccessClick}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Success
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ position: 'absolute', bottom: 10, left: 15 }}>
                          <AssignmentTurnedIn sx={{ fontSize: 40, opacity: 0.8 }} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', position: 'absolute', bottom: 10, right: 15 }}>
                          {data.successCount}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Rework Box - Centered */}
                  <Box sx={{
                    width: { xs: '100%', sm: '32%' },
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        background: 'linear-gradient(to right, #FFD900, #DB5B00)',
                        color: 'white',
                        boxShadow: 3,
                        height: 130,
                        width: '100%',
                        maxWidth: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleDialogOpen('rework')}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Rework
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ position: 'absolute', bottom: 10, left: 15 }}>
                          <StyleIcon sx={{ fontSize: 40, opacity: 0.8 }} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', position: 'absolute', bottom: 10, right: 15 }}>
                          {data.reworkCount}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {/* Defect Box - Right aligned */}
                  <Box sx={{
                    width: { xs: '100%', sm: '32%' },
                    display: 'flex',
                    justifyContent: { xs: 'center', sm: 'flex-end' }
                  }}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: '12px',
                        background: 'linear-gradient(to right, #EB0004, #960003)',
                        color: 'white',
                        boxShadow: 3,
                        height: 130,
                        width: '100%',
                        maxWidth: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        transition: 'transform 0.3s',
                        '&:hover': {
                          transform: 'scale(1.02)',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleDialogOpen('defect')}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Defect
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ position: 'absolute', bottom: 10, left: 15 }}>
                          <Delete sx={{ fontSize: 40, opacity: 0.8 }} />
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', position: 'absolute', bottom: 10, right: 15 }}>
                          {data.defectCount}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}

              <Stack
                direction="row"
                flexWrap="inherit"
                spacing={2}
                useFlexGap
                sx={{ width: '100%', mt: 3 }}
              >
                {Array.isArray(data.hourlyData) && data.hourlyData.map((value, index) => {
                  const hourInDay = workingHours.start + index;
                  const isPastHour = currentHour > hourInDay;
                  const isCurrentHour = currentHour === hourInDay;

                  return (
                    <Box key={index} sx={{
                      mb: 2,
                      width: { xs: '100%', sm: '48%', md: '23%', lg: '12%' },
                      minWidth: '100px'
                    }}>
                      <Box sx={{
                        p: 2,
                        textAlign: 'center',
                        borderRadius: '8px',
                        boxShadow: 3,
                        background: isPastHour
                          ? 'linear-gradient(to right, #00BA57, #006931)' : isCurrentHour ? '#9fe0a2ff' : '#78B3CE',
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'translateY(-5px)' }
                      }}>
                        <Typography variant="subtitle2" color={isPastHour || isCurrentHour ? 'white' : 'textSecondary'}>
                          HOUR: {index + 1}
                        </Typography>
                        <Divider sx={{ my: 1, bgcolor: isPastHour || isCurrentHour ? 'rgba(255,255,255,0.3)' : undefined }} />
                        <Typography variant="h5" sx={{ color: isPastHour || isCurrentHour ? 'white' : undefined }}>
                          {value}
                        </Typography>
                        {isCurrentHour && (
                          <Typography variant="caption" display="block" sx={{ color: 'yellow' }}>
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Card>
          )}
        </Box>

        <Dialog
          open={dialogOpen.rework}
          onClose={() => handleDialogClose('rework')}
          sx={{
            '& .MuiDialog-paper': {
              width: '300px',
              maxWidth: 'none'
            }
          }}
        >
          <DialogTitle>Details for Rework</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <img
                src="/images/tshirt.png"
                alt="Tshirt"
                style={{ width: '100px', height: '100px' }}
              />
            </Box>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Part</InputLabel>
              <Select
                name="part"
                value={formData.part}
                label="Part"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.parts.map((part, index) => (
                  <MenuItem key={`${part}-${index}`} value={part}>{part}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={formData.location}
                label="Location"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.locations.map((location, index) => (
                  <MenuItem key={`${location}-${index}`} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Defect Code</InputLabel>
              <Select
                name="defectCode"
                value={formData.defectCode}
                label="Defect Code"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.defectCodes.map((code, index) => (
                  <MenuItem key={`${code}-${index}`} value={code}>{code}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleDialogClose('rework')} disabled={loading.submit}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit('rework')}
              disabled={loading.submit || !formData.part || !formData.location || !formData.defectCode}
              variant="contained"
            >
              {loading.submit ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={dialogOpen.defect}
          onClose={() => handleDialogClose('defect')}
          sx={{
            '& .MuiDialog-paper': {
              width: '400px',
              maxWidth: 'none'
            }
          }}
        >
          <DialogTitle>Details for Defect</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <img
                src="/images/tshirt.png"
                alt="T-shirt"
                style={{ width: '100px', height: '100px' }}
              />
            </Box>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Part</InputLabel>
              <Select
                name="part"
                value={formData.part}
                label="Part"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.parts.map((part, index) => (
                  <MenuItem key={`${part}-${index}`} value={part}>{part}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={formData.location}
                label="Location"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.locations.map((location, index) => (
                  <MenuItem key={`${location}-${index}`} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ my: 2 }}>
              <InputLabel>Defect Code</InputLabel>
              <Select
                name="defectCode"
                value={formData.defectCode}
                label="Defect Code"
                onChange={handleFormChange}
                disabled={loading.defectReworkOptions}
              >
                {defectReworkOptions.defectCodes.map((code, index) => (
                  <MenuItem key={`${code}-${index}`} value={code}>{code}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleDialogClose('defect')} disabled={loading.submit}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSubmit('defect')}
              disabled={loading.submit || !formData.part || !formData.location || !formData.defectCode}
              variant="contained"
            >
              {loading.submit ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default ProductionUpdatePage;