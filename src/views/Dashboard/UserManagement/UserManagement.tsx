import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Typography,
  Paper,
  Stack,
  AppBar,
  CssBaseline,
  Snackbar,
  Alert,
  CircularProgress,
  useTheme,
  IconButton,
  Tooltip,
  InputAdornment
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridColDef,
  GridActionsCellItem,
  GridRowId,
  GridRowParams
} from "@mui/x-data-grid";
import {
  PictureAsPdf as PdfIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from "@mui/icons-material";
import Sidebar from "../../../components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomTheme } from "../../../context/ThemeContext";
import {
  User,
  departments,
  userTypes,
  availabilityOptions
} from "../../../types/userManagementTypes";
import {
  fetchUsers,
  createUser,
  updateUser,
  deactivateUser,
  searchUsers
} from "../../../api/userManagementApi";
import Navbar from "../../../components/Navbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import debounce from "lodash/debounce";

const UserManagement: React.FC = () => {
  const [form, setForm] = useState<Omit<User, 'id'> & { id?: number }>({
    epf: "",
    employeeName: "",
    username: "",
    department: "",
    contact: "",
    email: "",
    userType: "",
    availability: false,
    password: ""
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowId[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchMode] = useState<"client" | "api">("client");
  const [searchedData, setSearchedData] = useState<User[]>([]);
  const theme = useTheme();
  const dataGridRef = useRef<any>(null);
  useCustomTheme();

  const queryClient = useQueryClient();

  // Fetch active users
  const { data: users = [], isLoading: isDataLoading, refetch } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers, 
  });

  // Search users API call
  const { data: apiSearchResults = [], isLoading: isSearching, refetch: searchRefetch } = useQuery({
    queryKey: ["searchUsers", searchTerm],
    queryFn: () => searchUsers(searchTerm),
    enabled: false, // We'll trigger this manually
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar("User created successfully!", "success");
      handleClear();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to create user";
      const errors = error.response?.data?.errors;
      if (errors) {
        showSnackbar(Object.values(errors).flat().join(", "), "error");
      } else {
        showSnackbar(errorMessage, "error");
      }
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: (userData: User) => updateUser(userData.id as number, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar("User updated successfully!", "success");
      handleClear();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to update user";
      const errors = error.response?.data?.errors;
      if (errors) {
        showSnackbar(Object.values(errors).flat().join(", "), "error");
      } else {
        showSnackbar(errorMessage, "error");
      }
    }
  });

  const deactivateUserMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSnackbar("User deactivated successfully!", "success");
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || "Failed to deactivate user", "error");
    }
  });

  // Keep refs for latest values
  const usersRef = useRef(users);
  const searchModeRef = useRef(searchMode);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);
  useEffect(() => {
    searchModeRef.current = searchMode;
  }, [searchMode]);

  // Debounced search function (created only once)
  const debouncedSearch = useRef(
    debounce((term: string) => {
      if (term.trim() === "") {
        setSearchedData([]);
        return;
      }

      if (searchModeRef.current === "api") {
        searchRefetch();
      } else {
        const filtered = usersRef.current.filter(user =>
          Object.values(user).some(
            value =>
              value &&
              value.toString().toLowerCase().includes(term.toLowerCase())
          )
        );
        setSearchedData(filtered);
      }
    }, 500)
  ).current;

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setSearchedData([]);
    }
    return () => debouncedSearch.cancel();
    // Only depend on searchTerm and debouncedSearch (which is stable)
  }, [searchTerm, debouncedSearch]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ value: unknown }>, field: keyof User) => {
    const value = e.target.value;
    if (field === 'availability') {
      setForm(prev => ({
        ...prev,
        [field]: value === 'true' || value === true
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = () => {
    if (!form.epf || !form.employeeName || !form.username || (editId === null && !form.password)) {
      showSnackbar("Please fill all required fields!", "error");
      return;
    }

    const userData = {
      ...form,
      availability: form.availability
    };

    if (editId !== null) {
      updateUserMutation.mutate({ ...userData, id: editId });
    } else {
      createUserMutation.mutate(userData as User);
    }
  };

  const handleClear = () => {
    setForm({
      epf: "",
      employeeName: "",
      username: "",
      department: "",
      contact: "",
      email: "",
      userType: "",
      availability: false,
      password: ""
    });
    setEditId(null);
  };

  const handleEdit = (id: number) => {
    const userToEdit = (searchTerm ? (searchMode === "api" ? apiSearchResults : searchedData) : users).find(user => user.id === id);
    if (userToEdit) {
      setForm({
        ...userToEdit,
        password: ""
      });
      setEditId(id);
      document.getElementById('user-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeactivate = (id: number) => {
    if (window.confirm("Are you sure you want to deactivate this user?")) {
      deactivateUserMutation.mutate(id);
    }
  };

  const handleBulkDeactivate = () => {
    if (rowSelectionModel.length === 0) {
      showSnackbar("Please select users to deactivate", "error");
      return;
    }

    if (window.confirm(`Are you sure you want to deactivate ${rowSelectionModel.length} selected users?`)) {
      Promise.all(rowSelectionModel.map(id => deactivateUserMutation.mutateAsync(id as number)))
        .then(() => {
          showSnackbar(`${rowSelectionModel.length} users deactivated successfully!`, "success");
          setRowSelectionModel([]);
        })
        .catch(() => {
          showSnackbar("Error deactivating some users", "error");
        });
    }
  };

  const handlePrint = () => {
    if (dataGridRef.current) {
      dataGridRef.current.print();
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const dataToExport = searchTerm ? 
      (searchMode === "api" ? apiSearchResults : searchedData) : 
      users;
    
    const tableData = dataToExport.map(user => [
      user.epf,
      user.employeeName,
      user.username,
      user.department,
      user.contact,
      user.email,
      user.userType,
      user.availability ? 'Available' : 'Unavailable'
    ]);

    doc.text('User Management Report', 14, 16);
    autoTable(doc, {
      head: [['EPF', 'Name', 'Username', 'Department', 'Contact', 'Email', 'User Type', 'Status']],
      body: tableData,
      startY: 20,
      styles: {
        cellPadding: 3,
        fontSize: 10,
        valign: 'middle',
        halign: 'center',
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    doc.save('user-management-report.pdf');
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchedData([]);
  };

  const isMutating = createUserMutation.isPending ||
    updateUserMutation.isPending ||
    deactivateUserMutation.isPending;

  const columns: GridColDef<User>[] = [
    { field: 'epf', headerName: 'EPF', width: 120, flex: 1 },
    { field: 'employeeName', headerName: 'Employee Name', width: 180, flex: 1 },
    { field: 'username', headerName: 'Username', width: 120, flex: 1 },
    { field: 'department', headerName: 'Department', width: 120, flex: 1 },
    { field: 'contact', headerName: 'Contact', width: 120, flex: 1 },
    { field: 'email', headerName: 'Email', width: 200, flex: 1 },
    { field: 'userType', headerName: 'User Type', width: 120, flex: 1 },
    { 
      field: 'availability', 
      headerName: 'Status', 
      width: 120,
      flex: 1,
      type: 'boolean',
      renderCell: (params) => (
        <Box
          sx={{
            color: params.value ? theme.palette.success.main : theme.palette.error.main,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: params.value ? theme.palette.success.main : theme.palette.error.main
            }}
          />
          {params.value ? 'Available' : 'Unavailable'}
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 120,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.id as number)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Deactivate"
          onClick={() => handleDeactivate(params.id as number)}
          showInMenu
        />,
      ],
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Tooltip title="Refresh data">
            <IconButton onClick={() => refetch()}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export PDF">
            <IconButton onClick={handleExportPDF}>
              <PdfIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          {rowSelectionModel.length > 0 && (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDeactivate}
              size="small"
              sx={{ ml: 1 }}
            >
              Deactivate Selected
            </Button>
          )}
        </Box>
        <Box>
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton />
          <GridToolbarDensitySelector />
          <GridToolbarExport />
        </Box>
      </GridToolbarContainer>
    );
  }

  // Determine which data to display
  const displayData = searchTerm ? 
    (searchMode === "api" ? apiSearchResults : searchedData) : 
    users;

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen || hovered} setOpen={setSidebarOpen} />

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
            title="User Management"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        <Stack spacing={3} sx={{ p: 3, overflow: 'auto' }}>
          <Paper id="user-form-section" sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main }}>
              {editId !== null ? "Edit User" : "Create New User"}
            </Typography>

            <Stack spacing={2}>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <TextField
                  label="EPF*"
                  name="epf"
                  value={form.epf}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                <TextField
                  label="Employee Name*"
                  name="employeeName"
                  value={form.employeeName}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                <TextField
                  label="Username*"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                {editId === null && (
                  <TextField
                    label="Password*"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                    size="small"
                  />
                )}
                <TextField
                  select
                  label="Department"
                  name="department"
                  value={form.department}
                  onChange={(e) => handleSelectChange(e, "department")}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Contact"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                <TextField
                  select
                  label="User Type"
                  name="userType"
                  value={form.userType}
                  onChange={(e) => handleSelectChange(e, "userType")}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                >
                  {userTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Availability"
                  name="availability"
                  value={form.availability.toString()}
                  onChange={(e) => handleSelectChange(e, "availability")}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                >
                  {availabilityOptions.map((option) => (
                    <MenuItem key={option.label} value={option.value.toString()}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isMutating}
                  startIcon={isMutating ? <CircularProgress size={20} /> : null}
                  sx={{ minWidth: 150 }}
                >
                  {editId !== null ? "Update User" : "Create User"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={isMutating}
                  sx={{ minWidth: 100 }}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: 2, height: 720 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main }}>
                User List
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TextField
                  placeholder="Search users..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ 
                    width: 300,
                    '& .MuiOutlinedInput-root': {
                      pr: 1,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <IconButton
                        size="small"
                        onClick={handleClearSearch}
                        sx={{ visibility: searchTerm ? 'visible' : 'hidden' }}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    ),
                  }}
                />
              </Box>
            </Box>
            <DataGrid
              rows={displayData}
              columns={columns}
              loading={Boolean(isDataLoading || isMutating || (searchTerm && searchMode === "api" && isSearching))}
              slots={{ toolbar: CustomToolbar }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                },
              }}
              checkboxSelection
              disableRowSelectionOnClick
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={(newSelection) => setRowSelectionModel([...newSelection])}
              pageSizeOptions={[5, 10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell': {
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-columnHeaders': {
                  backgroundColor: theme.palette.background.paper,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
                '& .MuiDataGrid-toolbarContainer': {
                  padding: theme.spacing(1),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                },
              }}
              ref={dataGridRef}
            />
          </Paper>
        </Stack>

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
            variant="filled"
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default UserManagement;