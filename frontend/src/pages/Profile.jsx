import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Avatar, Grid, Chip, Button, Divider,
  CircularProgress, Alert, LinearProgress
} from '@mui/material';
import {
  Email, Business, Badge, CalendarToday, Edit, AccountCircle, Work
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import EmployeeModal from '../components/EmployeeModal';

export default function Profile() {
  const { user, isAdmin } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.employeeId) {
      setLoading(false);
      setError('No employee profile linked to this account.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/employees/${user.employeeId}`);
      setEmployee(res.data);
    } catch {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    const res = await api.put(`/employees/${employee.id}`, formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    setEmployee(res.data);
    setEditOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
  }

  const infoItems = [
    { icon: <Email sx={{ fontSize: 18 }} />, label: 'Email', value: employee?.email },
    { icon: <Business sx={{ fontSize: 18 }} />, label: 'Department', value: employee?.department || 'Not set' },
    { icon: <Work sx={{ fontSize: 18 }} />, label: 'Designation', value: employee?.designation || 'Not set' },
    { icon: <CalendarToday sx={{ fontSize: 18 }} />, label: 'Joined Date', value: employee?.joinedDate || 'Not set' },
  ];

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your personal information.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                src={employee?.profileImageUrl}
                sx={{
                  width: 100, height: 100, mx: 'auto', mb: 2,
                  fontSize: '2.5rem', fontWeight: 800,
                  bgcolor: isAdmin ? '#4f46e5' : '#0284c7',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}
              >
                {employee?.firstName ? employee.firstName.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Typography variant="h5" fontWeight={700}>
                {employee?.firstName} {employee?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                @{user?.username}
              </Typography>

              <Box display="flex" justifyContent="center" gap={1} mb={3}>
                <Chip
                  label={employee?.status || 'Active'}
                  color={employee?.status === 'Active' ? 'success' : employee?.status === 'On Leave' ? 'warning' : 'default'}
                  size="small"
                />
                <Chip
                  label={isAdmin ? 'Administrator' : 'Employee'}
                  color={isAdmin ? 'primary' : 'default'}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => setEditOpen(true)}
                fullWidth
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Info Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Personal Information
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                {infoItems.map((item) => (
                  <Grid item xs={12} sm={6} key={item.label}>
                    <Box display="flex" alignItems="flex-start" gap={1.5}>
                      <Box sx={{
                        mt: 0.3,
                        color: 'text.secondary'
                      }}>
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                          {item.label}
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Task Stats (if available) */}
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Account Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <AccountCircle sx={{ fontSize: 18, mt: 0.3, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                        Username
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {user?.username}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <Badge sx={{ fontSize: 18, mt: 0.3, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                        Employee ID
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        #{employee?.id}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Modal */}
      <EmployeeModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        employee={employee}
        onSave={handleSave}
      />
    </Box>
  );
}
