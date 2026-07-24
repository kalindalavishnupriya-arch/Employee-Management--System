import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Button, TextField, Typography, Box, Alert, InputAdornment, Divider, CircularProgress
} from '@mui/material';
import { Email, ArrowBack, CheckCircle, MailOutline } from '@mui/icons-material';
import axios from 'axios';
import Logo from '../components/Logo';

import { useTheme } from '@mui/material/styles';

export default function ForgotPassword() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email: email.trim() });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
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
        {/* Header icon */}
        <Box textAlign="center" mb={3}>
          <Box sx={{
            width: 52, height: 52, borderRadius: '14px', mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(99,102,241,0.35)'
          }}>
            <MailOutline sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: isLight ? '#0f172a' : '#f8fafc', letterSpacing: '-0.02em' }}>
            Forgot Password
          </Typography>
          <Typography variant="body2" sx={{ color: isLight ? '#64748b' : '#94a3b8', mt: 1, fontSize: '0.95rem' }}>
            Enter your registered email and we'll send you a reset link.
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

        {success ? (
          <Box textAlign="center" py={2}>
            <CheckCircle sx={{ fontSize: 56, mb: 2, color: '#10b981' }} />
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: '#059669' }}>
              Check Your Email!
            </Typography>
            <Typography variant="body2" sx={{ color: isLight ? '#64748b' : '#94a3b8', mb: 1, lineHeight: 1.7 }}>
              If an account with <strong>{email}</strong> exists, a password reset link has been sent.
              Check your inbox and spam folder.
            </Typography>
            <Typography variant="caption" sx={{ color: isLight ? '#94a3b8' : '#64748b', display: 'block', mb: 3 }}>
              The link expires in <strong>30 minutes</strong>.
            </Typography>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                fullWidth
                sx={{
                  py: 1.3, fontWeight: 600, borderRadius: 2, textTransform: 'none',
                  borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.15)',
                  color: isLight ? '#0f172a' : '#f8fafc',
                  '&:hover': { borderColor: '#6366f1', color: '#6366f1' }
                }}
              >
                Back to Sign In
              </Button>
            </Link>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#94a3b8', fontSize: 20 }} />
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

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              endIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{
                py: 1.5, fontWeight: 700, fontSize: '0.95rem', borderRadius: 2,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: '0 6px 20px rgba(99,102,241,0.4)',
                textTransform: 'none',
                '&:hover': { background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)' }
              }}
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
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
        )}
      </Box>
    </Box>
  );
}
