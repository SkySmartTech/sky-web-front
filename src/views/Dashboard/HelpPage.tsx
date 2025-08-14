import { useState } from "react";
import {
  Box,
  Button,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  AppBar,
  Paper,
  CssBaseline,
  useTheme,
  Stack,
} from "@mui/material";
import {
  Search,
  AccountCircle,
  RocketLaunch,
  Update,
  Settings,
  HelpOutline,
  Lock
} from "@mui/icons-material";
import Sidebar from "../../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useCustomTheme } from "../../context/ThemeContext";
import Navbar from "../../components/Navbar";

const HelpPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hovered] = useState(false);
  const theme = useTheme();
  useCustomTheme();


  // Help topics with navigation routes
  const helpTopics = [
    { icon: <RocketLaunch />, text: "Getting Started", route: "/getting-started" },
    { icon: <AccountCircle />, text: "My Account", route: "/UserProfile" },
    { icon: <Update />, text: "System Updates", route: "/system-updates" },
    { icon: <Settings />, text: "Settings & Preferences", route: "/settings" },
    { icon: <HelpOutline />, text: "FAQs & Troubleshooting", route: "/faqs" },
    { icon: <Lock />, text: "Security & Privacy", route: "/security" },
  ];

  // Simulated system-wide search results (sidebar + help topics)
  const allItems = [...helpTopics.map(topic => topic.text), "Dashboard", "Orders", "Reports", "Users", "Settings"];
  const filteredItems = searchTerm ? allItems.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase())) : [];

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
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
            title="Help"
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppBar>

        {/* Search Box */}
        <Box sx={{
          textAlign: "center",
          height: "200px",
          bgcolor: theme.palette.background.paper,
          p: 4,
          borderRadius: 5,
          mb: 3,
          mt: 4
        }}>
          <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
            How can we help you?
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <Button variant="outlined" onClick={() => console.log("Search clicked")}>
                  Search
                </Button>
              ),
              sx: { borderRadius: 50 }
            }}
            sx={{ maxWidth: 500, bgcolor: theme.palette.background.paper }}
          />
        </Box>

        {/* Search Results */}
        {searchTerm && filteredItems.length > 0 && (
          <Box sx={{
            bgcolor: theme.palette.background.paper,
            p: 2,
            borderRadius: 2,
            mb: 2
          }}>
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              Search Results:
            </Typography>
            <List>
              {filteredItems.map((item, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => console.log("Navigate to", item)}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover
                    }
                  }}
                >
                  <ListItemText
                    primary={item}
                    primaryTypographyProps={{ color: 'text.primary' }}
                  />
                </ListItemButton>
              ))}
            </List>
          </Box>
        )}

        {/* Help Topics - Now horizontal */}
        <Box sx={{
          bgcolor: theme.palette.background.paper,
          p: 3,
          borderRadius: 2
        }}>
          <Typography variant="h6" fontWeight="bold" mb={2} color="text.primary">
            Help Topics
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            useFlexGap
          >
            {helpTopics.map((topic, index) => (
              <Box
                key={index}
                sx={{
                  width: { xs: '100%', sm: '48%', md: '31%' }, // Mimic Grid: 12, 6, 4
                  mb: 2,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: "pointer",
                    bgcolor: theme.palette.background.default,
                    "&:hover": {
                      bgcolor: theme.palette.action.hover
                    }
                  }}
                  onClick={() => navigate(topic.route)}
                >
                  <Box display="flex" alignItems="center">
                    <ListItemIcon sx={{ minWidth: 36, color: theme.palette.text.primary }}>
                      {topic.icon}
                    </ListItemIcon>
                    <Typography variant="body1" color="text.primary">
                      {topic.text}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default HelpPage;