import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { Lock } from '@mui/icons-material';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Card sx={{ maxWidth: 450, textAlign: 'center', p: 3 }}>
          <CardContent>
            <Lock color="error" sx={{ fontSize: 56, mb: 1 }} />
            <Typography variant="h5" gutterBottom color="error">
              Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              You do not have administrative privileges to view this section.
            </Typography>
            <Button variant="contained" onClick={() => window.location.href = '/'}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return children;
}
