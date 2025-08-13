import { useState, useEffect } from "react";
import {
  Box, Button, Checkbox, CircularProgress, FormControlLabel,
  MenuItem, Select, Typography, SelectChangeEvent,
  AppBar, Snackbar, Alert, Paper, CssBaseline, TextField, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import Sidebar from "../../../components/Sidebar";
import { useCustomTheme } from "../../../context/ThemeContext";
import Navbar from "../../../components/Navbar";
import { useTheme } from "@mui/material/styles";
import {
  fetchUserRoles,
  createUserRole,
  updateUserRole,
  deleteUserRole,
  UserRole,
  PermissionKey
} from "../../../api/userAccessmanagementApi";

const defaultPermissions: Record<PermissionKey, boolean> = {
  // Admin Panel
  homeDashboard: false,
  
  // P2P Section
  p2pSection: false,
  productionDashboard: false,
  productionUpdate: false,
  dayPlanUpload: false,
  dayPlanReports: false,
  dayPlanSummary: false,
  
  // User Management
  userManagement: false,
  userAccount: false,
  userManagementSub: false,
  userAccessManagement: false,
  
  // System Management
  systemManagement: false,
  
  // User Profile
  userProfile: false,
  
  // Other Settings
  autoRefresh: false,
};

const UserAccessManagementSystem = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [roleDescription, setRoleDescription] = useState<string>("");
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>(defaultPermissions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  useCustomTheme();

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error"
  });

  type NewRoleForm = {
    userType: string;
    description: string;
  };

  const [newRoleDialog, setNewRoleDialog] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState<NewRoleForm>({
    userType: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const arrayToPermissionsObject = (arr: string[] | undefined): Record<PermissionKey, boolean> => {
    const obj = { ...defaultPermissions };
    if (Array.isArray(arr)) {
      arr.forEach(key => {
        if (key in obj) obj[key as PermissionKey] = true;
      });
    }
    return obj;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedRoles = await fetchUserRoles();
      setRoles(fetchedRoles || []);
      if (fetchedRoles && fetchedRoles.length > 0) {
        const firstRole = fetchedRoles[0];
        setSelectedRole(String(firstRole.userType));
        setSelectedRoleId(firstRole.id);
        setRoleDescription(firstRole.description);
        setPermissions(arrayToPermissionsObject(firstRole.permissionObject));
      }
    } catch (err) {
      setError('An error occurred while loading data');
      showSnackbar('An error occurred while loading data', "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = roles.find(r => r.userType === selectedRole);
    if (role) {
      setSelectedRoleId(role.id);
      setRoleDescription(role.description);
      setPermissions(arrayToPermissionsObject(role.permissionObject));
    }
  }, [selectedRole, roles]);

  const handlePermissionChange = (key: PermissionKey) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPermissions(prev => ({ ...prev, [key]: e.target.checked }));
  };

  const handleParentPermissionChange = (parentKey: PermissionKey, childKeys: PermissionKey[]) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setPermissions(prev => {
      const newPermissions = { ...prev, [parentKey]: isChecked };
      childKeys.forEach(childKey => {
        newPermissions[childKey] = isChecked;
      });
      return newPermissions;
    });
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleRoleChange = (e: SelectChangeEvent<string>) => {
    setSelectedRole(e.target.value);
  };

  const getSelectedPermissions = () =>
    Object.entries(permissions)
      .filter(([_, value]) => value)
      .map(([key]) => key as PermissionKey);

  const handleUpdate = async () => {
    if (!selectedRoleId || !selectedRole) return;
    setLoading(true);
    try {
      await updateUserRole(selectedRoleId, {
        userType: selectedRole, 
        description: roleDescription,
        permissionObject: getSelectedPermissions(),
      });
      await loadData();
      showSnackbar("Role updated successfully!", "success");
    } catch {
      showSnackbar("Failed to update role", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setNewRoleForm({ userType: '', description: '' });
    setNewRoleDialog(true);
  };

  const handleCreateRole = async () => {
    if (!newRoleForm.userType || !newRoleForm.description) {
      showSnackbar("Please fill all fields", "error");
      return;
    }
    setLoading(true);
    try {
      const newRole = await createUserRole({
        userType: newRoleForm.userType,
        description: newRoleForm.description,
        permissionObject: getSelectedPermissions(),
      });
      await loadData();
      setSelectedRole(String(newRole.userType));
      showSnackbar("New role created successfully!", "success");
      setNewRoleDialog(false);
    } catch {
      showSnackbar("Failed to create role", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoleId || !window.confirm("Are you sure you want to delete this role?")) return;
    setLoading(true);
    try {
      await deleteUserRole(selectedRoleId);
      await loadData();
      showSnackbar("Role deleted successfully!", "success");
    } catch {
      showSnackbar("Failed to delete role", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderCheckbox = (key: PermissionKey, label: string, bold: boolean = false, indented: boolean = false) => (
    <FormControlLabel
      key={key}
      control={
        <Checkbox 
          checked={permissions ? permissions[key] || false : false}
          onChange={handlePermissionChange(key)}
          disabled={loading}
        />
      }
      label={
        <Typography variant="body1" sx={{ fontWeight: bold ? 'bold' : 'normal' }}>
          {label}
        </Typography>
      }
      sx={{ 
        ml: indented ? 4 : 2,
        '& .MuiFormControlLabel-label': {
          fontSize: '0.875rem',
          color: theme.palette.text.secondary
        }
      }}
    />
  );

  const renderParentCheckbox = (
    parentKey: PermissionKey, 
    parentLabel: string, 
    childKeys: PermissionKey[], 
    childLabels: string[]
  ) => (
    <Box key={parentKey} sx={{ mb: 1 }}>
      <FormControlLabel
        control={
          <Checkbox 
            checked={permissions ? permissions[parentKey] || false : false}
            onChange={handleParentPermissionChange(parentKey, childKeys)}
            disabled={loading}
          />
        }
        label={<Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{parentLabel}</Typography>}
        sx={{ ml: 2 }}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
        {childKeys.map((childKey, index) => 
          renderCheckbox(childKey, childLabels[index], false, true)
        )}
      </Box>
    </Box>
  );

  const renderPermissionSection = (title: string, content: React.ReactNode) => (
    <Grid item xs={12} md={6}>
      <Typography variant="h6" sx={{ 
        fontWeight: "bold", 
        mb: 2, 
        color: theme.palette.primary.main,
        pl: 2
      }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {content}
      </Box>
    </Grid>
  );

  return (
    <Box sx={{ display: "flex", width: "100vw", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <AppBar position="static" sx={{
          bgcolor: theme.palette.background.paper,
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary
        }}>
          <Navbar title="User Access Management" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </AppBar>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                <Typography>User Role:</Typography>
                <Select 
                  value={selectedRole} 
                  onChange={handleRoleChange} 
                  sx={{ minWidth: 200 }}
                  disabled={loading || roles.length === 0}
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.userType}>{role.userType}</MenuItem>
                  ))}
                </Select>

                <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
                  <Button 
                    variant="contained" 
                    onClick={handleUpdate} 
                    disabled={loading || !selectedRoleId}
                  >
                    {loading ? <CircularProgress size={20} /> : "Update"}
                  </Button>
                  <Button variant="contained" color="secondary" onClick={handleNew} disabled={loading}>
                    New
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={handleDelete} 
                    disabled={loading || !selectedRoleId}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Role Description"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                sx={{ mt: 3 }}
                disabled={loading}
              />
            </Paper>

            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h5" sx={{ mb: 3 }}>Role Permissions</Typography>
              <Grid container spacing={3}>
                {renderPermissionSection("Admin Panel", (
                  <>
                    {renderCheckbox("homeDashboard", "Home Dashboard", true)}
                    
                    {renderParentCheckbox(
                      "p2pSection",
                      "P2P Section",
                      ["productionDashboard", "productionUpdate", "dayPlanUpload", "dayPlanReports", "dayPlanSummary"],
                      ["Production Dashboard", "Production Update", "Day plan upload", "Day plan Reports", "Day plan Summary"]
                    )}
                    
                    {renderParentCheckbox(
                      "userManagement",
                      "User Management",
                      ["userAccount", "userManagementSub", "userAccessManagement"],
                      ["User account", "User Management", "User Access Management"]
                    )}
                    
                    {renderCheckbox("systemManagement", "System Management", true)}
                    {renderCheckbox("userProfile", "User profile", true)}
                  </>
                ))}

                {renderPermissionSection("Other Settings", (
                  <>
                    {renderCheckbox("autoRefresh", "Auto Refresh Dashboard", true)}
                  </>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>

        <Dialog 
          open={newRoleDialog} 
          onClose={() => setNewRoleDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Create New Role</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Role Name"
                value={newRoleForm.userType}
                onChange={(e) => setNewRoleForm(prev => ({ ...prev, userType: e.target.value }))}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Description"
                value={newRoleForm.description}
                onChange={(e) => setNewRoleForm(prev => ({ ...prev, description: e.target.value }))}
                disabled={loading}
                multiline
                minRows={2}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setNewRoleDialog(false)} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRole} 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Create"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UserAccessManagementSystem;