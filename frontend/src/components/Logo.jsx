import { Box, Typography } from '@mui/material';

export default function Logo({ size = 'medium', mode = 'dark', showSubtitle = true }) {
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const iconSize = isLarge ? 48 : isSmall ? 32 : 38;
  const titleSize = isLarge ? '1.5rem' : isSmall ? '1rem' : '1.15rem';
  const subtitleSize = isLarge ? '0.78rem' : isSmall ? '0.62rem' : '0.68rem';

  return (
    <Box display="flex" alignItems="center" gap={isLarge ? 2 : 1.5}>
      {/* Formal Executive SVG Emblem Logo */}
      <Box
        sx={{
          width: iconSize,
          height: iconSize,
          borderRadius: isLarge ? '14px' : '10px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #0ea5e9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(79, 70, 229, 0.35)',
          flexShrink: 0,
          p: '6px'
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.8"
          />
        </svg>
      </Box>

      {/* Brand Typography */}
      <Box>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 800,
            fontSize: titleSize,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            color: mode === 'dark' ? '#ffffff' : '#0f172a'
          }}
        >
          SMART ENTERPRISE
        </Typography>
        {showSubtitle && (
          <Typography
            variant="caption"
            sx={{
              fontSize: subtitleSize,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'block',
              mt: '2px',
              color: mode === 'dark' ? '#94a3b8' : '#475569'
            }}
          >
            Project &amp; Employee Management
          </Typography>
        )}
      </Box>
    </Box>
  );
}
