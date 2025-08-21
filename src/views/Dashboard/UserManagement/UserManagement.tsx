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
  useTheme,
} from "@mui/material";
import {
  GridColDef,
  GridRowId,
} from "@mui/x-data-grid";

import Sidebar from "../../../components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomTheme } from "../../../context/ThemeContext";
import {
  User,
  UserRole,
  userRoles
} from "../../../types/userManagementTypes";
import {
  fetchUsers,
  createUser,
  updateUser,
  deactivateUser,
  searchUsers
} from "../../../api/userManagementApi";
import Navbar from "../../../components/Navbar";
import debounce from "lodash/debounce";
import UserManagementTable from "./UserManagementTable";

const UserManagement: React.FC = () => {
  const [form, setForm] = useState<User>({
    id: "",
    name: "",
    email: "",
    password: "",
    user_role: null,
    user_name: ""
  });
  const [editId, setEditId] = useState<string | null>(null);
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
  const [formErrors, setFormErrors] = useState<{
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    user_role?: string;
    user_name?: string;
  }>({});
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
    mutationFn: (userData: User) => updateUser(userData.id, userData),
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
      showSnackbar("User deleted successfully!", "success");
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || "Failed to delete user", "error");
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
    setForm(prev => ({
      ...prev,
      [field]: value as UserRole
    }));
  };

  // Utility function to validate email format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Utility function to validate password
  const isValidPassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSave = () => {
    const errors: {
      id?: string;
      name?: string;
      email?: string;
      password?: string;
      user_role?: string;
      user_name?: string;
    } = {};

    if (!form.id) errors.id = "ID is required";
    if (!form.name) errors.name = "Name is required";
    if (!form.user_name) errors.user_name = "Username is required";

    if (!form.email) {
      errors.email = "Email is required";
    } else if (!isValidEmail(form.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (editId === null && !form.password) {
      errors.password = "Password is required";
    } else if (form.password && !isValidPassword(form.password)) {
      errors.password =
        "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character";
    }

    const latestUsers = queryClient.getQueryData<User[]>(["users"]) || [];

    // Duplicate checks
    if (latestUsers.some((user) => user.id === form.id && user.id !== editId)) {
      errors.id = "This ID is already in use";
    }
    if (latestUsers.some((user) => user.user_name === form.user_name && user.id !== editId)) {
      errors.user_name = "This username is already in use";
    }
    if (latestUsers.some((user) => user.email === form.email && user.id !== editId)) {
      errors.email = "This email is already in use";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const userData = {
      ...form,
    };

    if (editId !== null) {
      updateUserMutation.mutate({ ...userData, id: editId });
    } else {
      createUserMutation.mutate(userData as User);
    }
  };

  const handleClear = () => {
    setForm({
      id: "",
      name: "",
      email: "",
      password: "",
      user_role: null,
      user_name: ""
    });
    setEditId(null);
  };

  const handleEdit = (id: string) => {
    const userToEdit = (searchTerm ? (searchMode === "api" ? apiSearchResults : searchedData) : users).find(user => user.id === id);
    if (userToEdit) {
      setForm({
        ...userToEdit,
      });
      setEditId(id);
      document.getElementById('user-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDeactivate = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deactivateUserMutation.mutate(id);
    }
  };

  const isMutating = createUserMutation.isPending ||
    updateUserMutation.isPending ||
    deactivateUserMutation.isPending;

  const columns: GridColDef<User>[] = [
    { field: 'id', headerName: 'ID', width: 120, flex: 0.8 },
    { field: 'name', headerName: 'Name', width: 180, flex: 0.8 },
    { field: 'user_name', headerName: 'Username', width: 120, flex: 0.8 },
    { field: 'contact', headerName: 'Contact', width: 120, flex: 0.8 },
    { field: 'email', headerName: 'Email', width: 200, flex: 0.8 },
    { field: 'user_role', headerName: 'User Role', width: 120, flex: 0.8 },
    {
      field: 'edit',
      headerName: 'Edit',
      width: 100,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'stretch', height: '100%', width: '100%', p: 0 }}>
          <Button
            onClick={() => handleEdit(params.id as string)}
            color="primary"
            variant="contained"
            sx={{
              flex: 1,
              height: '100%',
              borderRadius: 0,
              minWidth: 80,
              padding: 0,
            }}
          >
            Edit
          </Button>
        </Box>
      ),
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'stretch', height: '100%', width: '100%', p: 0 }}>
          <Button
            onClick={() => handleDeactivate(params.id as string)}
            color="error"
            size="small"
            variant="contained"
            sx={{
              flex: 1,
              height: '100%',
              borderRadius: 0,

            }}
          >
            Delete
          </Button>
        </Box>
      ),
    },

  ];

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

        <Stack spacing={0.2} sx={{
          p: 2, overflow: 'auto', maxWidth: '1300px', margin: '0 auto', width: '90%'
        }}>
          <Paper id="user-form-section" sx={{ p: 2, borderRadius: "8px 8px 0 0" }}>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
              {editId !== null ? "Edit User" : "Create New User"}
            </Typography>

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                <TextField
                  label="ID*"
                  name="id"
                  value={form.id ?? ""}
                  onChange={handleChange}
                  error={!!formErrors.id}
                  helperText={formErrors.id}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                <TextField
                  label="Name*"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                <TextField
                  label="Username*"
                  name="user_name"
                  value={form.user_name}
                  onChange={handleChange}
                  error={!!formErrors.user_name}
                  helperText={formErrors.user_name}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                <TextField
                  label="Password*"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                  size="small"
                />
                <TextField
                  select
                  label="User Role"
                  name="user_role"
                  value={form.user_role ?? ""}
                  onChange={(e) => handleSelectChange(e, "user_role")}
                  sx={{ flex: '1 1 calc(20% - 16px)' }}
                  size="small"
                >
                  {userRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isMutating}
                  sx={{ minWidth: 100 }}
                >
                  {editId !== null ? "Update" : "Save"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  disabled={isMutating}
                  sx={{
                    minWidth: 100,
                    color: 'text.primary',
                    backgroundColor: 'warning.light',
                    '&:hover': {
                      backgroundColor: 'warning.main',
                    }
                  }}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper sx={{ p: 2, borderRadius: "0 0 8px 8px", height: 720 }}>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>

            </Box>
            <UserManagementTable
              users={displayData}
              handleEdit={handleEdit}
              handleDelete={handleDeactivate}
              loading={Boolean(isDataLoading || isMutating || (searchTerm && searchMode === "api" && isSearching))}
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