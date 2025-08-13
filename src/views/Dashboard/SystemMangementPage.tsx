import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  CssBaseline,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  useTheme,
  Select,
  InputLabel,
  FormControl,
  SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Sidebar from "../../components/Sidebar";
import { useCustomTheme } from '../../context/ThemeContext';
import {
  fetchColors,
  fetchSizes,
  fetchStyles,
  fetchOperations,
  fetchDefects,
  fetchCheckPoints,
  deleteColor,
  deleteSize,
  deleteStyle,
  deleteOperation,
  deleteDefect,
  deleteCheckPoint,
  fetchStyleOptions,
  fetchOperationOptions,
  createColor, createSize, createStyle, createOperation, createDefect, createCheckPoint,
  updateColor, updateSize, updateStyle, updateOperation, updateDefect, updateCheckPoint,
  fetchPartLocations, deletePartLocation, createPartLocation, updatePartLocation
} from '../../api/systemManagementApi';
import Navbar from '../../components/Navbar';

const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [loading, setLoading] = useState({
    table: false,
    form: false,
    delete: false,
    options: false
  });
  const theme = useTheme();
  useCustomTheme();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Data states
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [styles, setStyles] = useState<any[]>([]);
  const [operations, setOperations] = useState<any[]>([]);
  const [defects, setDefects] = useState<any[]>([]);
  const [checkPoints, setCheckPoints] = useState<any[]>([]);
  const [partLocations, setPartLocations] = useState<any[]>([]); 

  // Dropdown options
  const [styleOptions, setStyleOptions] = useState<{ styleNo: string }[]>([]);
  const [operationOptions, setOperationOptions] = useState<{ operation: string }[]>([]);

  // Form states
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [editId, setEditId] = useState<number | null>(null);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, table: true }));
        switch (activeTab) {
          case 0:
            const colorsData = await fetchColors();
            setColors(colorsData);
            break;
          case 1:
            const sizesData = await fetchSizes();
            setSizes(sizesData);
            break;
          case 2:
            const stylesData = await fetchStyles();
            setStyles(stylesData);
            break;
          case 3:
            const operationsData = await fetchOperations();
            setOperations(operationsData);
            break;
          case 4:
            const defectsData = await fetchDefects();
            setDefects(defectsData);
            break;
          case 5:
            const checkPointsData = await fetchCheckPoints();
            setCheckPoints(checkPointsData);
            break;
          case 6:
            const partLocationsData = await fetchPartLocations();
            setPartLocations(partLocationsData);
            break;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Failed to load data', 'error');
      } finally {
        setLoading(prev => ({ ...prev, table: false }));
      }
    };

    fetchData();
  }, [activeTab]);

  // Fetch dropdown options when needed
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        setLoading(prev => ({ ...prev, options: true }));
        const styles = await fetchStyleOptions();
        setStyleOptions(styles);
        const operations = await fetchOperationOptions();
        setOperationOptions(operations);
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
        showSnackbar('Failed to load dropdown options', 'error');
      } finally {
        setLoading(prev => ({ ...prev, options: false }));
      }
    };

    if (activeTab === 3 || activeTab === 4) {
      fetchDropdowns();
    }
  }, [activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleAddClick = () => {
    setFormData({});
    setFieldErrors({});
    setEditId(null);
    setOpenForm(true);
  };

  const handleEditClick = (item: any) => {
    setFormData(item);
    setFieldErrors({});
    setEditId(item.id);
    setOpenForm(true);
  };

  const handleDeleteClick = async (id: number) => {
    try {
      setLoading(prev => ({ ...prev, delete: true }));
      switch (activeTab) {
        case 0: await deleteColor(id); break;
        case 1: await deleteSize(id); break;
        case 2: await deleteStyle(id); break;
        case 3: await deleteOperation(id); break;
        case 4: await deleteDefect(id); break;
        case 5: await deleteCheckPoint(id); break;
        case 6: await deletePartLocation(id); break; // Handle new tab
      }
      showSnackbar('Item deleted successfully', 'success');

      // Refresh data
      switch (activeTab) {
        case 0: setColors(await fetchColors()); break;
        case 1: setSizes(await fetchSizes()); break;
        case 2: setStyles(await fetchStyles()); break;
        case 3: setOperations(await fetchOperations()); break;
        case 4: setDefects(await fetchDefects()); break;
        case 5: setCheckPoints(await fetchCheckPoints()); break;
        case 6: setPartLocations(await fetchPartLocations()); break; // Refresh for new tab
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showSnackbar('Failed to delete item', 'error');
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(prev => ({ ...prev, form: true }));
      setFieldErrors({});
      
      if (editId) {
        // Update existing item
        switch (activeTab) {
          case 0: await updateColor(editId, formData); break;
          case 1: await updateSize(editId, formData); break;
          case 2: await updateStyle(editId, formData); break;
          case 3: await updateOperation(editId, formData); break;
          case 4: await updateDefect(editId, formData); break;
          case 5: await updateCheckPoint(editId, formData); break;
          case 6: await updatePartLocation(editId, formData); break; // Handle new tab
        }
      } else {
        // Create new item
        switch (activeTab) {
          case 0: await createColor(formData); break;
          case 1: await createSize(formData); break;
          case 2: await createStyle(formData); break;
          case 3: await createOperation(formData); break;
          case 4: await createDefect(formData); break;
          case 5: await createCheckPoint(formData); break;
          case 6: await createPartLocation(formData); break; // Handle new tab
        }
      }

      showSnackbar(`Item ${editId ? 'updated' : 'added'} successfully`, 'success');
      setOpenForm(false);

      // Refresh data
      switch (activeTab) {
        case 0: setColors(await fetchColors()); break;
        case 1: setSizes(await fetchSizes()); break;
        case 2: setStyles(await fetchStyles()); break;
        case 3: setOperations(await fetchOperations()); break;
        case 4: setDefects(await fetchDefects()); break;
        case 5: setCheckPoints(await fetchCheckPoints()); break;
        case 6: setPartLocations(await fetchPartLocations()); break; // Refresh for new tab
      }
    } catch (error: any) {
      console.error('Error saving data:', error);
      
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          // Field-specific errors
          setFieldErrors(error.response.data.errors);
        } else if (error.response.data.message) {
          // General error message
          showSnackbar(error.response.data.message, 'error');
        }
      } else {
        showSnackbar(`Failed to ${editId ? 'update' : 'add'} item`, 'error');
      }
    } finally {
      setLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user selects
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderTable = () => {
    switch (activeTab) {
      case 0: // Colors
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Color Code</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {colors.map((color) => (
                  <TableRow key={color.id}>
                    <TableCell>{color.id}</TableCell>
                    <TableCell>{color.color}</TableCell>
                    <TableCell>{color.colorCode}</TableCell>
                    <TableCell>{color.updated_at}</TableCell>
                    <TableCell>{color.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick({
                        ...color,
                        colorCode: color.colorCode
                      })}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(color.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 1: // Sizes
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Size Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sizes.map((size) => (
                  <TableRow key={size.id}>
                    <TableCell>{size.id}</TableCell>
                    <TableCell>{size.sizeName}</TableCell>
                    <TableCell>{size.description}</TableCell>
                    <TableCell>{size.updated_at}</TableCell>
                    <TableCell>{size.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(size)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(size.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 2: // Styles
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Style No</TableCell>
                  <TableCell>Style Description</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {styles.map((style) => (
                  <TableRow key={style.id}>
                    <TableCell>{style.id}</TableCell>
                    <TableCell>{style.styleNo}</TableCell>
                    <TableCell>{style.styleDescription}</TableCell>
                    <TableCell>{style.state}</TableCell>
                    <TableCell>{style.status}</TableCell>
                    <TableCell>{style.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(style)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(style.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 3: // Operations
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Style No</TableCell>
                  <TableCell>Operation</TableCell>
                  <TableCell>Sequence No</TableCell>
                  <TableCell>SMV</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {operations.map((operation) => (
                  <TableRow key={operation.id}>
                    <TableCell>{operation.id}</TableCell>
                    <TableCell>{operation.styleNo}</TableCell>
                    <TableCell>{operation.operation}</TableCell>
                    <TableCell>{operation.sequenceNo}</TableCell>
                    <TableCell>{operation.smv}</TableCell>
                    <TableCell>{operation.status}</TableCell>
                    <TableCell>{operation.created_at}</TableCell>
                    <TableCell>{operation.updated_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(operation)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(operation.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 4: // Defects
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Style No</TableCell>
                  <TableCell>Operation</TableCell>
                  <TableCell>Code No</TableCell>
                  <TableCell>Defect Code</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {defects.map((defect) => (
                  <TableRow key={defect.id}>
                    <TableCell>{defect.id}</TableCell>
                    <TableCell>{defect.styleNo}</TableCell>
                    <TableCell>{defect.operation}</TableCell>
                    <TableCell>{defect.codeNo}</TableCell>
                    <TableCell>{defect.defectCode}</TableCell>
                    <TableCell>{defect.status}</TableCell>
                    <TableCell>{defect.created_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(defect)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(defect.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 5: // CheckPoints
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Check Point Name</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checkPoints.map((checkPoint) => (
                  <TableRow key={checkPoint.id}>
                    <TableCell>{checkPoint.id}</TableCell>
                    <TableCell>{checkPoint.actual_column_name}</TableCell>
                    <TableCell>{checkPoint.created_at}</TableCell>
                    <TableCell>{checkPoint.updated_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(checkPoint)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(checkPoint.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      case 6: // Part Location
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Part</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partLocations.map((partLocation) => (
                  <TableRow key={partLocation.id}>
                    <TableCell>{partLocation.id}</TableCell>
                    <TableCell>{partLocation.part}</TableCell>
                    <TableCell>{partLocation.location}</TableCell>
                    <TableCell>{partLocation.created_at}</TableCell>
                    <TableCell>{partLocation.updated_at}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditClick(partLocation)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteClick(partLocation.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      default:
        return null;
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case 0: // Colors
        return (
          <>
            <TextField
              fullWidth
              label="Color"
              name="color"
              value={formData.color || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.color}
              helperText={fieldErrors.color}
            />
            <TextField
              fullWidth
              label="Color Code"
              name="colorCode"
              value={formData.colorCode || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.colorCode}
              helperText={fieldErrors.colorCode}
            />
          </>
        );
      case 1: // Sizes
        return (
          <>
            <TextField
              fullWidth
              label="Size Name"
              name="sizeName"
              value={formData.sizeName || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.sizeName}
              helperText={fieldErrors.sizeName}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.description}
              helperText={fieldErrors.description}
            />
          </>
        );
      case 2: // Styles
        return (
          <>
            <TextField
              fullWidth
              label="Style No"
              name="styleNo"
              value={formData.styleNo || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.styleNo}
              helperText={fieldErrors.styleNo}
            />
            <TextField
              fullWidth
              label="Style Description"
              name="styleDescription"
              value={formData.styleDescription || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.styleDescription}
              helperText={fieldErrors.styleDescription}
            />
            <TextField
              fullWidth
              label="State"
              name="state"
              value={formData.state || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.state}
              helperText={fieldErrors.state}
            />
            <TextField
              fullWidth
              label="Status"
              name="status"
              value={formData.status || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.status}
              helperText={fieldErrors.status}
            />
          </>
        );
      case 3: // Operations
        return (
          <>
            <FormControl fullWidth margin="normal" error={!!fieldErrors.styleNo}>
              <InputLabel>Style No</InputLabel>
              <Select
                name="styleNo"
                value={formData.styleNo || ''}
                label="Style No"
                onChange={handleSelectChange}
              >
                {styleOptions.map((option) => (
                  <MenuItem key={option.styleNo} value={option.styleNo}>
                    {option.styleNo}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.styleNo && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                  {fieldErrors.styleNo}
                </Box>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Operation"
              name="operation"
              value={formData.operation || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.operation}
              helperText={fieldErrors.operation}
            />
            <TextField
              fullWidth
              label="Sequence No"
              name="sequenceNo"          
              value={formData.sequenceNo || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.sequenceNo}
              helperText={fieldErrors.sequenceNo}
            />
            <TextField
              fullWidth
              label="SMV"
              name="smv"
              type='number'  
              value={formData.smv || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.smv}
              helperText={fieldErrors.smv}
            />
            <TextField
              fullWidth
              label="Status"
              name="status"
              value={formData.status || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.status}
              helperText={fieldErrors.status}
            />
          </>
        );
      case 4: // Defects
        return (
          <>
            <FormControl fullWidth margin="normal" error={!!fieldErrors.styleNo}>
              <InputLabel>Style No</InputLabel>
              <Select
                name="styleNo"
                value={formData.styleNo || ''}
                label="Style No"
                onChange={handleSelectChange}
              >
                {styleOptions.map((option) => (
                  <MenuItem key={option.styleNo} value={option.styleNo}>
                    {option.styleNo}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.styleNo && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                  {fieldErrors.styleNo}
                </Box>
              )}
            </FormControl>
            <FormControl fullWidth margin="normal" error={!!fieldErrors.operation}>
              <InputLabel>Operation</InputLabel>
              <Select
                name="operation"
                value={formData.operation || ''}
                label="Operation"
                onChange={handleSelectChange}
              >
                {operationOptions.map((option) => (
                  <MenuItem key={option.operation} value={option.operation}>
                    {option.operation}
                  </MenuItem>
                ))}
              </Select>
              {fieldErrors.operation && (
                <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
                  {fieldErrors.operation}
                </Box>
              )}
            </FormControl>
            <TextField
              fullWidth
              label="Code No"
              name="codeNo"
              type='number'
              value={formData.codeNo || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.codeNo}
              helperText={fieldErrors.codeNo}
            />
            <TextField
              fullWidth
              label="Defect Code"
              name="defectCode"
              value={formData.defectCode || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.defectCode}
              helperText={fieldErrors.defectCode}
            />
            <TextField
              fullWidth
              label="Status"
              name="status"
              value={formData.status || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.status}
              helperText={fieldErrors.status}
            />
          </>
        );
      case 5: // CheckPoints
        return (
          <>
            <TextField
              fullWidth
              label="Name"
              name="actual_column_name"
              value={formData.actual_column_name|| ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.actual_column_name}
              helperText={fieldErrors.actual_column_name}
            />
          </>
        );
      case 6: // Part Location
        return (
          <>
            <TextField
              fullWidth
              label="Part"
              name="part"
              value={formData.part || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.part}
              helperText={fieldErrors.part}
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location || ''}
              onChange={handleFormChange}
              margin="normal"
              error={!!fieldErrors.location}
              helperText={fieldErrors.location}
            />
          </>
        );
      default:
        return null;
    }
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
            title="System Management"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>
        <Box sx={{ p: 3, flexGrow: 1, overflow: "auto" }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="system management tabs">
              <Tab label="Colors" />
              <Tab label="Sizes" />
              <Tab label="Styles" />
              <Tab label="Operations" />
              <Tab label="Defects" />
              <Tab label="Check Points" />
              <Tab label="Part Location" /> {/* New Tab */}
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddClick}
              disabled={loading.table}
            >
              Add Data
            </Button>
          </Box>

          {loading.table ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            renderTable()
          )}
        </Box>
      </Box>

      {/* Form Dialog */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          {renderForm()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancel</Button>
          <Button
            onClick={handleFormSubmit}
            variant="contained"
            disabled={loading.form}
            startIcon={loading.form ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {loading.form ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default SystemManagement;