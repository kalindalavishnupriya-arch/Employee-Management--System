import {
  Box, Card, CardContent, Typography, Divider, Switch, FormControlLabel, Grid, Chip
} from '@mui/material';
import { Brightness4, Brightness7, Palette, Info } from '@mui/icons-material';

export default function SettingsPage({ mode, onToggleMode }) {
  const isLight = mode === 'light';

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your application preferences.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Palette sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={700}>
                  Appearance
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              {/* Theme toggle */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
                  bgcolor: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)'
                }}
              >
                <Box display="flex" alignItems="center" gap={1.5}>
                  {isLight
                    ? <Brightness4 sx={{ color: '#4f46e5' }} />
                    : <Brightness7 sx={{ color: '#fbbf24' }} />
                  }
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      Dark Mode
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {isLight ? 'Currently using light theme' : 'Currently using dark theme'}
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  checked={mode === 'dark'}
                  onChange={onToggleMode}
                  color="primary"
                />
              </Box>

              {/* Current theme indicator */}
              <Box mt={2} display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">Active theme:</Typography>
                <Chip
                  label={isLight ? 'Light' : 'Dark'}
                  size="small"
                  color={isLight ? 'default' : 'primary'}
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* About */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Info sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={700}>
                  About
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box display="flex" flexDirection="column" gap={2}>
                {[
                  { label: 'Application', value: 'Smart Enterprise' },
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Platform', value: 'React + Spring Boot' },
                  { label: 'License', value: 'Internal Use' },
                ].map((item) => (
                  <Box key={item.label} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
