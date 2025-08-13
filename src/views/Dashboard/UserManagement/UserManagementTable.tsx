import React from "react";
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Typography,
  CircularProgress
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { User } from "../../../types/userManagementTypes";
interface UserManagementTableProps {
  users: User[];
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  loading: boolean;
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({ 
  users, 
  handleEdit, 
  handleDelete,
  loading 
}) => {
  return (
    <>
      <Typography variant="h6" sx={{ mb: 2 }}>
        User List
      </Typography>
      <TableContainer component={Paper}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "ID",
                  "EPF",
                  "Employee Name",
                  "Username",
                  "Department",
                  "Contact",
                  "Email",
                  "User Type",
                  "Availability",
                  "Actions"
                ].map((header) => (
                  <TableCell key={header} sx={{ fontWeight: "bold" }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.epf}</TableCell>
                    <TableCell>{user.employeeName}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>{user.contact}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.userType}</TableCell>
                    <TableCell>{user.availability ? "Available" : "Unavailable"}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(user.id!)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(user.id!)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    No users available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </>
  );
};

export default UserManagementTable;