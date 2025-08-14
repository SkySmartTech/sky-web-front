import { useState } from "react";
import { Box, CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";

const drawerWidth = 240;
const collapsedWidth = 56;

const MainLayout = () => {
  const [open, setOpen] = useState(false);
  const [hovered] = useState(false);

  return (
    <Box sx={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <CssBaseline />
      <Sidebar
        open={open || hovered}
        setOpen={setOpen}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100vw - ${open || hovered ? drawerWidth : collapsedWidth}px)`,
          height: "100vh",
          overflow: "auto",
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: `${open || hovered ? drawerWidth : collapsedWidth}px`,
          p: 3,
          backgroundColor: "#f5f5f5"
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;