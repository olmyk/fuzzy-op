import { Box } from '@mui/material';
import { Outlet } from 'react-router';
import { SiteHeader } from './components/SiteHeader';

export function AppLayout() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
