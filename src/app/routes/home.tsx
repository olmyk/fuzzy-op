import { Box, Typography } from '@mui/material';

const HomeRoute = () => {
  return (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
        Welcome
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Select a topic from the navigation to get started.
      </Typography>
    </Box>
  );
};

export default HomeRoute;
