import { useState } from "react";
import { Box, Stack, Card } from "@mui/material";
import LoginForm from "./LoginForm";
import ForgotPasswordDialog from "./ForgotPasswordDialog"; 

const Login = () => {
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false); 

  return (
    <Stack
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: 'url("/images/l1.png")',
        backgroundSize: "768px 1000px",
        backgroundPosition: "left",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 1000, boxShadow: 4, borderRadius: "30px", display: "flex" }}>
        {/* Left Side with Image */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: 'url("/images/l1.png")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderTopLeftRadius: "25px",
            borderBottomLeftRadius: "25px",
            margin: "12px",
            position: "relative",
          }}
        >
          {/* Logo Box */}
          <Box
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: "bold",
            }}
          >
            BUILDTECK
          </Box>
        </Box>

        {/* Right Side Login Form */}
        <Stack
          sx={{
            flex: 1, 
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 4,
          }}
        >
          {/* Use the LoginForm component here */}
          <LoginForm
            onForgotPasswordClick={() => setOpenForgotPasswordDialog(true)} 
          />
        </Stack>
      </Card>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={openForgotPasswordDialog}
        handleClose={() => setOpenForgotPasswordDialog(false)}
      />
    </Stack>
  );
};

export default Login;