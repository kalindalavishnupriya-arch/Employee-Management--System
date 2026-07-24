import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Tabs, Tab, CircularProgress, Alert, Chip, LinearProgress,
  TablePagination, Menu, MenuItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import {
  Download, PictureAsPdf, TableChart, Assessment, KeyboardArrowDown, FileDownload
} from '@mui/icons-material';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

export default function Reports() {
  const { isAdmin } = useAuth();

  // If user is not admin, start on tab 0 of the visible tabs (Project Progress)
  const [tabIndex, setTabIndex] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Export dropdown state
  const [exportAnchor, setExportAnchor] = useState(null);
  const exportMenuOpen = Boolean(exportAnchor);

  // Pagination states for each report tab
  const [empPage, setEmpPage] = useState(0);
  const [empRowsPerPage, setEmpRowsPerPage] = useState(10);

  const [projPage, setProjPage] = useState(0);
  const [projRowsPerPage, setProjRowsPerPage] = useState(10);

  const [pendingTasks, setPendingTasks] = useState([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingRowsPerPage, setPendingRowsPerPage] = useState(10);
  const [pendingTotal, setPendingTotal] = useState(0);

  useEffect(() => {
    fetchSummaryReport();
    fetchPendingTasks();
  }, [pendingPage, pendingRowsPerPage]);

  const fetchSummaryReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/summary');
      setSummary(res.data);
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingTasks = async () => {
    try {
      const res = await api.get(`/tasks?page=${pendingPage}&size=${pendingRowsPerPage}&sortDir=desc`);
      setPendingTasks(res.data.content || []);
      setPendingTotal(res.data.totalElements || 0);
    } catch (err) {
      // ignore
    }
  };

  // Determine the report type string based on current tab & role
  const getReportType = () => {
    if (isAdmin) {
      // tabs: 0=employee, 1=project, 2=pending
      const types = ['employee', 'project', 'pending'];
      return types[tabIndex] || 'project';
    } else {
      // tabs: 0=project, 1=pending
      const types = ['project', 'pending'];
      return types[tabIndex] || 'project';
    }
  };

  const handleDownloadPdf = async () => {
    const type = getReportType();
    setExportAnchor(null);
    try {
      const res = await api.get(`/reports/export/pdf?type=${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('PDF export failed');
    }
  };

  const handleDownloadCsv = async () => {
    const type = getReportType();
    setExportAnchor(null);
    try {
      const res = await api.get(`/reports/export/csv?type=${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('CSV export failed');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const empReports = summary?.employeeTaskReports || [];
  const paginatedEmpReports = empReports.slice(
    empPage * empRowsPerPage,
    empPage * empRowsPerPage + empRowsPerPage
  );

  const projReports = summary?.projectProgressReports || [];
  const paginatedProjReports = projReports.slice(
    projPage * projRowsPerPage,
    projPage * projRowsPerPage + projRowsPerPage
  );

  // Determine active tab index for MUI (must always be 0-based from visible tabs)
  const adminTabCount = 3; // Employee, Project, Pending
  const employeeTabCount = 2; // Project, Pending (no Employee tab)

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Reports &amp; Export Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate and export detailed analytics for {isAdmin ? 'employees, ' : ''}project timelines, and pending tasks
          </Typography>
        </Box>

        {/* Single Export Dropdown Button */}
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownload />}
            endIcon={<KeyboardArrowDown />}
            onClick={(e) => setExportAnchor(e.currentTarget)}
            sx={{
              borderRadius: 2,
              fontWeight: 600,
              px: 2.5,
              py: 1,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              }
            }}
          >
            Export Report
          </Button>

          <Menu
            anchorEl={exportAnchor}
            open={exportMenuOpen}
            onClose={() => setExportAnchor(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: {
                  mt: 0.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  border: '1px solid',
                  borderColor: 'divider',
                }
              }
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                Export Current Tab As
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleDownloadPdf} sx={{ py: 1.2 }}>
              <ListItemIcon>
                <PictureAsPdf sx={{ color: '#ef4444', fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Export as PDF"
                secondary="Plain text format"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
            <MenuItem onClick={handleDownloadCsv} sx={{ py: 1.2 }}>
              <ListItemIcon>
                <TableChart sx={{ color: '#22c55e', fontSize: 22 }} />
              </ListItemIcon>
              <ListItemText
                primary="Export as CSV"
                secondary="Spreadsheet format"
                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Tabs — conditionally show Employee tab only for Admins */}
      <Card sx={{ mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {isAdmin && <Tab label="Employee-Wise Task Report" />}
          <Tab label="Project Progress Report" />
          <Tab label="Pending Task Report" />
        </Tabs>
      </Card>

      {/* Tab: Employee-Wise Task Report — Admin Only */}
      {isAdmin && tabIndex === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Employee-Wise Task Completion Report
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Emp ID</TableCell>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Total Assigned</TableCell>
                    <TableCell>Completed Tasks</TableCell>
                    <TableCell>Pending Tasks</TableCell>
                    <TableCell>Completion Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedEmpReports.map((r) => (
                    <TableRow key={r.employeeId} hover>
                      <TableCell>#{r.employeeId}</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>{r.employeeName}</TableCell>
                      <TableCell><Chip label={r.department} size="small" variant="outlined" /></TableCell>
                      <TableCell>{r.totalAssigned}</TableCell>
                      <TableCell><Chip label={r.completed} color="success" size="small" /></TableCell>
                      <TableCell><Chip label={r.pending} color="warning" size="small" /></TableCell>
                      <TableCell style={{ width: '25%' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={r.completionRatePercentage || 0}
                            color={r.completionRatePercentage === 100 ? 'success' : 'primary'}
                            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" fontWeight={700}>
                            {r.completionRatePercentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={empReports.length}
              page={empPage}
              onPageChange={(e, newPage) => setEmpPage(newPage)}
              rowsPerPage={empRowsPerPage}
              onRowsPerPageChange={(e) => { setEmpRowsPerPage(parseInt(e.target.value, 10)); setEmpPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>
      )}

      {/* Tab: Project Progress Report — Admin: tab 1, Employee: tab 0 */}
      {((isAdmin && tabIndex === 1) || (!isAdmin && tabIndex === 0)) && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Project Timeline &amp; Progress Report
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Proj ID</TableCell>
                    <TableCell>Project Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Total Tasks</TableCell>
                    <TableCell>Completed Tasks</TableCell>
                    <TableCell>Overall Progress</TableCell>
                    <TableCell>Deadline</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedProjReports.map((p) => (
                    <TableRow key={p.projectId} hover>
                      <TableCell>#{p.projectId}</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>{p.projectName}</TableCell>
                      <TableCell><Chip label={p.status} color="primary" size="small" /></TableCell>
                      <TableCell><Chip label={p.priority} variant="outlined" size="small" /></TableCell>
                      <TableCell>{p.totalTasks}</TableCell>
                      <TableCell><Chip label={p.completedTasks} color="success" size="small" /></TableCell>
                      <TableCell style={{ width: '20%' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={p.progressPercentage || 0}
                            color={p.progressPercentage === 100 ? 'success' : 'primary'}
                            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" fontWeight={700}>
                            {p.progressPercentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{p.deadline}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={projReports.length}
              page={projPage}
              onPageChange={(e, newPage) => setProjPage(newPage)}
              rowsPerPage={projRowsPerPage}
              onRowsPerPageChange={(e) => { setProjRowsPerPage(parseInt(e.target.value, 10)); setProjPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>
      )}

      {/* Tab: Pending Tasks Report — Admin: tab 2, Employee: tab 1 */}
      {((isAdmin && tabIndex === 2) || (!isAdmin && tabIndex === 1)) && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} gutterBottom color="warning.main">
              Pending &amp; In-Progress Tasks Report
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Total System Tasks: <strong>{pendingTotal}</strong>
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task ID</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Assigned Employee</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Due Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingTasks.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>#{t.id}</TableCell>
                      <TableCell style={{ fontWeight: 600 }}>{t.title}</TableCell>
                      <TableCell>{t.projectName || 'Unassigned'}</TableCell>
                      <TableCell>{t.assignedEmployeeName || 'Unassigned'}</TableCell>
                      <TableCell>
                        <Chip
                          label={t.status}
                          color={t.status === 'COMPLETED' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell style={{ width: '20%' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <LinearProgress
                            variant="determinate"
                            value={t.progress || 0}
                            sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption" fontWeight={700}>{t.progress || 0}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{t.dueDate || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={pendingTotal}
              page={pendingPage}
              onPageChange={(e, newPage) => setPendingPage(newPage)}
              rowsPerPage={pendingRowsPerPage}
              onRowsPerPageChange={(e) => { setPendingRowsPerPage(parseInt(e.target.value, 10)); setPendingPage(0); }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
