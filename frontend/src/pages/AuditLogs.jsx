import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, TextField,
  MenuItem, Chip, CircularProgress, Alert, Paper, InputAdornment
} from '@mui/material';
import { History, Search, FilterList } from '@mui/icons-material';
import api from '../api/axiosInstance';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [query, setQuery] = useState('');
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, entityType, action]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: rowsPerPage.toString(),
      });
      if (query) params.append('query', query);
      if (entityType) params.append('entityType', entityType);
      if (action) params.append('action', action);

      const res = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
      setError('');
    } catch {
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  const getActionColor = (act) => {
    switch (act) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'info';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" alignItems="center" gap={1.5}>
        <History color="primary" sx={{ fontSize: 36 }} />
        <Box>
          <Typography variant="h4">System Audit Logs</Typography>
          <Typography variant="body2" color="text.secondary">
            Track all user actions, data modifications, and security events.
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearchSubmit} display="grid" gridTemplateColumns={{ xs: '1fr', sm: '2fr 1fr 1fr' }} gap={2}>
            <TextField
              placeholder="Search details or user..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
              }}
            />
            <TextField
              select
              label="Entity Type"
              value={entityType}
              onChange={(e) => { setEntityType(e.target.value); setPage(0); }}
              size="small"
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">All Entities</MenuItem>
              <MenuItem value="EMPLOYEE">Employee</MenuItem>
              <MenuItem value="PROJECT">Project</MenuItem>
              <MenuItem value="TASK">Task</MenuItem>
              <MenuItem value="USER">User</MenuItem>
            </TextField>
            <TextField
              select
              label="Action"
              value={action}
              onChange={(e) => { setAction(e.target.value); setPage(0); }}
              size="small"
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">All Actions</MenuItem>
              <MenuItem value="CREATE">CREATE</MenuItem>
              <MenuItem value="UPDATE">UPDATE</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 700 }}>Timestamp</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Action</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Entity Type</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Entity ID</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Performed By</TableCell>
                <TableCell style={{ fontWeight: 700 }}>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                    No audit log records found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip label={log.action} color={getActionColor(log.action)} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{log.entityType}</TableCell>
                    <TableCell>{log.entityId || '-'}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{log.performedBy || 'System'}</TableCell>
                    <TableCell sx={{ fontSize: '0.85rem' }}>{log.details}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </TableContainer>
    </Box>
  );
}
