import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Alert, Slider, Typography
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function TaskModal({ open, onClose, onSave, initialData, employees = [], projects = [] }) {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    progress: 0,
    remarks: '',
    dueDate: new Date().toISOString().split('T')[0],
    assignedEmployeeId: '',
    projectId: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'TODO',
        progress: initialData.progress || 0,
        remarks: initialData.remarks || '',
        dueDate: initialData.dueDate || new Date().toISOString().split('T')[0],
        assignedEmployeeId: initialData.assignedEmployeeId || '',
        projectId: initialData.projectId || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'TODO',
        progress: 0,
        remarks: '',
        dueDate: new Date().toISOString().split('T')[0],
        assignedEmployeeId: '',
        projectId: ''
      });
    }
    setError('');
  }, [initialData, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    let newProgress = formData.progress;
    if (newStatus === 'COMPLETED') {
      newProgress = 100;
    }
    setFormData({ ...formData, status: newStatus, progress: newProgress });
  };

  const handleProgressChange = (event, newValue) => {
    let newStatus = formData.status;
    if (newValue === 100) {
      newStatus = 'COMPLETED';
    }
    setFormData({ ...formData, progress: newValue, status: newStatus });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      setError('Task title is required');
      return;
    }
    onSave({
      ...formData,
      assignedEmployeeId: formData.assignedEmployeeId ? Number(formData.assignedEmployeeId) : 0,
      projectId: formData.projectId ? Number(formData.projectId) : 0
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? (isAdmin ? 'Edit Task' : 'Update Task Progress & Remarks') : 'Create New Task'}</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
              disabled={!isAdmin && !!initialData}
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={2}
              fullWidth
              disabled={!isAdmin && !!initialData}
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              select
              label="Assigned Employee"
              name="assignedEmployeeId"
              value={formData.assignedEmployeeId}
              onChange={handleChange}
              fullWidth
              disabled={!isAdmin && !!initialData}
            >
              <MenuItem value="">Unassigned</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Associated Project"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              fullWidth
              disabled={!isAdmin && !!initialData}
            >
              <MenuItem value="">None</MenuItem>
              {projects.map((proj) => (
                <MenuItem key={proj.id} value={proj.id}>
                  {proj.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleStatusChange}
              fullWidth
            >
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="IN_REVIEW">In Review</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </TextField>
            <TextField
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
              disabled={!isAdmin && !!initialData}
            />

            <Box sx={{ gridColumn: 'span 2', px: 1, py: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Completion Progress: {formData.progress}%
              </Typography>
              <Slider
                value={formData.progress}
                onChange={handleProgressChange}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
                color={formData.progress === 100 ? 'success' : 'primary'}
              />
            </Box>

            <TextField
              label="Remarks / Notes"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              multiline
              rows={3}
              placeholder="Add progress notes or remarks..."
              fullWidth
              sx={{ gridColumn: 'span 2' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
