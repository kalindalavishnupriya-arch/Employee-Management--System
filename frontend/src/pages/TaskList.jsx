import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Button, TextField, MenuItem, IconButton, Chip, InputAdornment, LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Grid
} from '@mui/material';
import { Add, Search, Edit, Delete, FilterList, Assignment, Person, AccountTree, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import TaskModal from '../components/TaskModal';

export default function TaskList() {
  const { user, isAdmin } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [alertMsg, setAlertMsg] = useState('');

  const canEditTask = (task) => {
    if (isAdmin) return true;
    if (!user?.employeeId) return false;
    if (task.assignedEmployeeId === user.employeeId) return true;
    if (task.projectId) {
      const proj = projects.find((p) => p.id === task.projectId);
      if (proj && Array.isArray(proj.employeeIds) && proj.employeeIds.includes(user.employeeId)) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    fetchTasks();
    fetchDropdowns();
  }, [page, rowsPerPage, status, employeeFilter, projectFilter]);

  const fetchTasks = async () => {
    try {
      const params = new URLSearchParams({
        page,
        size: rowsPerPage,
        sortDir: 'desc'
      });
      if (searchQuery) params.append('query', searchQuery);
      if (status) params.append('status', status);
      if (employeeFilter) params.append('employeeId', employeeFilter);
      if (projectFilter) params.append('projectId', projectFilter);

      const res = await api.get(`/tasks?${params.toString()}`);
      setTasks(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setAlertMsg('Failed to load tasks');
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [empRes, projRes] = await Promise.all([
        api.get('/employees?size=100'),
        api.get('/projects?size=100')
      ]);
      setEmployees(empRes.data.content || []);
      setProjects(projRes.data.content || []);
    } catch (err) {
      // ignore
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTasks();
  };

  const handleOpenAddModal = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleSaveTask = async (formData) => {
    try {
      if (selectedTask) {
        await api.put(`/tasks/${selectedTask.id}`, formData);
        setAlertMsg('Task updated successfully!');
      } else {
        await api.post('/tasks', formData);
        setAlertMsg('Task created successfully!');
      }
      setModalOpen(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    try {
      await api.delete(`/tasks/${taskToDelete.id}`);
      setAlertMsg('Task deleted');
      setDeleteDialogOpen(false);
      fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Task Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign tasks, track progress percentage, and manage status & remarks
          </Typography>
        </Box>

        {/* HIDE Create Task button for non-Admin users */}
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddModal}>
            Create Task
          </Button>
        )}
      </Box>

      {alertMsg && (
        <Alert severity="success" onClose={() => setAlertMsg('')} sx={{ mb: 2 }}>
          {alertMsg}
        </Alert>
      )}

      {/* Filter Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearchSubmit} display="grid" gridTemplateColumns={{ xs: '1fr', sm: '2fr 1fr 1fr 1fr 1fr' }} gap={2}>
            <TextField
              label="Search Tasks"
              placeholder="Search by title, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="IN_REVIEW">In Review</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </TextField>
            <TextField
              select
              label="Assigned Employee"
              value={employeeFilter}
              onChange={(e) => { setEmployeeFilter(e.target.value); setPage(0); }}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">All Employees</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Project"
              value={projectFilter}
              onChange={(e) => { setProjectFilter(e.target.value); setPage(0); }}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">All Projects</MenuItem>
              {projects.map((proj) => (
                <MenuItem key={proj.id} value={proj.id}>
                  {proj.name}
                </MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained" color="secondary" startIcon={<FilterList />}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Task Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Assigned Employee</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    No tasks found matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((t) => (
                  <TableRow key={t.id} hover>
                    <TableCell>#{t.id}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment color="primary" fontSize="small" />
                        <Box>
                          <Typography fontWeight={600}>{t.title}</Typography>
                          {t.remarks && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Remarks: {t.remarks}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{t.projectName || 'Unassigned'}</TableCell>
                    <TableCell>{t.assignedEmployeeName || 'Unassigned'}</TableCell>
                    <TableCell>
                      <StatusChip status={t.status} />
                    </TableCell>
                    <TableCell style={{ width: '20%' }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LinearProgress
                          variant="determinate"
                          value={t.progress || 0}
                          color={t.progress === 100 ? 'success' : 'primary'}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="caption" fontWeight={700}>
                          {t.progress || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{t.dueDate || 'N/A'}</TableCell>
                    <TableCell align="right">
                      {canEditTask(t) && (
                        <IconButton color="primary" onClick={() => handleOpenEditModal(t)} title="Update Task Progress">
                          <Edit />
                        </IconButton>
                      )}

                      {/* HIDE Delete action button for non-Admin users */}
                      {isAdmin && (
                        <IconButton color="error" onClick={() => handleDeleteClick(t)}>
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Card>

      {/* Task Modal */}
      {modalOpen && (
        <TaskModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveTask}
          initialData={selectedTask}
          employees={employees}
          projects={projects}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete task <strong>{taskToDelete?.title}</strong>?
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function StatusChip({ status }) {
  let color = 'default';
  if (status === 'COMPLETED') color = 'success';
  else if (status === 'IN_PROGRESS') color = 'primary';
  else if (status === 'IN_REVIEW') color = 'warning';

  return <Chip label={status || 'TODO'} color={color} size="small" />;
}
