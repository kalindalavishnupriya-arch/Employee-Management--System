import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Button, TextField, Typography, Box, Alert, InputAdornment, IconButton,
  LinearProgress, Divider, CircularProgress
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, CheckCircle, LockReset, ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import Logo from '../components/Logo';

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '#e2e8f0' };
  let s = 0;
  if (pwd.length >= 6) s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;

  const map = [
    { score: 20, label: 'Weak', color: '#ef4444' },
    { score: 40, label: 'Fair', color: '#f59e0b' },
    { score: 60, label: 'Good', color: '#3b82f6' },
    { score: 80, label: 'Strong', color: '#10b981' },
    { score: 100, label: 'Very Strong', color: '#059669' },
  ];
  return map[Math.min(s, 5) - 1] || map[0];
}

import { useTheme } from '@mui/material/styles';

export default function ResetPassword() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
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
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: isLight ? '#f8fafc' : '#0b0f19',
      px: 3, py: 6
    }}>
      <Box sx={{ mb: 5 }}>
        <Logo mode={isLight ? 'light' : 'dark'} size="medium" showSubtitle={true} />
      </Box>

      <Box sx={{ width: '100%', maxWidth: 440 }}>
        {/* Header */}
        <Box textAlign="center" mb={3}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '14px', mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(99,102,241,0.35)'
          }}>
            <LockReset sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', letterSpacing: '-0.02em' }}>
            Reset Password
          </Typography>
          <Typography variant="body2" sx={{ color: isLight ? '#64748b' : '#94a3b8', mt: 1, fontSize: '0.95rem' }}>
            Enter your new password below.
          </Typography>
        </Box>

        {/* Invalid token state */}
        {error && !token && (
          <Box textAlign="center" py={2}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 1.4, fontWeight: 700, borderRadius: 2, textTransform: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  boxShadow: '0 6px 20px rgba(99,102,241,0.4)'
                }}
              >
                Request New Reset Link
              </Button>
            </Link>
          </Box>
        )}

        {error && token && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

        {/* Success state */}
        {success ? (
          <Box textAlign="center" py={2}>
            <CheckCircle sx={{ fontSize: 56, mb: 2, color: '#10b981' }} />
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#059669' }}>
              Password Reset Successful!
            </Typography>
            <Typography variant="body2" sx={{ color: isLight ? '#64748b' : '#94a3b8', mb: 3, lineHeight: 1.7 }}>
              Your password has been changed. Redirecting to sign-in…
            </Typography>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 1.4, fontWeight: 700, borderRadius: 2, textTransform: 'none',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                  boxShadow: '0 6px 20px rgba(99,102,241,0.4)'
                }}
              >
                Go to Sign In
              </Button>
            </Link>
          </Box>
        ) : token ? (
          /* Form */
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              required
              autoFocus
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff sx={{ color: '#94a3b8', fontSize: 20 }} /> : <Visibility sx={{ color: '#94a3b8', fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={fieldSx}
            />

            {newPassword && (
              <Box sx={{ mt: -0.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={strength.score}
                  sx={{
                    height: 4, borderRadius: 2, bgcolor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: strength.color, borderRadius: 2 }
                  }}
                />
                <Typography variant="caption" sx={{ color: strength.color, fontWeight: 600, mt: 0.5, display: 'block' }}>
                  {strength.label}
                </Typography>
              </Box>
            )}

            <TextField
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              required
              error={confirmPassword.length > 0 && newPassword !== confirmPassword}
              helperText={confirmPassword.length > 0 && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94a3b8', fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                      {showConfirm ? <VisibilityOff sx={{ color: '#94a3b8', fontSize: 20 }} /> : <Visibility sx={{ color: '#94a3b8', fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={fieldSx}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                mt: 1, py: 1.5, fontWeight: 700, fontSize: '0.95rem', borderRadius: 2,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)' }
              }}
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </Button>

            <Divider sx={{ my: 1 }} />

            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="text"
                startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
                fullWidth
                sx={{
                  fontWeight: 600, textTransform: 'none',
                  color: isLight ? '#475569' : '#94a3b8',
                  '&:hover': { color: '#6366f1' }
                }}
              >
                Back to Sign In
              </Button>
            </Link>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
