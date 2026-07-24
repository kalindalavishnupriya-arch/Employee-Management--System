import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Alert, Select, InputLabel, FormControl, OutlinedInput, Chip, FormHelperText
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { validateProject } from '../utils/validation';

export default function ProjectModal({ open, onClose, onSave, initialData, employees = [] }) {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PLANNED',
    priority: 'MEDIUM',
    deadline: new Date().toISOString().split('T')[0],
    employeeIds: []
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'PLANNED',
        priority: initialData.priority || 'MEDIUM',
        deadline: initialData.deadline || new Date().toISOString().split('T')[0],
        employeeIds: Array.from(initialData.employeeIds || [])
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'PLANNED',
        priority: 'MEDIUM',
        deadline: new Date().toISOString().split('T')[0],
        employeeIds: []
      });
    }
    setError('');
    setFieldErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error on change
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleEmployeeChange = (event) => {
    const { target: { value } } = event;
    setFormData({
      ...formData,
      employeeIds: typeof value === 'string' ? value.split(',') : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, errors } = validateProject(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setError('');
    onSave({
      ...formData,
      deadline: formData.deadline ? formData.deadline : null,
      employeeIds: formData.employeeIds
    });
  };

  const isFieldDisabled = !isAdmin && !!initialData;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? (isAdmin ? 'Edit Project' : 'Update Project Progress & Status') : 'Create New Project'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              disabled={isFieldDisabled}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name || 'Min 3 chars, max 120'}
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              label="Description / Progress Notes"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              error={!!fieldErrors.description}
              helperText={fieldErrors.description || `${formData.description?.length || 0}/1000`}
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              select
              label="Project Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="PLANNED">Planned</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="ON_HOLD">On Hold</MenuItem>
            </TextField>
            <TextField
              select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="URGENT">Urgent</MenuItem>
            </TextField>
            <TextField
              label="Deadline Date"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              disabled={isFieldDisabled}
              fullWidth
            />
            <FormControl fullWidth disabled={isFieldDisabled} sx={{ gridColumn: 'span 2' }}>
              <InputLabel id="assign-employees-label">Assign Employees</InputLabel>
              <Select
                labelId="assign-employees-label"
                multiple
                value={formData.employeeIds}
                onChange={handleEmployeeChange}
                input={<OutlinedInput label="Assign Employees" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((id) => {
                      const emp = employees.find(e => e.id === id);
                      return (
                        <Chip
                          key={id}
                          label={emp ? `${emp.firstName} ${emp.lastName}` : `ID: ${id}`}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.department})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData ? 'Update Progress' : 'Create Project'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
