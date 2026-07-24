import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, TextField, MenuItem, Chip, IconButton, InputAdornment, AvatarGroup, Avatar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TablePagination
} from '@mui/material';
import { Add, Search, Edit, Delete, AccountTree, CalendarToday, PriorityHigh, FilterList } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import ProjectModal from '../components/ProjectModal';

export default function ProjectList() {
  const { user, isAdmin } = useAuth();

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const canEditProject = (proj) => {
    if (isAdmin) return true;
    if (!user?.employeeId) return false;
    return Array.isArray(proj.employeeIds) && proj.employeeIds.includes(user.employeeId);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchEmployees();
  }, [page, rowsPerPage, status, priority]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams({
        page,
        size: rowsPerPage,
        sortDir: 'desc'
      });
      if (searchQuery) params.append('query', searchQuery);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);

      const res = await api.get(`/projects?${params.toString()}`);
      setProjects(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setAlertMsg('Failed to load projects');
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?size=100');
      setEmployees(res.data.content || []);
    } catch (err) {
      // ignore
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProjects();
  };

  const handleOpenAddModal = () => {
    setSelectedProject(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (proj) => {
    setSelectedProject(proj);
    setModalOpen(true);
  };

  const handleSaveProject = async (formData) => {
    try {
      if (selectedProject) {
        await api.put(`/projects/${selectedProject.id}`, formData);
        setAlertMsg('Project updated successfully!');
      } else {
        await api.post('/projects', formData);
        setAlertMsg('Project created successfully!');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      const errMsg = err.response?.data?.message || (err.response?.data?.fieldErrors ? Object.values(err.response.data.fieldErrors).join(', ') : err.message) || 'Action failed';
      alert(errMsg);
    }
  };

  const handleDeleteClick = (proj) => {
    setProjectToDelete(proj);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      await api.delete(`/projects/${projectToDelete.id}`);
      setAlertMsg('Project deleted');
      setDeleteDialogOpen(false);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Project Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage projects, timelines, priorities, and assigned team members
          </Typography>
        </Box>

        {/* HIDE Create Project button for non-Admin users */}
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddModal}>
            Create Project
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
          <Box component="form" onSubmit={handleSearchSubmit} display="grid" gridTemplateColumns={{ xs: '1fr', sm: '2fr 1fr 1fr 1fr' }} gap={2}>
            <TextField
              label="Search Projects"
              placeholder="Search by project name, description..."
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
              onChange={(e) => setStatus(e.target.value)}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PLANNED">Planned</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="ON_HOLD">On Hold</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" color="secondary" startIcon={<FilterList />}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Project Grid */}
      <Grid container spacing={3}>
        {projects.length === 0 ? (
          <Grid item xs={12}>
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No projects found matching the specified filters.</Typography>
            </Card>
          </Grid>
        ) : (
          projects.map((proj) => (
            <Grid item xs={12} sm={6} md={4} key={proj.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {proj.name}
                    </Typography>

                    <Box>
                      {canEditProject(proj) && (
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(proj)} title="Update Project Progress">
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      {isAdmin && (
                        <IconButton size="small" color="error" onClick={() => handleDeleteClick(proj)} title="Delete Project">
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph sx={{ minHeight: 40 }}>
                    {proj.description || 'No detailed description provided.'}
                  </Typography>

                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <StatusChip status={proj.status} />
                    <PriorityChip priority={proj.priority} />
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} color="text.secondary" mb={2}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="caption" fontWeight={600}>
                      Deadline: {proj.deadline || 'No deadline'}
                    </Typography>
                  </Box>

                  <Box mt={2}>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                      Assigned Team:
                    </Typography>
                    <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                      {proj.employeeNames && proj.employeeNames.length > 0 ? (
                        proj.employeeNames.map((name, i) => (
                          <Tooltip key={i} title={name}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 30, height: 30, fontSize: '0.75rem' }}>
                              {name.charAt(0)}
                            </Avatar>
                          </Tooltip>
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">No team assigned</Typography>
                      )}
                    </AvatarGroup>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Pagination Controls */}
      <Card sx={{ mt: 3 }}>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Card>

      {/* Project Modal */}
      {modalOpen && (
        <ProjectModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveProject}
          initialData={selectedProject}
          employees={employees}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete project <strong>{projectToDelete?.name}</strong>?
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
  else if (status === 'ON_HOLD') color = 'warning';

  return <Chip label={status || 'PLANNED'} color={color} size="small" />;
}

function PriorityChip({ priority }) {
  let color = 'info';
  if (priority === 'URGENT') color = 'error';
  else if (priority === 'HIGH') color = 'warning';

  return <Chip label={priority || 'MEDIUM'} color={color} variant="outlined" size="small" />;
}
