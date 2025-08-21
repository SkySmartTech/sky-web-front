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
  Typography,
  CircularProgress,
  Button
} from "@mui/material";
import { User } from "../../../types/userManagementTypes";
interface UserManagementTableProps {
  users: User[];
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
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
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : (
          <Table
            sx={(theme) => ({
              borderCollapse: 'collapse',
              '& td, & th': {
                border: `1px solid ${theme.palette.divider}`,
                textAlign: 'center', 
                verticalAlign: 'middle',
              }
            })}>
            <TableHead >
              <TableRow>
                {[
                  "ID",
                  "Name",
                  "Username",
                  "Email",
                  "User Role",
                  "Password",
                  "Edit",
                  "Delete"
                ].map((header) => (
                  <TableCell key={header}
                    sx={(theme) => ({
                      fontWeight: 'bold',
                      backgroundColor: theme.palette.background.default, // use theme paper color
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`,
                    })}
                    align="center" >
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
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.user_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.user_role}</TableCell>
                    <TableCell>{user.password ? "********" : ""}</TableCell>
                    <TableCell sx={{ p: 0, backgroundColor: (theme) => theme.palette.warning.light }}>
                      <Button
                        onClick={() => handleEdit(user.id!)}
                        variant="text"
                        sx={{
                          flex: 1,
                          height: '100%',
                          width: '100%',
                          borderRadius: 0,
                          minWidth: 80,
                          color: (theme) => theme.palette.warning.contrastText,
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                    <TableCell sx={{ p: 0, backgroundColor: (theme) => theme.palette.error.main }}>
                      <Button
                        onClick={() => handleDelete(user.id!)}
                        variant="text"
                        sx={{
                          height: "100%",
                          width: "100%",
                          borderRadius: 0,
                          minWidth: 50,
                          color: (theme) => theme.palette.warning.contrastText,
                          padding: "2px",
                        }}
                      >
                        Delete
                      </Button>
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