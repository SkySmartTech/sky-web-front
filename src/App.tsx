import { CssBaseline, styled } from "@mui/material";
import { SnackbarContent, SnackbarProvider } from "notistack";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./state/queryClient";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./Routes";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <ThemeProvider>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={2500}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            Components={{
              success: styled(SnackbarContent)(({ theme }) => ({
                backgroundColor: theme.palette.success.main,
                fontSize: '2rem', // Base size for regular messages
                '&.large-message': {
                  fontSize: '2.5rem',
                  padding: '50px',
                  fontWeight: 'bold'
                }
              })),
              error: styled(SnackbarContent)(({ theme }) => ({
                backgroundColor: theme.palette.error.main,
              })),
            }}
          >
            <CssBaseline />
            <AppRoutes />
          </SnackbarProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
}

export default App;