import { useState } from "react";
import {
  Box,
  Typography,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  AppBar,
  CssBaseline,
  Paper,
  useTheme
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import { useCustomTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar";

const SettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { mode, toggleTheme } = useCustomTheme(); 
  const theme = useTheme();

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    console.log("Notifications:", !notificationsEnabled);
  };

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh" }}>
      <CssBaseline />
      <Sidebar
        open={sidebarOpen || hovered}
        setOpen={setSidebarOpen}
      />
      <Box sx={{
        flexGrow: 1,
        bgcolor: theme.palette.background.default,
        transition: theme.transitions.create('background-color')
      }}>
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
            title="Settings" 
            sidebarOpen={sidebarOpen} 
            setSidebarOpen={setSidebarOpen} 
          />
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Notifications
            </Typography>

            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Enable notifications"
                  secondary="Receive notification messages"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <Switch
                  checked={notificationsEnabled}
                  onChange={toggleNotifications}
                  color="primary"
                />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Appearance
            </Typography>

            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  {mode === 'dark' ? (
                    <DarkModeIcon color="primary" />
                  ) : (
                    <LightModeIcon color="primary" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Dark mode"
                  secondary="Change system theme"
                  primaryTypographyProps={{ fontWeight: 500 }}
                />
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleTheme}
                  color="primary"
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;