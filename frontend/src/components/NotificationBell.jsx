import { useState, useEffect, useCallback } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography, List, ListItem,
  ListItemIcon, ListItemText, Divider, Chip, Button, Tooltip,
  Fade, CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsNone,
  Warning as WarningIcon,
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  Schedule as ScheduleIcon,
  DoneAll as DoneAllIcon,
  FiberManualRecord as DotIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';

const NOTIFICATION_TYPES = {
  OVERDUE: { color: '#ef4444', icon: WarningIcon, label: 'Overdue' },
  DUE_TODAY: { color: '#f59e0b', icon: ScheduleIcon, label: 'Due Today' },
  ASSIGNED: { color: '#6366f1', icon: TaskIcon, label: 'Assigned' },
  COMPLETED: { color: '#22c55e', icon: CompletedIcon, label: 'Completed' },
};

export default function NotificationBell() {
  const { user, isAdmin } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    const saved = localStorage.getItem('read_notification_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const open = Boolean(anchorEl);

  const generateNotifications = useCallback((tasks, projects = []) => {
    const notifs = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Project Deadline Notifications (Admin & Team Members)
    projects.forEach((proj) => {
      if (!proj.deadline) return;
      if (!isAdmin && user?.employeeId) {
        if (!Array.isArray(proj.employeeIds) || !proj.employeeIds.includes(user.employeeId)) {
          return;
        }
      }

      const dateStr = typeof proj.deadline === 'string' && !proj.deadline.includes('T') ? `${proj.deadline}T00:00:00` : proj.deadline;
      const deadlineDate = new Date(dateStr);
      deadlineDate.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      if (proj.status !== 'COMPLETED') {
        if (deadlineDate < today) {
          notifs.push({
            id: `proj-overdue-${proj.id}`,
            type: 'OVERDUE',
            title: '🚨 Project Overdue Alert',
            message: `Project "${proj.name}" passed deadline on ${proj.deadline}`,
            time: proj.deadline,
          });
        } else if (diffDays <= 5) {
          notifs.push({
            id: `proj-deadline-${proj.id}`,
            type: 'DUE_TODAY',
            title: '⏰ Project Deadline Near',
            message: `Project "${proj.name}" deadline is ${diffDays === 0 ? 'today' : `in ${diffDays} day${diffDays > 1 ? 's' : ''}`}`,
            time: proj.deadline,
          });
        }
      }
    });

    tasks.forEach((task) => {
      if (!task.dueDate) return;
      const dateStr = typeof task.dueDate === 'string' && !task.dueDate.includes('T') ? `${task.dueDate}T00:00:00` : task.dueDate;
      const dueDate = new Date(dateStr);
      dueDate.setHours(0, 0, 0, 0);

      if (task.status === 'COMPLETED') {
        notifs.push({
          id: `completed-${task.id}`,
          type: 'COMPLETED',
          title: 'Task Completed',
          message: `"${task.title}" has been completed`,
          time: task.dueDate,
          taskId: task.id,
        });
      } else if (dueDate < today) {
        notifs.push({
          id: `overdue-${task.id}`,
          type: 'OVERDUE',
          title: 'Overdue Task',
          message: `"${task.title}" was due on ${task.dueDate}`,
          time: task.dueDate,
          taskId: task.id,
        });
      } else if (dueDate.getTime() === today.getTime()) {
        notifs.push({
          id: `due-today-${task.id}`,
          type: 'DUE_TODAY',
          title: 'Due Today',
          message: `"${task.title}" is due today`,
          time: task.dueDate,
          taskId: task.id,
        });
      } else {
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
          notifs.push({
            id: `assigned-${task.id}`,
            type: 'ASSIGNED',
            title: 'Upcoming Deadline',
            message: `"${task.title}" is due in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
            time: task.dueDate,
            taskId: task.id,
          });
        }
      }
    });

    const priority = { OVERDUE: 0, DUE_TODAY: 1, ASSIGNED: 2, COMPLETED: 3 };
    notifs.sort((a, b) => priority[a.type] - priority[b.type]);

    return notifs;
  }, [user, isAdmin]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const taskParams = user.employeeId
        ? `?employeeId=${user.employeeId}&size=50&sortDir=desc`
        : '?size=50&sortDir=desc';
      
      const [tasksRes, projsRes] = await Promise.all([
        api.get(`/tasks${taskParams}`),
        api.get('/projects?size=50')
      ]);

      const tasks = tasksRes.data.content || [];
      const projects = projsRes.data.content || [];

      setNotifications(generateNotifications(tasks, projects));
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [user, generateNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const markAllRead = () => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    localStorage.setItem('read_notification_ids', JSON.stringify(allIds));
  };

  const markAsRead = (id) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      localStorage.setItem('read_notification_ids', JSON.stringify(updated));
    }
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={{
            position: 'relative',
            color: (theme) => theme.palette.mode === 'light' ? '#475569' : '#94a3b8',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.08)',
              color: (theme) => theme.palette.mode === 'light' ? '#0f172a' : '#f8fafc',
              bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                fontWeight: 700,
                minWidth: 18,
                height: 18,
                animation: unreadCount > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1) translate(50%, -50%)' },
                  '50%': { transform: 'scale(1.15) translate(50%, -50%)' },
                },
              },
            }}
          >
            {unreadCount > 0 ? (
              <NotificationsIcon sx={{ fontSize: 20 }} />
            ) : (
              <NotificationsNone sx={{ fontSize: 20 }} />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Fade}
        transitionDuration={250}
        slotProps={{
          paper: {
            sx: {
              width: 380,
              maxHeight: 480,
              borderRadius: 3,
              overflow: 'hidden',
              mt: 1,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              border: '1px solid',
              borderColor: 'divider',
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <NotificationsIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography variant="subtitle1" fontWeight={700}>
              Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={unreadCount}
                color="error"
                size="small"
                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700 }}
              />
            )}
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
              onClick={markAllRead}
              sx={{ textTransform: 'none', fontSize: '0.8rem' }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notification List */}
        <Box sx={{ overflowY: 'auto', maxHeight: 400 }}>
          {loading && notifications.length === 0 ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : notifications.length === 0 ? (
            <Box py={5} textAlign="center">
              <NotificationsNone sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
              <Typography variant="caption" color="text.disabled">
                You're all caught up!
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {notifications.map((notif, index) => {
                const config = NOTIFICATION_TYPES[notif.type];
                const IconComp = config.icon;
                const isRead = readIds.includes(notif.id);

                return (
                  <Box key={notif.id}>
                    <ListItem
                      onClick={() => markAsRead(notif.id)}
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        cursor: 'pointer',
                        bgcolor: isRead ? 'transparent' : 'action.hover',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          bgcolor: 'action.selected',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 44 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: `${config.color}18`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComp sx={{ fontSize: 20, color: config.color }} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={0.5}>
                            {!isRead && (
                              <DotIcon sx={{ fontSize: 10, color: 'primary.main' }} />
                            )}
                            <Typography variant="body2" fontWeight={isRead ? 400 : 700}>
                              {notif.title}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {notif.message}
                          </Typography>
                        }
                      />
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          ml: 1,
                          height: 22,
                          fontSize: '0.65rem',
                          fontWeight: 600,
                          bgcolor: `${config.color}20`,
                          color: config.color,
                          border: `1px solid ${config.color}40`,
                        }}
                      />
                    </ListItem>
                    {index < notifications.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </Box>
                );
              })}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
