import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Box, Alert,
  Avatar, IconButton, Typography, LinearProgress, Chip, Tooltip
} from '@mui/material';
import { PhotoCamera, CheckCircle, CloudUpload } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import { validateEmployee } from '../utils/validation';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;

export default function EmployeeModal({ open, onClose, onSave, initialData }) {
  const { isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'Engineering',
    designation: 'Developer',
    status: 'Active',
    joinedDate: new Date().toISOString().split('T')[0]
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        department: initialData.department || 'Engineering',
        designation: initialData.designation || 'Developer',
        status: initialData.status || 'Active',
        joinedDate: initialData.joinedDate || new Date().toISOString().split('T')[0]
      });
      setPreviewUrl(initialData.profileImageUrl || '');
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        department: 'Engineering',
        designation: 'Developer',
        status: 'Active',
        joinedDate: new Date().toISOString().split('T')[0]
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setError('');
    setFieldErrors({});
    setUploadProgress(0);
    setUploadDone(false);
  }, [initialData, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleBlur = (field) => {
    const { errors } = validateEmployee(formData);
    setFieldErrors(prev => ({ ...prev, [field]: errors[field] || '' }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Invalid file type. Please upload a JPG, PNG, WEBP, or GIF image.');
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File size must be less than ${MAX_FILE_SIZE_MB}MB. Selected file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadDone(false);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { isValid, errors } = validateEmployee(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    try {
      setUploading(true);
      setUploadProgress(10);

      const savedEmp = await onSave(formData);
      setUploadProgress(selectedFile ? 40 : 100);

      // Upload profile image if file selected and savedEmp exists
      if (selectedFile && savedEmp && savedEmp.id) {
        const fileData = new FormData();
        fileData.append('file', selectedFile);
        await api.post(`/files/upload-profile/${savedEmp.id}`, fileData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 60) / progressEvent.total) + 40;
              setUploadProgress(Math.min(pct, 95));
            }
          }
        });
        setUploadProgress(100);
        setUploadDone(true);
      }

      setTimeout(() => onClose(), 450);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const fileSizeLabel = selectedFile
    ? `${selectedFile.name} · ${(selectedFile.size / 1024).toFixed(0)} KB`
    : null;

  return (
    <Dialog open={open} onClose={uploading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
        {initialData ? (isAdmin ? 'Edit Employee' : 'Edit My Profile') : 'Add New Employee'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Profile Image Upload */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Box position="relative">
              <Avatar
                src={previewUrl}
                sx={{
                  width: 130,
                  height: 130,
                  fontSize: '3.2rem',
                  bgcolor: 'primary.main',
                  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
                  border: uploadDone ? '3px solid #22c55e' : '3px solid #6366f1',
                  transition: 'border-color 0.3s ease',
                  objectFit: 'cover',
                }}
              >
                {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'E'}
              </Avatar>

              {/* Upload Done Checkmark */}
              {uploadDone && (
                <CheckCircle sx={{
                  position: 'absolute', top: 4, right: 4,
                  color: '#22c55e', fontSize: 24,
                  bgcolor: 'background.paper',
                  borderRadius: '50%'
                }} />
              )}

              <Tooltip title="Click to change profile photo">
                <IconButton
                  color="primary"
                  aria-label="upload profile picture"
                  component="label"
                  disabled={uploading}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    p: 0.8,
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <input
                    hidden
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <PhotoCamera fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* File info chip */}
            {fileSizeLabel && !error ? (
              <Chip
                icon={<CloudUpload sx={{ fontSize: 14 }} />}
                label={fileSizeLabel}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ mt: 1.5, maxWidth: 260, fontSize: '0.7rem' }}
              />
            ) : (
              <Typography variant="caption" color="text.secondary" mt={1.5} fontWeight={500}>
                Click camera icon · JPG, PNG, WEBP, GIF · Max {MAX_FILE_SIZE_MB}MB
              </Typography>
            )}

            {/* Upload Progress Bar */}
            {uploading && (
              <Box sx={{ width: '100%', mt: 1.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    borderRadius: 4,
                    height: 6,
                    bgcolor: 'action.disabledBackground',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      bgcolor: uploadProgress === 100 ? '#22c55e' : 'primary.main',
                      transition: 'background-color 0.4s ease',
                    }
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: 'block', textAlign: 'center' }}
                >
                  {uploadProgress < 40
                    ? 'Saving profile…'
                    : uploadProgress < 100
                      ? `Uploading photo… ${uploadProgress}%`
                      : '✓ Done!'}
                </Typography>
              </Box>
            )}
          </Box>

          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={() => handleBlur('firstName')}
              required
              fullWidth
              disabled={uploading}
              error={!!fieldErrors.firstName}
              helperText={fieldErrors.firstName || ''}
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={() => handleBlur('lastName')}
              required
              fullWidth
              disabled={uploading}
              error={!!fieldErrors.lastName}
              helperText={fieldErrors.lastName || ''}
            />
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              required
              fullWidth
              disabled={uploading}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || ''}
              sx={{ gridColumn: 'span 2' }}
            />
            <TextField
              select
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              disabled={!isAdmin || uploading}
              fullWidth
            >
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
              <MenuItem value="Operations">Operations</MenuItem>
            </TextField>
            <TextField
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              disabled={!isAdmin || uploading}
              fullWidth
            />
            <TextField
              select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={!isAdmin || uploading}
              fullWidth
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="On Leave">On Leave</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
            <TextField
              label="Joined Date"
              name="joinedDate"
              type="date"
              value={formData.joinedDate}
              onChange={handleChange}
              disabled={!isAdmin || uploading}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit" disabled={uploading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={uploading}
            startIcon={!uploading && <CloudUpload sx={{ fontSize: 18 }} />}
            sx={{ minWidth: 155 }}
          >
            {uploading
              ? `${uploadProgress}%`
              : initialData
                ? (isAdmin ? 'Update Employee' : 'Update Profile')
                : 'Create Employee'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
