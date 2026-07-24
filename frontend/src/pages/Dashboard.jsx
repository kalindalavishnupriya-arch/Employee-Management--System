import { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, LinearProgress, Chip, Button, CircularProgress, Alert, Avatar, Divider, Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import {
  People, AccountTree, Assignment, CheckCircle, PendingActions, Warning, ArrowForward, Add
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    let loadedAnything = false;

    try {
      const summaryRes = await api.get('/reports/summary');
      setSummary(summaryRes.data);
      loadedAnything = true;
    } catch (err) {
      console.error('Failed to load summary report:', err);
    }

    try {
      const taskParams = user?.employeeId ? `?employeeId=${user.employeeId}&size=5&sortDir=desc` : '?size=5&sortDir=desc';
      const tasksRes = await api.get(`/tasks${taskParams}`);
      setMyTasks(tasksRes.data.content || []);
      loadedAnything = true;
    } catch (err) {
      console.error('Failed to load dashboard tasks:', err);
    }

    if (!loadedAnything) {
      setError('Unable to connect to backend or load dashboard metrics. Please ensure the backend server is running.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={fetchDashboardData}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back, <strong>{user?.username}</strong> ({isAdmin ? 'System Administrator' : 'Employee Portal'})
        </Typography>
      </Box>

      {/* KPI Stat Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Employees"
            value={summary?.totalEmployees || 0}
            icon={<People fontSize="large" />}
            color="#6366f1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Active Projects"
            value={summary?.totalProjects || 0}
            icon={<AccountTree fontSize="large" />}
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Tasks"
            value={summary?.totalTasks || 0}
            icon={<Assignment fontSize="large" />}
            color="#ec4899"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Pending Tasks"
            value={summary?.pendingTasks || 0}
            icon={<PendingActions fontSize="large" />}
            color="#f59e0b"
          />
        </Grid>
      </Grid>

      {/* Main Dashboard Section */}
      <Grid container spacing={3}>
        {/* Left Column: Recent / Assigned Tasks */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  {isAdmin ? 'Recent System Tasks' : 'My Assigned Tasks'}
                </Typography>
                <Button endIcon={<ArrowForward />} onClick={() => navigate('/tasks')}>
                  View All
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {myTasks.length === 0 ? (
                <Typography color="text.secondary" align="center" py={4}>
                  No tasks found.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Task Title</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {myTasks.map((t) => (
                      <TableRow key={t.id} hover>
                        <TableCell style={{ fontWeight: 600 }}>{t.title}</TableCell>
                        <TableCell>
                          <StatusChip status={t.status} />
                        </TableCell>
                        <TableCell style={{ width: '25%' }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <LinearProgress
                              variant="determinate"
                              value={t.progress || 0}
                              sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">{t.progress || 0}%</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{t.dueDate || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Overview Widgets */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* Quick Actions Widget - Admin Only */}
            {isAdmin && (
              <Grid item xs={12}>
                <Card sx={{ bgcolor: 'background.paper', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      Admin Quick Actions
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box display="flex" flexDirection="column" gap={1.5}>
                      <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/employees')}>
                        Manage Employees
                      </Button>
                      <Button variant="outlined" startIcon={<Add />} onClick={() => navigate('/projects')}>
                        Create New Project
                      </Button>
                      <Button variant="outlined" color="secondary" startIcon={<Add />} onClick={() => navigate('/tasks')}>
                        Assign New Task
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Overdue / High Priority Tasks Alert Widget */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}>
                    <Warning color="warning" /> Key Metrics Summary
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2" color="text.secondary">Completed Tasks:</Typography>
                    <Chip label={summary?.completedTasks || 0} color="success" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2" color="text.secondary">Overdue Tasks:</Typography>
                    <Chip label={summary?.overdueTasks || 0} color="error" size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" py={1}>
                    <Typography variant="body2" color="text.secondary">System Status:</Typography>
                    <Chip label="Operational" color="info" size="small" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

function KpiCard({ title, value, icon, color }) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: 3,
              bgcolor: (theme) => theme.palette.mode === 'light' ? `${color}18` : color,
              color: (theme) => theme.palette.mode === 'light' ? color : '#ffffff',
              border: (theme) => theme.palette.mode === 'light' ? `2px solid ${color}35` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) => theme.palette.mode === 'dark' ? `0 8px 20px ${color}45` : `0 4px 12px ${color}20`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function StatusChip({ status }) {
  let color = 'default';
  if (status === 'COMPLETED') color = 'success';
  else if (status === 'IN_PROGRESS') color = 'primary';
  else if (status === 'IN_REVIEW') color = 'warning';

  return <Chip label={status || 'TODO'} color={color} size="small" />;
}
