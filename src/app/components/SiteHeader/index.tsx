import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { NavLink } from 'react-router';
import { paths } from '@/config/paths';

interface NavButtonProps {
  to: string;
  label: string;
  end?: boolean;
}

function NavButton({ to, label, end = false }: NavButtonProps) {
  return (
    <NavLink to={to} end={end} style={{ textDecoration: 'none' }}>
      {({ isActive }: { isActive: boolean }) => (
        <Button
          sx={{
            color: 'white',
            fontWeight: isActive ? 700 : 400,
            bgcolor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
          }}
        >
          {label}
        </Button>
      )}
    </NavLink>
  );
}

export function SiteHeader() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 3, fontWeight: 700, letterSpacing: 0.5 }}>
          Fuzzy Operations
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <NavButton to={paths.home.path} label="Home" end />
          <NavButton to={paths.fuzzyNumbers.path} label="Fuzzy Numbers" />
          <NavButton to={paths.fuzzySets.path} label="Fuzzy Sets" />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
