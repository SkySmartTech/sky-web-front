import { Box, Card, Stack } from "@mui/material";
import RegisterForm from "./RegisterForm";
import { useSnackbar } from "notistack";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Stack
      sx={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: 'url("/images/l1.png")',
        backgroundSize: "768px 1000px",
        backgroundPosition: "left",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        position: "relative", 
        zIndex: 0, 
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 1000, boxShadow: 4, borderRadius: "30px", display: "flex" ,
        backgroundColor: "transparent",height: "90vh"
      }}>
        {/* Left Side with Image */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: "transparent", // Ensure left side is transparent
            borderTopLeftRadius: "25px",
            borderBottomLeftRadius: "25px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "20px solid #ffffff",
          }}
        >
          {/* Logo Box */}
          <Box
            sx={{
              position: "absolute",
              top: 20,
              left: 20,
              backgroundColor: "#ffffff",
              color: "#000000",
              padding: "8px 16px",
              borderRadius: "10px",
              fontWeight: "bold",
            }}
          >
            BUILDTEK
          </Box>
        </Box>

        {/* Right Side - Registration Form */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 4,
          }}
        >
          <RegisterForm 
            onSuccess={() => {
              enqueueSnackbar("Registration successful!", { variant: "success" });
            }}
            onError={(error) => {
              enqueueSnackbar(error || "Registration failed", { variant: "error" });
            }}
          />
        </Box>
      </Card>
    </Stack>
  );
};

export default Register;