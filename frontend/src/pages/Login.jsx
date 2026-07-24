import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Button, TextField, Typography, Box, Alert, InputAdornment, IconButton, Divider, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person, ArrowForward, Shield } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { validateLogin } from '../utils/validation';
import Logo from '../components/Logo';

import { useTheme } from '@mui/material/styles';

export default function Login() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleBlur = (field) => {
    const { errors } = validateLogin({ username, password });
    setFieldErrors(prev => ({ ...prev, [field]: errors[field] || '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const { isValid, errors } = validateLogin({ username, password });
    if (!isValid) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: isLight ? '#f8fafc' : '#0b0f19' }}>
      {/* ── Left Brand Panel ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '45%',
          minHeight: '100vh',
          background: 'linear-gradient(160deg, #0f172a 0%, #1e293b 40%, #1a1040 100%)',
          p: 6,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', top: -80, right: -80, width: 320, height: 320,
          borderRadius: '50%', background: 'rgba(99,102,241,0.12)', pointerEvents: 'none'
        }} />
        <Box sx={{
          position: 'absolute', bottom: -60, left: -60, width: 240, height: 240,
          borderRadius: '50%', background: 'rgba(14,165,233,0.08)', pointerEvents: 'none'
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Logo mode="dark" size="medium" showSubtitle={false} />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, color: '#ffffff', lineHeight: 1.2, mb: 2, fontSize: { md: '2rem', lg: '2.5rem' } }}
          >
            Enterprise-Grade<br />
            <Box component="span" sx={{ color: '#818cf8' }}>Workforce Management</Box>
          </Typography>
          <Typography sx={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.7, maxWidth: 360 }}>
            Streamline projects, teams, and tasks from a single unified platform built for modern organizations.
          </Typography>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            'Role-based access control',
            'Real-time project tracking',
            'Audit-grade activity logs',
          ].map((feat) => (
            <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #0ea5e9)',
                flexShrink: 0
              }} />
              <Typography sx={{ color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 500 }}>{feat}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right Form Panel ──────────────────────────────────────────── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 6, md: 8 },
          py: 6
        }}
      >
        {/* Mobile Logo */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
          <Logo mode="light" size="medium" showSubtitle={true} />
        </Box>

        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Header */}
          <Box mb={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: '10px',
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99,102,241,0.35)'
              }}>
                <Shield sx={{ color: '#fff', fontSize: 18 }} />
              </Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6366f1' }}>
                Secure Login
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              Sign in to your account
            </Typography>
            <Typography variant="body2" sx={{ color: isLight ? '#64748b' : '#94a3b8', mt: 1, fontSize: '0.95rem' }}>
              Enter your credentials to access the management portal.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setFieldErrors(p => ({ ...p, username: '' })); }}
              onBlur={() => handleBlur('username')}
              fullWidth
              required
              autoFocus
              error={!!fieldErrors.username}
              helperText={fieldErrors.username || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: fieldErrors.username ? 'error.main' : '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: 2 }
                }
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })); }}
              onBlur={() => handleBlur('password')}
              fullWidth
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password || ''}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: fieldErrors.password ? 'error.main' : '#94a3b8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff sx={{ color: '#94a3b8', fontSize: 20 }} /> : <Visibility sx={{ color: '#94a3b8', fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1', borderWidth: 2 }
                }
              }}
            />

            <Box textAlign="right" mt={-1}>
              <Link to="/forgot-password" style={{ textDecoration: 'none', fontWeight: 600, color: '#6366f1', fontSize: '0.82rem' }}>
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForward />}
              sx={{
                py: 1.5,
                fontWeight: 700,
                fontSize: '0.95rem',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)', boxShadow: '0 8px 24px rgba(99,102,241,0.5)' }
              }}
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" sx={{ color: isLight ? '#94a3b8' : '#64748b', px: 1, fontSize: '0.78rem' }}>
              New to the platform?
            </Typography>
          </Divider>

          <Box textAlign="center">
            <Link to="/register" style={{ textDecoration: 'none' }}>
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
                Create an account
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
