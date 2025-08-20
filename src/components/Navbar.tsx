import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  Button,
  Divider,
  InputBase,
  Avatar
} from "@mui/material";
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Fullscreen as FullscreenIcon,
  Search as SearchIcon,
  ArrowDropDown as ArrowDropDownIcon
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCustomTheme } from "../context/ThemeContext";
import AnimatedSwitch from "../components/AnimatedSwitch";

interface NavbarProps {
  title: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Navbar = ({ title, sidebarOpen, setSidebarOpen }: NavbarProps) => {
  const { mode, toggleTheme } = useCustomTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationCount] = useState(3);
  const navigate = useNavigate();

  // Account menu handlers
  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate("/userProfile");
    handleAccountMenuClose();
  };

  const handleLogout = () => {
    navigate("/login");
    handleAccountMenuClose();
  };

  // Notifications menu handlers
  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleViewAllNotifications = () => {
    navigate("/notifications");
    handleNotificationMenuClose();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <Toolbar sx={{ justifyContent: "space-between" }}>
      {/* Left: Sidebar toggle + title */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton
          edge="start"
          color="inherit"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap fontWeight={600}>
          {title}
        </Typography>
      </Box>

      {/* Center: Search bar */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          mx: 2
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.08)",
            px: 1.5,
            py: 0.5,
            borderRadius: "20px",
            width: "100%",
            maxWidth: 250
          }}
        >
          <InputBase
            placeholder="Search..."
            sx={{ flex: 1, fontSize: 14 }}
            inputProps={{ "aria-label": "search" }}
          />
          <SearchIcon sx={{ fontSize: 18, color: "gray" }} />
        </Box>
      </Box>

      {/* Right: Icons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Dark/Light mode toggle */}
        <AnimatedSwitch
          checked={mode === "dark"}
          onChange={toggleTheme}
          inputProps={{ "aria-label": "dark mode toggle" }}
        />

        {/* Country flag */}
        <IconButton>
          <img
            src="https://flagcdn.com/w20/lk.png" // Example: Sri Lanka flag (20px)
            alt="Country flag"
            style={{ width: 24, height: 16, borderRadius: 2 }}
          />
        </IconButton>

        {/* Notifications */}
        <IconButton onClick={handleNotificationMenuOpen}>
          <Badge badgeContent={notificationCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={notificationAnchorEl}
          open={Boolean(notificationAnchorEl)}
          onClose={handleNotificationMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right"
          }}
          sx={{
            "& .MuiPaper-root": {
              width: 300,
              maxHeight: 400
            }
          }}
        >
          <MenuItem disabled>
            <Typography variant="body2">
              You have {notificationCount} new notifications
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem>
            <Typography variant="body2">Notification 1</Typography>
          </MenuItem>
          <MenuItem>
            <Typography variant="body2">Notification 2</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleViewAllNotifications}>
            <Button fullWidth variant="contained" size="small">
              View All Notifications
            </Button>
          </MenuItem>
        </Menu>

        {/* Fullscreen */}
        <IconButton onClick={toggleFullscreen}>
          <FullscreenIcon />
        </IconButton>

        {/* Account dropdown (avatar + name + arrow) */}
        <Box
          onClick={handleAccountMenuOpen}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 0.5,
            borderRadius: 20,
            cursor: "pointer",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" }
          }}
        >
          <Avatar sx={{ width: 28, height: 28, mr: 1 }}>A</Avatar>
          <Typography variant="body2" fontWeight={600}>
            Admin
          </Typography>
          <ArrowDropDownIcon fontSize="small" />
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleAccountMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleProfileClick}>User Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </Toolbar>
  );
};

export default Navbar;