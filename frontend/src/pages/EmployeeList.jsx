import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Button, TextField, MenuItem, IconButton, Chip, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Avatar
} from '@mui/material';
import { Add, Search, Edit, Delete, FilterList, Person } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import EmployeeModal from '../components/EmployeeModal';

export default function EmployeeList() {
  const { user, isAdmin } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [alertMsg, setAlertMsg] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage, department, status, sortBy, sortDir]);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams({
        page,
        size: rowsPerPage,
        sortBy,
        sortDir
      });
      if (searchQuery) params.append('query', searchQuery);
      if (department) params.append('department', department);
      if (status) params.append('status', status);

      const res = await api.get(`/employees?${params.toString()}`);
      setEmployees(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setAlertMsg('Failed to load employees');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchEmployees();
  };

  const handleSort = (property) => {
    const isAsc = sortBy === property && sortDir === 'asc';
    setSortDir(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  const handleOpenAddModal = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setSelectedEmployee(emp);
    setModalOpen(true);
  };

  const handleSaveEmployee = async (formData) => {
    let res;
    if (selectedEmployee) {
      res = await api.put(`/employees/${selectedEmployee.id}`, formData);
      setAlertMsg('Employee updated successfully!');
    } else {
      res = await api.post('/employees', formData);
      setAlertMsg('Employee added successfully!');
    }
    fetchEmployees();
    return res.data;
  };

  const handleDeleteClick = (emp) => {
    setEmployeeToDelete(emp);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await api.delete(`/employees/${employeeToDelete.id}`);
      setAlertMsg('Employee deleted');
      setDeleteDialogOpen(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Employee Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage organization members, departments, and roles
          </Typography>
        </Box>

        {/* HIDE Add Employee button for non-Admin users */}
        {isAdmin && (
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddModal}>
            Add Employee
          </Button>
        )}
      </Box>

      {alertMsg && (
        <Alert severity="success" onClose={() => setAlertMsg('')} sx={{ mb: 2 }}>
          {alertMsg}
        </Alert>
      )}

      {/* Filter Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSearchSubmit} display="grid" gridTemplateColumns={{ xs: '1fr', sm: '2fr 1fr 1fr 1fr' }} gap={2}>
            <TextField
              label="Search Employees"
              placeholder="Search by name, email, designation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              select
              label="Department"
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(0); }}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">All Departments</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Marketing">Marketing</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
              <MenuItem value="Operations">Operations</MenuItem>
            </TextField>
            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="On Leave">On Leave</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
            <Button type="submit" variant="contained" color="secondary" startIcon={<FilterList />}>
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'id'}
                    direction={sortBy === 'id' ? sortDir : 'asc'}
                    onClick={() => handleSort('id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'firstName'}
                    direction={sortBy === 'firstName' ? sortDir : 'asc'}
                    onClick={() => handleSort('firstName')}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined Date</TableCell>

                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    No employees found matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>#{emp.id}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          src={emp.profileImageUrl}
                          sx={{ width: 48, height: 48, fontSize: '1.2rem', bgcolor: 'primary.main', fontWeight: 700, boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
                        >
                          {emp.firstName ? emp.firstName.charAt(0).toUpperCase() : 'E'}
                        </Avatar>
                        <Typography fontWeight={600}>{emp.firstName} {emp.lastName}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell><Chip label={emp.department || 'General'} size="small" variant="outlined" /></TableCell>
                    <TableCell>{emp.designation || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={emp.status || 'Active'}
                        color={emp.status === 'Active' ? 'success' : emp.status === 'On Leave' ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{emp.joinedDate || 'N/A'}</TableCell>

                    <TableCell align="right">
                      {(isAdmin || (user?.employeeId && emp.id === user.employeeId)) && (
                        <IconButton color="primary" onClick={() => handleOpenEditModal(emp)} title={isAdmin ? "Edit Employee" : "Edit My Profile"}>
                          <Edit />
                        </IconButton>
                      )}
                      {isAdmin && (
                        <IconButton color="error" onClick={() => handleDeleteClick(emp)} title="Delete Employee">
                          <Delete />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Card>

      {/* Employee Modal */}
      {modalOpen && (
        <EmployeeModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveEmployee}
          initialData={selectedEmployee}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete employee <strong>{employeeToDelete?.firstName} {employeeToDelete?.lastName}</strong>?
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
