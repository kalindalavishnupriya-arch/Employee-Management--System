import { createTheme } from '@mui/material/styles';

export const getAppTheme = (mode = 'dark') =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5', contrastText: '#ffffff' },
            secondary: { main: '#0ea5e9', light: '#38bdf8', dark: '#0284c7', contrastText: '#ffffff' },
            background: {
              default: '#0b0f19',
              paper: '#111827'
            },
            text: { primary: '#f9fafb', secondary: '#9ca3af' },
            action: {
              active: '#9ca3af',
              hover: 'rgba(255, 255, 255, 0.08)',
              selected: 'rgba(99, 102, 241, 0.16)'
            },
            success: { main: '#10b981' },
            warning: { main: '#f59e0b' },
            error: { main: '#ef4444' },
            info: { main: '#3b82f6' }
          }
        : {
            primary: { main: '#4f46e5', light: '#6366f1', dark: '#3730a3', contrastText: '#ffffff' },
            secondary: { main: '#0284c7', light: '#38bdf8', dark: '#0369a1', contrastText: '#ffffff' },
            background: {
              default: '#f1f5f9',
              paper: '#ffffff'
            },
            text: { primary: '#0f172a', secondary: '#475569' },
            action: {
              active: '#475569',
              hover: 'rgba(15, 23, 42, 0.04)',
              selected: 'rgba(79, 70, 229, 0.12)'
            },
            success: { main: '#059669' },
            warning: { main: '#d97706' },
            error: { main: '#dc2626' },
            info: { main: '#2563eb' }
          })
    },
    shape: {
      borderRadius: 12
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 800, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' }
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            backgroundImage: 'none',
            boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.35)' : '0 4px 16px rgba(15, 23, 42, 0.06)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              boxShadow: mode === 'dark' ? '0 8px 30px rgba(0, 0, 0, 0.45)' : '0 8px 24px rgba(15, 23, 42, 0.09)'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 20px',
            fontWeight: 600,
            boxShadow: 'none',
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
              transform: 'translateY(-1px)'
            }
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#ffffff',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #3730a3)'
            }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8
          },
          filledDefault: {
            backgroundColor: mode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)',
            color: mode === 'light' ? '#1e293b' : '#f8fafc'
          },
          outlinedDefault: {
            borderColor: mode === 'light' ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)',
            color: mode === 'light' ? '#334155' : '#94a3b8'
          }
        }
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#334155' : '#94a3b8',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.08)',
              color: mode === 'light' ? '#0f172a' : '#f8fafc'
            }
          },
          colorPrimary: {
            color: mode === 'light' ? '#4f46e5' : '#818cf8',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(129, 140, 248, 0.16)'
            }
          },
          colorError: {
            color: mode === 'light' ? '#dc2626' : '#ef4444',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(239, 68, 68, 0.16)'
            }
          }
        }
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            color: mode === 'light' ? '#334155' : '#9ca3af',
            '&.Mui-focused': {
              color: mode === 'light' ? '#4f46e5' : '#818cf8'
            }
          }
        }
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#475569' : '#94a3b8',
            '& .MuiSvgIcon-root': {
              color: mode === 'light' ? '#475569' : '#94a3b8'
            }
          }
        }
      },
      MuiTableSortLabel: {
        styleOverrides: {
          root: {
            color: mode === 'light' ? '#1e293b' : '#f8fafc',
            '&:hover': {
              color: mode === 'light' ? '#4f46e5' : '#818cf8'
            },
            '&.Mui-active': {
              color: mode === 'light' ? '#4f46e5' : '#818cf8',
              '& .MuiTableSortLabel-icon': {
                color: mode === 'light' ? '#4f46e5' : '#818cf8'
              }
            }
          },
          icon: {
            color: mode === 'light' ? '#64748b' : '#94a3b8'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none'
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: mode === 'light' ? '0 20px 40px rgba(15, 23, 42, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #cbd5e1'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 700,
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: mode === 'light' ? '#334155' : '#94a3b8',
            backgroundColor: mode === 'light' ? '#f8fafc' : '#111827',
            borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0'
          },
          body: {
            fontSize: '0.9rem',
            color: mode === 'light' ? '#0f172a' : '#f9fafb',
            borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #f1f5f9'
          }
        }
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: mode === 'light' ? '#ffffff' : 'transparent',
            '& fieldset': {
              borderColor: mode === 'light' ? '#cbd5e1' : 'rgba(255, 255, 255, 0.15)'
            },
            '&:hover fieldset': {
              borderColor: mode === 'light' ? '#94a3b8' : 'rgba(255, 255, 255, 0.3)'
            },
            '&.Mui-focused fieldset': {
              borderColor: mode === 'light' ? '#4f46e5' : '#6366f1'
            }
          }
        }
      }
    }
  });

export default getAppTheme;
