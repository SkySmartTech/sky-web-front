import { Box, CircularProgress, Typography } from '@mui/material';

const PageLoader = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <CircularProgress size={60} thickness={4} />
      <Typography variant="h6" mt={3}>
        Loading...
      </Typography>
    </Box>
  );
};

export default PageLoader;