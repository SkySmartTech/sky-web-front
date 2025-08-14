import { useState } from "react";
import { Box, Stack, Card } from "@mui/material";
import LoginForm from "./LoginForm";
import ForgotPasswordDialog from "./ForgotPasswordDialog"; 
import { useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";

const Login = () => {
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false); 

    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();

  return (
    <Stack
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            backgroundImage: 'url("/images/b.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderTopLeftRadius: "25px",
            borderBottomLeftRadius: "25px",
            position: "relative",
          }}
        >
          {/* Logo Box */}
          <Box
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              backgroundColor: "primary.contrastText",
              color: theme.palette.text.primary,
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