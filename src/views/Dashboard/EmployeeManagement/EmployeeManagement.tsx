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
    GridRowParams
} from "@mui/x-data-grid";

import Sidebar from "../../../components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomTheme } from "../../../context/ThemeContext";
import { Employee, job_title, departments } from "../../../types/employeeManagementTypes";
import {
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deactivateEmployee,
    searchEmployees
} from "../../../api/employeeManagementApi";
import Navbar from "../../../components/Navbar";
import debounce from "lodash/debounce";
import EmployeeManagementTable from "./EmployeeManagementTable";

const EmployeeManagement: React.FC = () => {
    const [form, setForm] = useState<Employee>({
        id: "",
        firstName: "",
        lastName: "",
        department: "",
        phone: "",
        email: "",
        job_title: "",
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
    const [searchedData, setSearchedData] = useState<Employee[]>([]);
    const [formErrors, setFormErrors] = useState<{
        id?: string;
        firstName?: string;
        lastName?: string;
        job_title?: string;
        department?: string;
        email?: string;
        phone?: string;
    }>({});
    const theme = useTheme();
    const dataGridRef = useRef<any>(null);
    useCustomTheme();

    const queryClient = useQueryClient();

    // Fetch active users
    const { data: employees = [], isLoading: isDataLoading, refetch } = useQuery<Employee[]>({
        queryKey: ["employees"],
        queryFn: fetchEmployees,
    });

    // Search users API call
    const { data: apiSearchResults = [], isLoading: isSearching, refetch: searchRefetch } = useQuery({
        queryKey: ["searchEmpolyees", searchTerm],
        queryFn: () => searchEmployees(searchTerm),
        enabled: false, // We'll trigger this manually
    });

    // Mutations
    const createEmployeeMutation = useMutation({
        mutationFn: createEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
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

    const updateEmployeeMutation = useMutation({
        mutationFn: (employeeData: Employee & { id: string }) =>
            updateEmployee(employeeData.id, employeeData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
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

    const deactivateEmployeeMutation = useMutation({
        mutationFn: deactivateEmployee,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            showSnackbar("User deleted successfully!", "success");
        },
        onError: (error: any) => {
            showSnackbar(error.response?.data?.message || "Failed to delete user", "error");
        }
    });

    // Keep refs for latest values
    const usersRef = useRef(employees);
    const searchModeRef = useRef(searchMode);

    useEffect(() => {
        usersRef.current = employees;
    }, [employees]);
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
                const filtered = usersRef.current.filter(employee =>
                    Object.values(employee).some(
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

    const handleSelectChange = (e: React.ChangeEvent<{ value: unknown }>, field: keyof Employee) => {
        const value = e.target.value;
        setForm(prev => ({
            ...prev,
            [field]: e.target.value as string
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
            firstName?: string;
            lastName?: string;
            department?: string;
            phone?: string;
            email?: string;
            job_title?: string;
        } = {};

        if (!form.id) errors.id = "ID is required";
        if (!form.firstName) errors.firstName = "First Name is required";
        if (!form.lastName) errors.lastName = "Last Name is required";

        if (!form.email) {
            errors.email = "Email is required";
        } else if (!isValidEmail(form.email)) {
            errors.email = "Please enter a valid email address";
        }


        // if (users.some((user) => user.id === form.id && user.id !== editId)) {
        //   errors.id = "This ID is already in use";
        // }
        // if (users.some((user) => user.user_name === form.user_name && user.id !== editId)) {
        //   errors.user_name = "This username is already in use";
        // }
        // if (users.some((user) => user.email === form.email && user.id !== editId)) {
        //   errors.email = "This email is already in use";
        // }

        setFormErrors({});

        const EmployeeData = {
            ...form,
        };

    };

    const handleClear = () => {
        setForm({
            id: "",
            firstName: "",
            lastName: "",
            job_title: "",
            department: "",
            email: "",
            phone: "",
        });
        setEditId(null);
        setFormErrors({});
    };

    const handleEdit = (id: string) => {
        const employeeToEdit = (searchTerm ? (searchMode === "api" ? apiSearchResults : searchedData) : employees).find(employee => employee.id === id);
        if (employeeToEdit) {
            setForm({
                ...employeeToEdit,
            });
            setEditId(id);
            document.getElementById('user-form-section')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDeactivate = (id: string) => {
        if (window.confirm("Are you sure you want to delete this employee?")) {
            deactivateEmployeeMutation.mutate(id);
        }
    };

    const isMutating = createEmployeeMutation.isPending ||
        updateEmployeeMutation.isPending ||
        deactivateEmployeeMutation.isPending;

    const columns: GridColDef<Employee>[] = [
        { field: 'id', headerName: 'ID', width: 120, flex: 1, type: 'string' },
        { field: 'firstName', headerName: 'First Name', width: 180, flex: 1 },
        { field: 'lastName', headerName: 'Last Name', width: 120, flex: 1 },
        { field: 'job_title', headerName: 'Job Title', width: 120, flex: 1 },
        { field: 'department', headerName: 'Department', width: 120, flex: 1 },
        { field: 'email', headerName: 'Email', width: 200, flex: 1 },
        { field: 'phone', headerName: 'Contact', width: 120, flex: 1 },
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
            ),
        },

    ];

    // Determine which data to display
    const displayData = searchTerm ?
        (searchMode === "api" ? apiSearchResults : searchedData) :
        employees;

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
                        title="Employee Management"
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                </AppBar>

                <Stack spacing={0.2} sx={{ p: 3, overflow: 'auto' }}>
                    <Paper id="user-form-section" sx={{ p: 3, borderRadius: "8px 8px 0 0" }}>
                        <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main }}>
                            {editId !== null ? "Edit Employee" : "Create New Employee"}
                        </Typography>

                        <Stack spacing={2}>
                            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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
                                    label="First Name*"
                                    name="firstName"
                                    value={form.firstName}
                                    onChange={handleChange}
                                    error={!!formErrors.firstName}
                                    helperText={formErrors.firstName}
                                    sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                                    size="small"
                                />
                                <TextField
                                    label="Last Name*"
                                    name="lastName"
                                    value={form.lastName}
                                    onChange={handleChange}
                                    error={!!formErrors.lastName}
                                    helperText={formErrors.lastName}
                                    sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                                    size="small"
                                />
                                <TextField
                                    select
                                    label="Job Title*"
                                    name="job_title"
                                    value={form.job_title}
                                    onChange={(e) => handleSelectChange(e, "job_title")}
                                    error={!!formErrors.job_title}
                                    helperText={formErrors.job_title}
                                    sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                                    size="small"
                                >
                                    {job_title.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    select
                                    label="Department*"
                                    name="department"
                                    value={form.department}
                                    onChange={(e) => handleSelectChange(e, "department")}
                                    error={!!formErrors.department}
                                    helperText={formErrors.department}
                                    sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                                    size="small"
                                >
                                    {departments.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                                <TextField
                                    label="Email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}

                                    sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                                    size="small"
                                />
                                <TextField
                                    label="Phone*"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    error={!!formErrors.phone}
                                    helperText={formErrors.phone}
                                    sx={{ flex: '1 1 calc(9.09% - 16px)' }}
                                    size="small"
                                />
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
                        <EmployeeManagementTable
                            employees={displayData}
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

export default EmployeeManagement;