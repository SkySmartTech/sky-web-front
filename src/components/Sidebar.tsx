import { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Divider,
  styled,
  Toolbar,
  Box,
  Avatar,
} from "@mui/material";
import {
  Home,
  Layers,
  Settings,
  ExitToApp,
  Help,
  ExpandLess,
  ExpandMore,
  SubdirectoryArrowRight,
  SupervisedUserCircle,
  SupervisedUserCircleTwoTone,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useThemeMode } from "../context/ThemeContext";
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const drawerWidth = 250;
const collapsedWidth = 56;

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    enqueueSnackbar("You have been logged out", { variant: "info" });
    navigate("/login", { replace: true });
  };

  const StyledListItemIcon = styled(ListItemIcon)({
    minWidth: 0,
    justifyContent: "center",
    color: mode === 'dark' ? "#ffffff" : "#000000",
    marginRight: "auto",
  });

  const sidebarItems = [
    { type: "headline", text: "Main" },
    {
      type: "item",
      title: "Dashboard",
      icon: <Home fontSize="small" />,
      href: "/home",
    },
    { type: "headline", text: "Administration" },
    {
      type: "nested",
      title: "P2P Section",
      icon: <Layers fontSize="small" />,
      children: [
        { title: "Production Dashboard", icon: <SubdirectoryArrowRight fontSize="small" />, href: "/home" },
        { title: "Production Update", icon: <SubdirectoryArrowRight fontSize="small" />, href: "/production" },
        { title: "Day Plan Upload", icon: <SubdirectoryArrowRight fontSize="small" />, href: "/dayPlan" },
        { title: "Reports", icon: <SubdirectoryArrowRight fontSize="small" />, href: "/dayReport" },
        { title: "Summary", icon: <SubdirectoryArrowRight fontSize="small" />, href: "/daySummary" },
      ],
    },
    { type: "divider" },
    { type: "headline", text: "Configuration" },
    {
      type: "nested",
      title: "User Management",
      icon: <SupervisedUserCircleTwoTone fontSize="small" />,
      children: [
        { title: "User Account", icon: <SubdirectoryArrowRight fontSize="small" />, href: "/userProfile" },
        { title: "User Management", icon: <SubdirectoryArrowRight fontSize="small" />, href: "/userManagement" },
        { title: "User Access Management", icon: <SubdirectoryArrowRight fontSize="small" />, href: "/userAccessManagement" },
      ],
    },
    {
      type: "item",
      title: "System Management",
      icon: <Settings fontSize="small" />,
      href: "/systemManagement",
    },
    { type: "divider" },
    { type: "headline", text: "Components" },
    {
      type: "item",
      title: "User Profile",
      icon: <SupervisedUserCircle fontSize="small" />,
      href: "/userProfile",
    },
    {
      type: "item",
      title: "Help",
      icon: <Help fontSize="small" />,
      href: "/help",
    },
    {
      type: "item",
      title: "Settings",
      icon: <Settings fontSize="small" />,
      href: "/setting",
    },
    {
      type: "item",
      title: "Logout",
      icon: <ExitToApp fontSize="small" />,
      action: handleLogout,
    },
  ];

  const handleItemClick = (item: any) => {
    if (item.href) {
      navigate(item.href);
    } else if (item.action) {
      item.action();
    }
    setOpen(false);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? drawerWidth : collapsedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : collapsedWidth,
          boxSizing: 'border-box',
          backgroundColor: mode === 'dark' ? "#1e1e1e" : "#ffffff",
          color: mode === 'dark' ? "#ffffff" : "#000000",
          transition: (theme) => theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflowX: 'hidden',
          borderRight: 'none',
        },
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Toolbar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: open ? 2 : 1,
          borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.12)',
          mb: 1,
          height: 'auto',
          minHeight: open ? 100 : 64
        }}
      >
        <Avatar
          src="/images/logo.png"
          alt="Company Logo"
          sx={{
            width: open ? 80 : 40,
            height: open ? 80 : 40,
            transition: 'all 0.3s ease',
          }}
        />
      </Box>

      <List sx={{ p: 0 }}>
        {sidebarItems.map((item, index) => {
          if (item.type === "headline") {
            return (
              <ListItemText
                key={index}
                primary={item.text}
                sx={{
                  px: 2.5,
                  py: 1,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: mode === 'dark' ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
                  display: open ? "block" : "none",
                }}
              />
            );
          }

          if (item.type === "divider") {
            return (
              <Divider
                key={index}
                sx={{
                  my: 1,
                  backgroundColor: mode === 'dark' ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.12)",
                  display: open ? "block" : "none",
                }}
              />
            );
          }

          if (item.type === "nested") {
            return (
              <div key={index}>
                <ListItemButton
                  onClick={() => toggleSection(item.title!)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    "&:hover": {
                      backgroundColor: mode === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)"
                    }
                  }}
                >
                  <StyledListItemIcon>{item.icon}</StyledListItemIcon>
                  {open && (
                    <>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: "0.875rem",
                          color: mode === 'dark' ? "#ffffff" : "#000000"
                        }}
                      />
                      {openSections[item.title!] ? (
                        <ExpandLess fontSize="small" />
                      ) : (
                        <ExpandMore fontSize="small" />
                      )}
                    </>
                  )}
                </ListItemButton>
                
                <Collapse in={openSections[item.title!] && open} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 2 }}>
                    {item.children?.map((child, childIndex) => (
                      <ListItemButton
                        key={childIndex}
                        onClick={() => handleItemClick(child)}
                        sx={{
                          pl: 4,
                          minHeight: 48,
                          "&:hover": {
                            backgroundColor: mode === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)"
                          }
                        }}
                      >
                        <StyledListItemIcon>{child.icon}</StyledListItemIcon>
                        {open && (
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{
                              fontSize: "0.875rem",
                              color: mode === 'dark' ? "#ffffff" : "#000000"
                            }}
                          />
                        )}
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </div>
            );
          }

          return (
            <ListItemButton
              key={index}
              onClick={() => handleItemClick(item)}
              sx={{
                minHeight: 48,
                px: 2.5,
                "&:hover": {
                  backgroundColor: mode === 'dark' ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)"
                }
              }}
            >
              <StyledListItemIcon>{item.icon}</StyledListItemIcon>
              {open && (
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: "0.875rem",
                    color: mode === 'dark' ? "#ffffff" : "#000000"
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;