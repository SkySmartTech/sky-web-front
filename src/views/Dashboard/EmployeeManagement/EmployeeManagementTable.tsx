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

import { Employee } from "../../../types/employeeManagementTypes";
interface EmployeeManagementTableProps {
    employees: Employee[];
    handleEdit: (id: string) => void;
    handleDelete: (id: string) => void;
    loading: boolean;
}

const EmployeeManagementTable: React.FC<EmployeeManagementTableProps> = ({
    employees = [],
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
                                    "First Name",
                                    "Last Name",
                                    "Job Title",
                                    "Department",
                                    "Email",
                                    "Phone",
                                    
                                    "Actions"
                                ].map((header) => (
                                    <TableCell key={header} sx={{ fontWeight: "bold" }}>
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(employees) && employees.length > 0 ? (
                                employees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>{employee.id}</TableCell>
                                        <TableCell>{employee.firstName}</TableCell>
                                        <TableCell>{employee.lastName}</TableCell>
                                        <TableCell>{employee.job_title}</TableCell>
                                        <TableCell>{employee.department}</TableCell>
                                        <TableCell>{employee.email}</TableCell>
                                        <TableCell>{employee.phone}</TableCell>


                                        {/* <TableCell>
                      <IconButton onClick={() => handleEdit(employee.id!)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(employee.id!)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell> */}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        No employees available.
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

export default EmployeeManagementTable;