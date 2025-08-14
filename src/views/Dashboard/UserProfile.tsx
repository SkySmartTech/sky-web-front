import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Typography,
  Button,
  Avatar,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  CssBaseline,
  CircularProgress,
  Snackbar,
  Alert,
  useTheme
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCustomTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar";
import { fetchUserProfile, updateUserProfile, uploadUserPhoto } from "../../api/userProfileApi";

// Department options
const departments = ["IT", "HR", "Finance", "Marketing", "Operations"];

interface User {
  id: number;
  employeeName: string;
  username: string;
  password: string;
  email: string;
  epf: string;
  department: string;
  contact: string;
  photo: string;
}

const defaultUser: User = {
  id: 0,
  employeeName: "",
  username: "",
  password: "********",
  email: "",
  epf: "",
  department: "",
  contact: "",
  photo: "",
};

const UserProfile: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPhoto, setOpenPhoto] = useState(false);
  const [editUser, setEditUser] = useState<User>(defaultUser);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({
    employeeName: '',
    username: '',
    email: '',
    contact: '',
    department: ''
  });
  const theme = useTheme();
  useCustomTheme();

  const queryClient = useQueryClient();

  // Fetch user data using React Query
  const { data: user, isLoading: isDataLoading } = useQuery<User>({
    queryKey: ['user-profile'],
    queryFn: fetchUserProfile,
  });

  useEffect(() => {
    if (user) {
      setEditUser(user);
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation<void, Error, { id: number, user: Partial<User> }>({
    mutationFn: ({ id, user }) => updateUserProfile(id, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setOpenEdit(false);
      showSnackbar("Profile updated successfully!", "success");
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || "Failed to update profile", "error");
    }
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation<void, Error, FormData>({
    mutationFn: uploadUserPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setOpenPhoto(false);
      showSnackbar("Photo uploaded successfully!", "success");
    },
    onError: (error: any) => {
      showSnackbar(error.response?.data?.message || "Failed to upload photo", "error");
    }
  });

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  // Validate individual field
  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'employeeName':
        if (!value.trim()) error = 'Employee name is required';
        else if (value.length > 100) error = 'Name too long (max 100 chars)';
        break;
      case 'username':
        if (!value.trim()) error = 'Username is required';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Only letters, numbers and underscore allowed';
        else if (value.length < 3) error = 'Username too short (min 3 chars)';
        else if (value.length > 30) error = 'Username too long (max 30 chars)';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Invalid email format';
        else if (value.length > 255) error = 'Email too long';
        break;
      case 'contact':
        if (!value.trim()) error = 'Contact number is required';
        else if (!/^\+?[0-9]{10,15}$/.test(value)) error = 'Invalid phone number (10-15 digits)';
        break;
      case 'department':
        if (!value.trim()) error = 'Department is required';
        break;
    }

    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  // Handle edit form change with validation
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditUser({ ...editUser, [name]: value });
    validateField(name, value);
  };

  // Validate all fields before submission
  const validateAllFields = () => {
    let isValid = true;
    const fieldsToValidate = ['employeeName', 'username', 'email', 'contact', 'department'];
    
    fieldsToValidate.forEach(field => {
      if (!validateField(field, editUser[field as keyof User] as string)) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("photo", file);
      uploadPhotoMutation.mutate(formData);
    }
  };

  // Save updated user info with validation
  const handleSaveEdit = async () => {
    if (!validateAllFields()) {
      showSnackbar("Please fix all validation errors", "error");
      return;
    }

    try {
      const { photo, id, ...userData } = editUser;
      await updateProfileMutation.mutateAsync({ id: editUser.id, user: userData });
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const isMutating = updateProfileMutation.isPending || uploadPhotoMutation.isPending;

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
            bgcolor: theme.palette.background.paper,
            boxShadow: 'none',
            borderBottom: `1px solid ${theme.palette.divider}`,
            color: theme.palette.text.primary
          }}
        >
          <Navbar
            title="User Profile"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        {/* Profile Card - Always visible */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Box sx={{
            bgcolor: theme.palette.background.paper,
            p: 4,
            borderRadius: 3,
            boxShadow: 3,
            maxWidth: 900,
            mx: "auto",
            mt: 10,
          }}>
            {/* Profile Photo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Avatar
                src={user?.photo || "/default-avatar.png"}
                sx={{ width: 100, height: 100 }}
              />
              <Button
                variant="outlined"
                onClick={() => setOpenPhoto(true)}
                disabled={isMutating}
              >
                Change photo
              </Button>
            </Box>

            {/* User Info - Always shows labels even if values are empty */}
            <Typography variant="h6" sx={{ mb: 2 }}>User Info</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Typography><b>Name:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.employeeName || "-"}</Typography>
              <Typography><b>Username:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.username || "-"}</Typography>
              <Typography><b>Password:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.password.replace(/./g, "*")}</Typography>
              <Typography><b>Email:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.email || "-"}</Typography>
              <Typography><b>ID:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.epf || "-"}</Typography>
              <Typography><b>Department:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.department || "-"}</Typography>
              <Typography><b>Contact:</b> {isDataLoading ? <CircularProgress size={16} /> : user?.contact || "-"}</Typography>
            </Box>

            {/* Edit Button */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ bgcolor: "primary.main" }}
                onClick={() => setOpenEdit(true)}
                disabled={isMutating}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Edit User Dialog */}
        <Dialog
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          sx={{ '& .MuiDialog-paper': { width: '90%', maxWidth: 600 } }}
        >
          <DialogTitle>Edit User Info</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              name="employeeName"
              value={editUser.employeeName}
              onChange={handleEditChange}
              error={!!validationErrors.employeeName}
              helperText={validationErrors.employeeName}
              sx={{ mt: 3, mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={editUser.username}
              onChange={handleEditChange}
              error={!!validationErrors.username}
              helperText={validationErrors.username}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={editUser.email}
              onChange={handleEditChange}
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Contact"
              name="contact"
              value={editUser.contact}
              onChange={handleEditChange}
              error={!!validationErrors.contact}
              helperText={validationErrors.contact}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              select
              fullWidth
              label="Department"
              name="department"
              value={editUser.department}
              onChange={handleEditChange}
              error={!!validationErrors.department}
              helperText={validationErrors.department}
              sx={{ mb: 2 }}
              required
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              variant="contained"
              disabled={isMutating}
              startIcon={isMutating ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isMutating ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Photo Upload Dialog */}
        <Dialog open={openPhoto} onClose={() => setOpenPhoto(false)}>
          <DialogTitle>Upload New Photo</DialogTitle>
          <DialogContent>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={isMutating}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPhoto(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>

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

export default UserProfile;