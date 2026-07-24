import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button, TextField, Typography, Box, Alert, MenuItem, InputAdornment, IconButton,
  Divider, CircularProgress, LinearProgress
} from '@mui/material';
import { Person, Lock, Email, Badge, Visibility, VisibilityOff, ArrowForward, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { validateRegister } from '../utils/validation';
import Logo from '../components/Logo';

const ROLES = [
  { value: 'ROLE_EMPLOYEE', label: 'Employee' },
  { value: 'ROLE_ADMIN', label: 'Administrator' }
];

function PasswordStrength({ password }) {
  let strength = 0;
  if (password.length >= 6) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;
  return (
    <Box mt={0.5}>
      <LinearProgress
        variant="determinate"
        value={(strength / 4) * 100}
        sx={{
          height: 4, borderRadius: 2,
          bgcolor: '#e2e8f0',
          '& .MuiLinearProgress-bar': { bgcolor: colors[strength - 1] || '#ef4444', borderRadius: 2 }
        }}
      />
      <Typography variant="caption" sx={{ color: colors[strength - 1] || '#ef4444', fontWeight: 600 }}>
        {labels[strength - 1] || 'Too short'}
      </Typography>
    </Box>
  );
}

import { useTheme } from '@mui/material/styles';

export default function Register() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'ROLE_EMPLOYEE',
    email: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (field) => {
    const { errors } = validateRegister(formData);
    setFieldErrors(prev => ({ ...prev, [field]: errors[field] || '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const { isValid, errors } = validateRegister(formData);
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await registerUser(formData);
      setSuccess('Account created successfully! Redirecting to sign-in…');
      setTimeout(() => { navigate('/login'); }, 1800);
    } catch (err) {
      const apiMsg = err.response?.data?.message ||
        (err.response?.data?.fieldErrors ? Object.values(err.response.data.fieldErrors).join(', ') : null) ||
        'Registration failed. Please try again.';
      setError(apiMsg);
    } finally {
      setLoading(false);
    }
  };

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: 2 }
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: isLight ? '#f8fafc' : '#0b0f19' }}>
      {/* ── Left Brand Panel ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '38%',
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #1a1040 100%)',
          p: 6,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(14,165,233,0.08)', pointerEvents: 'none' }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Logo mode="dark" size="medium" showSubtitle={false} />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2, mb: 2, fontSize: { lg: '1.9rem', xl: '2.4rem' } }}>
            Join Your<br />
            <Box component="span" sx={{ color: '#818cf8' }}>Organization's Platform</Box>
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.7 }}>
            Register to gain access to projects, tasks, and collaboration tools tailored to your role.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {['Instant role assignment', 'Secure credential management', 'Audit-ready onboarding'].map(feat => (
            <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircle sx={{ color: '#818cf8', fontSize: 16 }} />
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.87rem', fontWeight: 500 }}>{feat}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right Form Panel ──────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: { xs: 3, sm: 6, md: 8 }, py: 6 }}>
        {/* Mobile Logo */}
        <Box sx={{ display: { xs: 'block', lg: 'none' }, mb: 4 }}>
          <Logo mode="light" size="medium" showSubtitle={true} />
        </Box>

        <Box sx={{ width: '100%', maxWidth: 500 }}>
          {/* Header */}
          <Box mb={4}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Create your account
            </Typography>
            <Typography variant="body2" sx={{ color: isLight ? '#64748b' : '#94a3b8', mt: 1, fontSize: '0.95rem' }}>
              Fill in your details to register with Smart Enterprise.
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2.5, borderRadius: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Name row */}
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={2}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur('firstName')}
                required
                fullWidth
                size="small"
                error={!!fieldErrors.firstName}
                helperText={fieldErrors.firstName || ''}
                InputProps={{ startAdornment: <InputAdornment position="start"><Badge sx={{ color: fieldErrors.firstName ? 'error.main' : '#94a3b8', fontSize: 18 }} /></InputAdornment> }}
                sx={fieldSx}
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur('lastName')}
                required
                fullWidth
                size="small"
                error={!!fieldErrors.lastName}
                helperText={fieldErrors.lastName || ''}
                InputProps={{ startAdornment: <InputAdornment position="start"><Badge sx={{ color: fieldErrors.lastName ? 'error.main' : '#94a3b8', fontSize: 18 }} /></InputAdornment> }}
                sx={fieldSx}
              />
            </Box>

            {/* Email */}
            <TextField
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              required
              fullWidth
              size="small"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || ''}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: fieldErrors.email ? 'error.main' : '#94a3b8', fontSize: 18 }} /></InputAdornment> }}
              sx={{ ...fieldSx, mb: 2 }}
            />

            {/* Username + Role row */}
            <Box display="grid" gridTemplateColumns="2fr 1fr" gap={2} mb={2}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={() => handleBlur('username')}
                required
                fullWidth
                size="small"
                error={!!fieldErrors.username}
                helperText={fieldErrors.username || 'Letters, numbers, dots, hyphens'}
                InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: fieldErrors.username ? 'error.main' : '#94a3b8', fontSize: 18 }} /></InputAdornment> }}
                sx={fieldSx}
              />
              <TextField
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                fullWidth
                size="small"
                sx={fieldSx}
              >
                {ROLES.map(r => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </TextField>
            </Box>

            {/* Password */}
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              required
              fullWidth
              size="small"
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || ''}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: fieldErrors.password ? 'error.main' : '#94a3b8', fontSize: 18 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff sx={{ color: '#94a3b8', fontSize: 18 }} /> : <Visibility sx={{ color: '#94a3b8', fontSize: 18 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ ...fieldSx, mb: 0.5 }}
            />
            <PasswordStrength password={formData.password} />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForward />}
              sx={{
                mt: 3, py: 1.5, fontWeight: 700, fontSize: '0.95rem', borderRadius: 2,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)', boxShadow: '0 8px 24px rgba(99,102,241,0.5)' }
              }}
            >
              {loading ? 'Creating Account…' : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" sx={{ color: isLight ? '#94a3b8' : '#64748b', px: 1, fontSize: '0.78rem' }}>
              Already registered?
            </Typography>
          </Divider>

          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                py: 1.3, fontWeight: 600, borderRadius: 2, textTransform: 'none',
                borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.15)',
                color: isLight ? '#0f172a' : '#f8fafc', fontSize: '0.92rem',
                '&:hover': { borderColor: '#6366f1', color: '#6366f1', bgcolor: 'rgba(99,102,241,0.04)' }
              }}
            >
              Sign in to existing account
            </Button>
          </Link>
        </Box>
      </Box>
    </Box>
  );
}
